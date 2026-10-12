export type Role = "visitor" | "buyer" | "provider" | "admin";
export type ExecutionState =
  | "draft"
  | "awaiting_authorization"
  | "ready"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "partial"
  | "cancelled"
  | "failed";
export type EscrowState =
  | "unfunded"
  | "funded"
  | "running"
  | "delivered"
  | "disputed"
  | "paid"
  | "refunded";
export type Money = {
  currencyKey: "USD" | "USDC_DEMO" | "XLM_DEMO";
  scale: number;
  minor: string;
};
export interface Actor {
  id: string;
  name: string;
  roles: Role[];
}
export interface Context {
  actors: Actor[];
  mode: "local-demo";
  simulation: true;
}
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; reason: string }[];
  };
}
export interface List<T> {
  items: T[];
}
export interface InputFile {
  id?: string;
  name: string;
  content: string;
  language?: "javascript" | "typescript";
}
export type Profile = "reviewer" | "two-role-demo";
export interface Offer {
  id: string;
  version: number;
  providerId: string;
  providerName: string;
  name: string;
  description: string;
  profile: Profile;
  status: "draft" | "pending" | "approved" | "rejected" | "suspended";
  price: Money;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Policy {
  version: number;
  digest: string;
  inputDigest: string;
  mode: Profile;
  modelLimitMinor: string;
  toolLimitMinor: string;
  feeLimitMinor: string;
  maxOperationMinor: string;
  allowTools: boolean;
  accepted: boolean;
  deadlines: {
    startMinutes: number;
    deliveryMinutes: number;
    acceptanceHours: number;
    disputeDays: number;
  };
}
export interface Job {
  id: string;
  version: number;
  buyerId: string;
  title: string;
  objective: string;
  acceptanceCriteria: string[];
  files: InputFile[];
  inputDigest: string;
  state: ExecutionState;
  context: "private-review" | "public-demo";
  policy?: Policy;
  pendingPolicy?: Policy;
  amendmentId?: string;
  authorizationId?: string;
  orderId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  contentDeleted?: boolean;
}
export interface Order {
  id: string;
  version: number;
  jobId: string;
  buyerId: string;
  providerId: string;
  arbiterId: string;
  offer: Offer;
  policy: Policy;
  price: Money;
  financingState: "pending" | "confirmed" | "rejected" | "uncertain";
  escrowState: EscrowState;
  executionState: ExecutionState;
  deliveryState: "pending" | "available" | "failed";
  createdAt: string;
  fundedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  disputedAt?: string;
  closedAt?: string;
  startDeadline?: string;
  deliveryDeadline?: string;
  acceptanceDeadline?: string;
  disputeDeadline?: string;
  dispute?: {
    reason: string;
    evidence: string;
    response?: string;
    resolution?: string;
  };
  closureReason?: string;
}
export interface BudgetBucket {
  category: "models" | "tools" | "fees" | "contract";
  currencyKey: string;
  scale: number;
  authorized: string;
  reserved: string;
  confirmed: string;
  available: string;
  deficit: string;
}
export interface BudgetView {
  jobId: string;
  financialState: "settled" | "pending" | "over_limit";
  buckets: BudgetBucket[];
}
export interface Payment {
  id: string;
  jobId: string;
  providerId: string;
  role: string;
  kind: "model" | "tool";
  amount: Money;
  financialState:
    | "rejected"
    | "reserved"
    | "prepared"
    | "submitted"
    | "confirmed"
    | "uncertain"
    | "failed";
  deliveryState: "pending" | "available" | "failed";
  reason?: string;
  receipt?: { id: string; simulation: true; createdAt: string };
  createdAt: string;
  logicalKey: string;
}
export interface JobEvent {
  sequence: number;
  type: string;
  message: string;
  actorId: string;
  createdAt: string;
}
export interface Finding {
  id: string;
  fileId: string;
  fileName: string;
  startLine: number;
  endLine: number;
  severity: "high" | "medium" | "low";
  title: string;
  explanation: string;
  evidence: string;
  recommendation: string;
  uncertainty: string;
}
export interface Report {
  jobId: string;
  version: number;
  status: "complete" | "partial";
  createdAt: string;
  summary: string;
  findings: Finding[];
  testCases: {
    id: string;
    title: string;
    description: string;
    expectedResult: string;
    executed: false;
    findingIds: string[];
  }[];
  criteria: {
    criterion: string;
    status: "sustentado" | "no_sustentado" | "no_evaluado";
    evidence: string[];
  }[];
  limitations: string[];
  contributions: {
    providerId: string;
    status: "available" | "failed" | "rejected";
  }[];
}
export interface Provider {
  id: string;
  name: string;
  kind: "model" | "tool";
  description: string;
  price: Money;
  ready: boolean;
  simulation: true;
}
export interface Notification {
  id: string;
  actorId: string;
  jobId?: string;
  orderId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
export interface Preferences {
  timezone: string;
  notificationsEnabled: boolean;
}
export interface OperationsView {
  admissionPaused: boolean;
  spendingPaused: boolean;
  activeJobs: number;
  capacity: number;
  pendingOperations: Payment[];
  disputes: Order[];
}
export interface SalesView {
  items: Order[];
  totals: {
    currencyKey: string;
    scale: number;
    retained: string;
    paid: string;
    refunded: string;
  }[];
}
export interface CreateJobDto {
  title: string;
  objective: string;
  acceptanceCriteria: string[];
  files: InputFile[];
  context?: Job["context"];
}
export interface PolicyDto {
  expectedVersion: number;
  mode: Profile;
  modelLimitMinor: string;
  toolLimitMinor: string;
  feeLimitMinor: string;
  maxOperationMinor: string;
  allowTools: boolean;
}
export interface CreateOfferDto {
  name: string;
  description: string;
  profile: Profile;
  priceMinor: string;
}
export interface CreateOrderDto {
  jobId: string;
  offerId: string;
  offerVersion: number;
  authorizationId: string;
}
export interface WithdrawOfferDto {
  expectedVersion: number;
  reason: string;
}
export interface PolicyAmendmentDto {
  expectedVersion: number;
  modelLimitMinor: string;
  toolLimitMinor: string;
  feeLimitMinor: string;
  maxOperationMinor: string;
}
export const PUBLIC_DEMO_FILES: InputFile[] = [
  {
    name: "pricing.ts",
    language: "typescript",
    content:
      "export function total(price: number, quantity: number, discount: number) {\n  return price * quantity - discount;\n}\n",
  },
];
