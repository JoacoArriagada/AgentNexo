import type {
  Actor,
  CreateJobDto,
  InputFile,
  Job,
  PolicyDto,
  Policy,
  PolicyAmendmentDto,
  Order,
} from "@agentnexo/api-contracts";
import { PUBLIC_DEMO_FILES } from "@agentnexo/api-contracts";
import { Store, id, digest } from "../../shared/database/store.js";
import { ensure } from "../../shared/errors.js";
import { requireRole } from "../context/context.js";

export function validateFiles(files: InputFile[]) {
  let lines = 0;
  let bytes = 0;
  const names = new Set<string>();
  const normalized = files.map((file) => {
    ensure(
      /^[^/\\:]+\.(js|ts)$/.test(file.name) && !file.name.includes(".."),
      415,
      "UNSUPPORTED_FILE",
      "Sólo archivos .js/.ts con nombres simples.",
    );
    ensure(
      !file.content.includes("\0") &&
        !file.content.includes("\ufffd") &&
        !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
          file.content,
        ),
      422,
      "INVALID_TEXT",
      "Los archivos deben contener texto UTF-8 válido sin NUL.",
    );
    ensure(
      !names.has(file.name.toLowerCase()),
      422,
      "DUPLICATE_FILE",
      "Los nombres de archivo deben ser únicos.",
    );
    names.add(file.name.toLowerCase());
    const content = file.content.replace(/\r\n?/g, "\n");
    bytes += Buffer.byteLength(content);
    lines += content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
    return {
      id: id("file"),
      name: file.name,
      content,
      language: file.name.endsWith(".ts")
        ? ("typescript" as const)
        : ("javascript" as const),
    };
  });
  ensure(
    files.length >= 1 && files.length <= 3 && lines <= 1000 && bytes <= 262144,
    413,
    "INPUT_TOO_LARGE",
    "Máximo 3 archivos, 1.000 líneas y 256 KiB en total.",
  );
  return normalized;
}
export const inputDigest = (
  job: Pick<Job, "objective" | "acceptanceCriteria" | "files">,
) =>
  digest({
    objective: job.objective,
    acceptanceCriteria: job.acceptanceCriteria,
    files: job.files.map(({ name, content }) => ({ name, content })),
  });
