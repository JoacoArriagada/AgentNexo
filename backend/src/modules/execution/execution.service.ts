import type { Finding, Job, Order } from "@agentnexo/api-contracts";
import { Store, id } from "../../shared/database/store.js";
import { afterMinutes, isBefore } from "../../shared/money.js";
import { analyze } from "./analyzer.js";
import { BudgetService } from "../budgets/budget.service.js";
import { JobService } from "../jobs/job.service.js";
import { OrderService } from "../orders/order.service.js";
import { ReportService } from "../reports/report.service.js";
export interface Task {
  id: string;
  jobId: string;
  role: string;
  state: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  calls: number;
  retries: number;
  deadline: string;
  findings?: Finding[];
}
export type Scenario =
  "normal" | "uncertain" | "delivery_failed" | "price_exceeded";
export class ExecutionService {
  private timer?: ReturnType<typeof setInterval>;
  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  constructor(
    private store: Store,
    private jobs: JobService,
    private budgets: BudgetService,
    private reports: ReportService,
    private orders: OrderService,
    private delay = 250,
  ) {}
  queue(job: Job) {
    const order = this.orders.internal(job.orderId!);
    const roles =
      job.policy!.mode === "reviewer"
        ? ["reviewer"]
        : ["analyst", "test-designer"];
    for (const role of roles)
      if (
        !this.store
          .list<Task>("task")
          .some((task) => task.jobId === job.id && task.role === role)
      )
        this.store.save("task", {
          id: id("task"),
          jobId: job.id,
          role,
          state: "pending",
          calls: 0,
          retries: 0,
          deadline: afterMinutes(order.startedAt!, 10),
        } satisfies Task);
  }
  start() {
    this.store.transaction(() => {
      for (const task of this.store
        .list<Task>("task")
        .filter((task) => task.state === "running")) {
        task.state = "pending";
        this.store.save("task", task);
        this.store.event(
          task.jobId,
          "system",
          "task_recovered",
          "Checkpoint local recuperado; se conserva la identidad de operaciones previas.",
        );
      }
    });
    this.timer = setInterval(() => this.dispatch(), 100);
    this.timer.unref();
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    for (const timer of this.pendingTimers) clearTimeout(timer);
    this.pendingTimers.clear();
  }
  dispatch() {
    const running = this.store
      .list<Task>("task")
      .filter((task) => task.state === "running").length;
    for (const task of this.store
      .list<Task>("task")
      .filter((task) => task.state === "pending")
      .slice(0, Math.max(0, 2 - running))) {
      const job = this.jobs.internal(task.jobId);
      if (
        !["queued", "running"].includes(job.state) ||
        !isBefore(this.store.now(), task.deadline)
      ) {
        task.state = "cancelled";
        this.store.save("task", task);
        if (["queued", "running"].includes(job.state)) {
          job.state = "failed";
          this.store.save("job", job);
          const order = this.orders.internal(job.orderId!);
          order.executionState = "failed";
          this.store.save("order", order);
          this.store.event(
            job.id,
            "system",
            "execution_deadline",
            "Venció el plazo absoluto de ejecución.",
          );
        }
        continue;
      }
      task.state = "running";
      this.store.save("task", task);
      job.state = "running";
      this.store.save("job", job);
      const order = this.orders.internal(job.orderId!);
      order.executionState = "running";
      this.store.save("order", order);
      const timer = setTimeout(() => {
        this.pendingTimers.delete(timer);
        try {
          this.execute(task.id);
        } catch (error) {
          const failed = this.store.get<Task>("task", task.id)!;
          failed.state = "failed";
          this.store.save("task", failed);
          this.store.event(
            job.id,
            "system",
            "task_failed",
            "La tarea local no pudo completar su contribución.",
          );
          this.finish(job.id);
          console.error(
            "Local task:",
            error instanceof Error ? error.message : "failed",
          );
        }
      }, this.delay);
      this.pendingTimers.add(timer);
    }
  }
  execute(taskId: string) {
    this.store.transaction(() => {
      const task = this.store.get<Task>("task", taskId)!;
      if (["succeeded", "failed", "cancelled"].includes(task.state)) return;
      const job = this.jobs.internal(task.jobId);
      if (
        !["queued", "running"].includes(job.state) ||
        !isBefore(this.store.now(), task.deadline)
      ) {
        task.state = "cancelled";
        this.store.save("task", task);
        return;
      }
      if (task.calls >= 4) {
        task.state = "failed";
        this.store.save("task", task);
        return;
      }
      const model = this.budgets.reserve(
        job,
        "local-reviewer",
        task.role,
        "model",
        "10000000",
        `model:${task.role}`,
      );
      if (model.financialState === "rejected") {
        task.state = "failed";
        this.store.save("task", task);
        this.finish(job.id);
        return;
      }
      if (model.financialState !== "confirmed") {
        task.calls++;
        this.budgets.confirm(model.id);
      }
      const findings = task.findings ?? analyze(job);
      task.findings = findings;
      if (job.policy!.allowTools) {
        const providerId = task.role === "analyst" ? "service-a" : "service-b";
        const config = this.store.get<{
          serviceA?: Scenario;
          serviceB?: Scenario;
        }>("scenario", job.id);
        const scenario =
          (providerId === "service-a" ? config?.serviceA : config?.serviceB) ??
          "normal";
        const operation = this.budgets.reserve(
          job,
          providerId,
          task.role,
          "tool",
          scenario === "price_exceeded" ? "400000" : "300000",
          `tool:${providerId}:${task.role}`,
        );
        if (operation.financialState === "reserved") {
          task.calls++;
          if (scenario === "uncertain") this.budgets.uncertain(operation.id);
          else
            this.budgets.confirm(
              operation.id,
              scenario === "delivery_failed" ? "failed" : "available",
            );
        }
      }
      task.state = "succeeded";
      this.store.save("task", task);
      this.store.event(
        job.id,
        task.role,
        "task_completed",
        `${task.role}: reglas locales completadas; ${findings.length} observaciones.`,
      );
      this.finish(job.id);
    });
  }
  async executeAll(jobId: string) {
    for (const task of this.store
      .list<Task>("task")
      .filter((task) => task.jobId === jobId))
      this.execute(task.id);
  }
  finish(jobId: string) {
    const tasks = this.store
      .list<Task>("task")
      .filter((task) => task.jobId === jobId);
    if (
      !tasks.length ||
      tasks.some((task) => ["running", "pending"].includes(task.state))
    )
      return;
    const job = this.jobs.internal(jobId);
    if (job.state === "cancelled") return;
    const allFindings = tasks
      .filter(
        (task) => task.state === "succeeded" && task.role !== "test-designer",
      )
      .flatMap((task) => task.findings ?? []);
    const report = this.reports.generate(
      job,
      allFindings,
      this.budgets.list(job.id),
      tasks.some((task) => task.state !== "succeeded"),
    );
    job.state = report.status === "partial" ? "partial" : "completed";
    job.updatedAt = this.store.now();
    job.version++;
    this.store.save("job", job);
    this.orders.deliver(job, report.status === "partial");
    this.store.event(
      job.id,
      "system",
      "report_published",
      `Informe ${report.status} publicado con referencias de la entrada.`,
    );
  }
  refreshReport(jobId: string) {
    if (this.jobs.internal(jobId).contentDeleted) return;
    this.finish(jobId);
    return this.reports.get(jobId);
  }
}
