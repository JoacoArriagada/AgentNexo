import { ensure } from "./errors.js";
export function amount(value: string): bigint {
  ensure(
    /^(0|[1-9]\d*)$/.test(value),
    422,
    "INVALID_AMOUNT",
    "El importe debe ser un entero no negativo.",
  );
  const parsed = BigInt(value);
  ensure(
    parsed <= 1000000000000000n,
    422,
    "INVALID_AMOUNT",
    "El importe excede el máximo.",
  );
  return parsed;
}
export function balance(
  authorized: bigint,
  reserved: bigint,
  confirmed: bigint,
) {
  const net = authorized - reserved - confirmed;
  return {
    authorized: authorized.toString(),
    reserved: reserved.toString(),
    confirmed: confirmed.toString(),
    available: (net > 0n ? net : 0n).toString(),
    deficit: (net < 0n ? -net : 0n).toString(),
  };
}
export function afterMinutes(date: string, minutes: number) {
  return new Date(Date.parse(date) + minutes * 60000).toISOString();
}
export const isBefore = (now: string, deadline: string) =>
  Date.parse(now) < Date.parse(deadline);