export class JobService {
  constructor(private store: Store) {}
  get(actor: Actor, jobId: string) {
    const job = this.store.get<Job>("job", jobId);
    ensure(
      job && job.buyerId === actor.id,
      404,
      "NOT_FOUND",
      "La revisión no existe.",
    );
    return job;
  }
  internal(jobId: string) {
    const job = this.store.get<Job>("job", jobId);
    ensure(job, 404, "NOT_FOUND", "La revisión no existe.");
    return job;
  }
  list(actor: Actor, archived = false) {
    requireRole(actor, "buyer");
    return this.store
      .list<Job>("job")
      .filter((job) => job.buyerId === actor.id && job.archived === archived);
  }
  create(actor: Actor, dto: CreateJobDto) {
    requireRole(actor, "buyer");
    let files = validateFiles(dto.files);
    if (dto.context === "public-demo") {
      ensure(
        digest(files.map(({ name, content }) => ({ name, content }))) ===
          digest(
            PUBLIC_DEMO_FILES.map(({ name, content }) => ({ name, content })),
          ),
        422,
        "TOOL_NOT_APPLICABLE",
        "La demo pública usa exclusivamente pricing.ts fijo.",
      );
      files = validateFiles(PUBLIC_DEMO_FILES);
    }
    const job: Job = {
      id: id("job"),
      version: 1,
      buyerId: actor.id,
      title: dto.title,
      objective: dto.objective,
      acceptanceCriteria: dto.acceptanceCriteria,
      files,
      inputDigest: "",
      state: "draft",
      context: dto.context ?? "private-review",
      archived: false,
      createdAt: this.store.now(),
      updatedAt: this.store.now(),
    };
    job.inputDigest = inputDigest(job);
    this.store.save("job", job);
    this.store.event(
      job.id,
      actor.id,
      "job_created",
      "Encargo guardado; todavía sin autorización ni contratación.",
    );
    return job;
  }
  edit(
    actor: Actor,
    jobId: string,
    dto: Partial<CreateJobDto> & { expectedVersion: number },
  ) {
    const job = this.get(actor, jobId);
    ensure(
      !job.orderId &&
        ["draft", "awaiting_authorization", "ready"].includes(job.state),
      409,
      "INPUT_LOCKED",
      "La entrada contratada no puede modificarse.",
    );
    ensure(
      job.version === dto.expectedVersion,
      412,
      "VERSION_CONFLICT",
      "El encargo cambió.",
    );
    ensure(
      job.context !== "public-demo" || !dto.files,
      409,
      "FIXTURE_LOCKED",
      "El fixture público es fijo.",
    );
    const next = {
      ...job,
      title: dto.title ?? job.title,
      objective: dto.objective ?? job.objective,
      acceptanceCriteria: dto.acceptanceCriteria ?? job.acceptanceCriteria,
      files: dto.files ? validateFiles(dto.files) : job.files,
      version: job.version + 1,
      state: "draft" as const,
      policy: undefined,
      authorizationId: undefined,
      updatedAt: this.store.now(),
    };
    next.inputDigest = inputDigest(next);
    this.store.save("job", next);
    this.store.event(
      job.id,
      actor.id,
      "input_changed",
      "Entrada modificada; la aceptación anterior queda invalidada.",
    );
    return next;
  }
  policy(actor: Actor, jobId: string, dto: PolicyDto) {
    const job = this.get(actor, jobId);
    ensure(
      job.version === dto.expectedVersion,
      412,
      "VERSION_CONFLICT",
      "El encargo cambió.",
    );
    ensure(
      !job.orderId,
      409,
      "INPUT_LOCKED",
      "La política contratada está congelada.",
    );
    if (job.context === "private-review") {
      ensure(
        dto.mode === "reviewer",
        422,
        "PROFILE_NOT_APPLICABLE",
        "El perfil experimental de dos roles requiere el fixture público fijo.",
      );
      ensure(
        !dto.allowTools &&
          dto.toolLimitMinor === "0" &&
          dto.feeLimitMinor === "0",
        422,
        "TOOLS_NOT_AUTHORIZED",
        "Los archivos propios no admiten herramientas A/B ni comisiones.",
      );
    }
    ensure(
      !dto.allowTools ||
        (job.context === "public-demo" && dto.mode === "two-role-demo"),
      422,
      "TOOL_NOT_APPLICABLE",
      "A/B sólo se permiten en el ensayo público de dos roles.",
    );
    const prior = this.store
      .list<{ id: string; jobId: string; version: number }>("policy")
      .filter((policy) => policy.jobId === job.id);
    const value: Policy = {
      version:
        prior.reduce((max, entry) => Math.max(max, entry.version), 0) + 1,
      digest: "",
      inputDigest: job.inputDigest,
      mode: dto.mode,
      modelLimitMinor: dto.modelLimitMinor,
      toolLimitMinor: dto.toolLimitMinor,
      feeLimitMinor: dto.feeLimitMinor,
      maxOperationMinor: dto.maxOperationMinor,
      allowTools: dto.allowTools,
      accepted: false,
      deadlines: {
        startMinutes: 30,
        deliveryMinutes: 15,
        acceptanceHours: 48,
        disputeDays: 7,
      },
    };
    value.digest = digest(value);
    this.store.save("policy", {
      ...value,
      id: `${job.id}:${value.version}`,
      jobId: job.id,
    });
    job.policy = value;
    job.authorizationId = undefined;
    job.state = "awaiting_authorization";
    job.version++;
    job.updatedAt = this.store.now();
    this.store.save("job", job);
    this.store.event(
      job.id,
      actor.id,
      "policy_created",
      `Política ${value.version} creada; requiere aceptación explícita.`,
    );
    return { job, policy: value };
  }
  authorize(
    actor: Actor,
    jobId: string,
    dto: { policyVersion: number; policyDigest: string; accept: true },
  ) {
    const job = this.get(actor, jobId);
    if (job.orderId && job.pendingPolicy) {
      const policy = job.pendingPolicy;
      ensure(
        policy.version === dto.policyVersion &&
          policy.digest === dto.policyDigest &&
          policy.inputDigest === job.inputDigest,
        409,
        "POLICY_CHANGED",
        "La ampliación o entrada cambió.",
      );
      const order = this.store.get<Order>("order", job.orderId)!;
      ensure(
        !["paid", "refunded"].includes(order.escrowState),
        409,
        "ORDER_CLOSED",
        "No se amplía una contratación cerrada.",
      );
      const authorizationId = id("authorization");
      this.store.save("authorization", {
        id: authorizationId,
        jobId: job.id,
        buyerId: actor.id,
        policyVersion: policy.version,
        digest: policy.digest,
        createdAt: this.store.now(),
        amendmentId: job.amendmentId,
      });
      const amendment = this.store.get<{ id: string; status: string }>(
        "amendment",
        job.amendmentId!,
      )!;
      amendment.status = "accepted";
      this.store.save("amendment", {
        ...amendment,
        authorizationId,
        acceptedAt: this.store.now(),
      });
      job.policy = { ...policy, accepted: true };
      job.pendingPolicy = undefined;
      job.authorizationId = authorizationId;
      job.version++;
      job.updatedAt = this.store.now();
      this.store.save("job", job);
      this.store.event(
        job.id,
        actor.id,
        "policy_amendment_authorized",
        `Ampliación ${policy.version} aceptada; sin cambiar precio, alcance o vencimientos.`,
      );
      return { authorizationId, job };
    }
    ensure(
      !job.orderId &&
        job.policy &&
        job.policy.version === dto.policyVersion &&
        job.policy.digest === dto.policyDigest &&
        job.policy.inputDigest === job.inputDigest,
      409,
      "POLICY_CHANGED",
      "La política o entrada cambió.",
    );
    if (!job.authorizationId) {
      job.authorizationId = id("authorization");
      this.store.save("authorization", {
        id: job.authorizationId,
        jobId: job.id,
        buyerId: actor.id,
        policyVersion: job.policy.version,
        digest: job.policy.digest,
        createdAt: this.store.now(),
      });
    }
    job.policy.accepted = true;
    job.state = "ready";
    job.version++;
    job.updatedAt = this.store.now();
    this.store.save("job", job);
    this.store.event(
      job.id,
      actor.id,
      "policy_authorized",
      `Política ${job.policy.version} aceptada; no inicia consumo.`,
    );
    return { authorizationId: job.authorizationId, job };
  }
  amend(actor: Actor, jobId: string, dto: PolicyAmendmentDto) {
    const job = this.get(actor, jobId);
    ensure(
      job.version === dto.expectedVersion,
      412,
      "VERSION_CONFLICT",
      "El encargo cambió.",
    );
    ensure(
      job.orderId && job.policy?.accepted && !job.contentDeleted,
      409,
      "NOT_CONTRACTED",
      "La ampliación requiere una contratación vigente.",
    );
    const order = this.store.get<Order>("order", job.orderId)!;
    ensure(
      !["paid", "refunded"].includes(order.escrowState),
      409,
      "ORDER_CLOSED",
      "No se amplía una contratación cerrada.",
    );
    const fields = [
      "modelLimitMinor",
      "toolLimitMinor",
      "feeLimitMinor",
      "maxOperationMinor",
    ] as const;
    ensure(
      fields.every(
        (field) => BigInt(dto[field]) >= BigInt(job.policy![field]),
      ) && fields.some((field) => dto[field] !== job.policy![field]),
      422,
      "EXPANSION_REQUIRED",
      "Sólo se permite ampliar límites; no reducir compromisos ni reenviar la misma política.",
    );
    if (job.context === "private-review")
      ensure(
        dto.toolLimitMinor === "0" && dto.feeLimitMinor === "0",
        422,
        "TOOLS_NOT_AUTHORIZED",
        "Una ampliación no habilita herramientas para archivos propios.",
      );
    const revisions = this.store
      .list<{ jobId: string; version: number }>("policy")
      .filter((policy) => policy.jobId === job.id);
    const policy: Policy = {
      ...structuredClone(job.policy),
      version:
        revisions.reduce((max, entry) => Math.max(max, entry.version), 0) + 1,
      digest: "",
      accepted: false,
      modelLimitMinor: dto.modelLimitMinor,
      toolLimitMinor: dto.toolLimitMinor,
      feeLimitMinor: dto.feeLimitMinor,
      maxOperationMinor: dto.maxOperationMinor,
    };
    policy.digest = digest(policy);
    const amendmentId = id("amendment");
    this.store.save("amendment", {
      id: amendmentId,
      jobId: job.id,
      basePolicyVersion: job.policy.version,
      basePolicyDigest: job.policy.digest,
      policy,
      status: "pending",
      createdAt: this.store.now(),
      actorId: actor.id,
    });
    this.store.save("policy", {
      ...policy,
      id: `${job.id}:${policy.version}`,
      jobId: job.id,
    });
    job.pendingPolicy = policy;
    job.amendmentId = amendmentId;
    job.version++;
    job.updatedAt = this.store.now();
    this.store.save("job", job);
    this.store.event(
      job.id,
      actor.id,
      "policy_amendment_proposed",
      `Ampliación ${policy.version} propuesta; límites previos siguen efectivos hasta aceptación.`,
    );
    return { job, policy, amendmentId };
  }
  remove(actor: Actor, jobId: string, expectedVersion: number) {
    const job = this.get(actor, jobId);
    ensure(
      job.version === expectedVersion,
      412,
      "VERSION_CONFLICT",
      "El encargo cambió.",
    );
    ensure(
      !job.orderId &&
        ["draft", "ready", "awaiting_authorization"].includes(job.state),
      409,
      "HAS_COMMITMENTS",
      "Sólo se elimina un borrador sin compromisos.",
    );
    this.store.remove("job", jobId);
    return null;
  }
  archive(actor: Actor, jobId: string, archived: boolean) {
    const job = this.get(actor, jobId);
    ensure(
      !archived ||
        ["completed", "partial", "failed", "cancelled"].includes(job.state),
      409,
      "INVALID_STATE",
      "Sólo se archiva una ejecución terminada.",
    );
    job.archived = archived;
    job.version++;
    job.updatedAt = this.store.now();
    return this.store.save("job", job);
  }
  deleteContent(actor: Actor, jobId: string) {
    const job = this.get(actor, jobId);
    ensure(
      ["completed", "partial", "failed", "cancelled"].includes(job.state),
      409,
      "INPUT_IN_USE",
      "Detén la ejecución antes de retirar contenido.",
    );
    const order = job.orderId
      ? this.store.get<{ escrowState: string }>("order", job.orderId)
      : undefined;
    ensure(
      !order || ["paid", "refunded"].includes(order.escrowState),
      409,
      "RETENTION_REQUIRED",
      "El contenido se conserva mientras la contratación siga abierta.",
    );
    job.files = [];
    job.objective = "";
    job.acceptanceCriteria = [];
    job.contentDeleted = true;
    job.version++;
    this.store.suppressContent(job.id);
    return this.store.save("job", job);
  }
}
