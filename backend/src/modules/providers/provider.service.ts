import type { Provider } from "@agentnexo/api-contracts";
export const PROVIDERS: Provider[] = [
  {
    id: "local-reviewer",
    name: "Analizador local de reglas",
    kind: "model",
    description:
      "Inspección determinista del texto recibido. Costo de referencia simulado; sin API de IA.",
    price: { currencyKey: "USD", scale: 9, minor: "10000000" },
    ready: true,
    simulation: true,
  },
  {
    id: "service-a",
    name: "A · Análisis estático demo",
    kind: "tool",
    description:
      "Reglas adicionales del fixture público; proveedor local diferenciado.",
    price: { currencyKey: "USDC_DEMO", scale: 7, minor: "300000" },
    ready: true,
    simulation: true,
  },
  {
    id: "service-b",
    name: "B · Catálogo de pruebas demo",
    kind: "tool",
    description:
      "Casos de prueba del fixture público; contribución independiente de A.",
    price: { currencyKey: "USDC_DEMO", scale: 7, minor: "300000" },
    ready: true,
    simulation: true,
  },
];
