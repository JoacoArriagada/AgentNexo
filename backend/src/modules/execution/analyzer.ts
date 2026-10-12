import type { Finding, Job } from "@agentnexo/api-contracts";
import { id } from "../../shared/database/store.js";
type Rule = {
  match: RegExp;
  severity: Finding["severity"];
  title: string;
  explanation: string;
  recommendation: string;
  uncertainty: string;
};
const rules: Rule[] = [
  {
    match: /\beval\s*\(|\bnew\s+Function\s*\(/,
    severity: "high",
    title: "Evaluación dinámica de código",
    explanation:
      "La línea contiene un mecanismo que interpreta texto como código. Una entrada no confiable puede cambiar su comportamiento.",
    recommendation:
      "Sustituirlo por operaciones o parsers explícitos y validar cualquier entrada.",
    uncertainty: "La regla no determina si la entrada llega desde un usuario.",
  },
  {
    match: /innerHTML\s*=|dangerouslySetInnerHTML/,
    severity: "high",
    title: "Inserción directa de HTML",
    explanation:
      "La asignación permite contenido HTML; si proviene de entradas externas requiere saneamiento.",
    recommendation:
      "Usar textContent o renderizado de texto; justificar un saneador si HTML es necesario.",
    uncertainty:
      "No se ha demostrado el origen de los datos ni una vulnerabilidad explotable.",
  },
  {
    match:
      /\b(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{6,}['"]/i,
    severity: "high",
    title: "Posible secreto literal",
    explanation:
      "Se detectó un literal asociado a un nombre sensible. No se verificó si corresponde a una credencial real.",
    recommendation:
      "Retirar credenciales reales del código y revisar su rotación.",
    uncertainty: "Puede ser una cadena de ejemplo.",
  },
  {
    match: /==(?!=)|!=(?!=)/,
    severity: "medium",
    title: "Comparación con conversión implícita",
    explanation:
      "El operador permite coerción de tipos y puede producir resultados inesperados.",
    recommendation: "Usar === o !== y validar tipos de entrada.",
    uncertainty: "La coerción podría ser intencional; revisar el contrato.",
  },
  {
    match: /parseInt\s*\([^,)]*\)/,
    severity: "low",
    title: "Conversión entera sin base explícita",
    explanation:
      "La llamada no declara radix y puede admitir prefijos inesperados.",
    recommendation: "Indicar base 10 y validar NaN, rango y formato.",
    uncertainty: "Es una recomendación de robustez, no un defecto confirmado.",
  },
  {
    match: /\breturn\b[^;]*\/[\s]*[a-zA-Z_$][\w$]*/,
    severity: "medium",
    title: "División sin contrato de denominador visible",
    explanation:
      "La expresión contiene división por una variable; cero o valores no finitos pueden producir Infinity o NaN.",
    recommendation:
      "Definir y probar el contrato del denominador, incluido cero.",
    uncertainty: "Podrían existir validaciones fuera de esta línea.",
  },
  {
    match: /console\.(log|debug)\s*\([^)]*(password|secret|token)/i,
    severity: "high",
    title: "Dato sensible en salida de diagnóstico",
    explanation: "Una salida de diagnóstico referencia un nombre sensible.",
    recommendation: "Eliminar o redactar datos sensibles antes de registrar.",
    uncertainty: "El nombre no demuestra que el valor sea una credencial.",
  },
];
export function analyze(job: Job): Finding[] {
  const findings: Finding[] = [];
  for (const file of job.files) {
    const lines = file.content.split("\n");
    lines.forEach((line, index) => {
      for (const rule of rules)
        if (rule.match.test(line))
          findings.push({
            id: id("finding"),
            fileId: file.id!,
            fileName: file.name,
            startLine: index + 1,
            endLine: index + 1,
            severity: rule.severity,
            title: rule.title,
            explanation: rule.explanation,
            evidence: line.slice(0, 500),
            recommendation: rule.recommendation,
            uncertainty: rule.uncertainty,
          });
    });
    if (
      /\bprice\s*\*\s*quantity\s*-\s*discount\b/.test(file.content) &&
      !/quantity\s*(?:<=|<)\s*0|Number\.isFinite/.test(file.content)
    ) {
      const index = lines.findIndex((line) =>
        /price\s*\*\s*quantity/.test(line),
      );
      findings.push({
        id: id("finding"),
        fileId: file.id!,
        fileName: file.name,
        startLine: index + 1,
        endLine: index + 1,
        severity: "medium",
        title: "Cálculo sin validación numérica visible",
        explanation:
          "Se combinan precio, cantidad y descuento sin comprobación numérica visible en este archivo.",
        evidence: lines[index].slice(0, 500),
        recommendation:
          "Definir entradas permitidas; probar cantidades negativas, NaN y descuento superior al subtotal.",
        uncertainty:
          "Una validación externa o cantidades negativas autorizadas podrían cambiar esta observación.",
      });
    }
  }
  return findings.slice(0, 100);
}
