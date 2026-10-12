import { test, expect, type Page } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";

async function actor(page: Page, id: string) {
  await page.getByLabel("Actor de demostración").selectOption(id);
}

async function createReview(page: Page, title: string, start = true) {
  await page.goto("/");
  await actor(page, "buyer");
  await page.goto("/jobs/new");
  await page.getByLabel(/^Título/).fill(title);
  await page
    .getByLabel(/^Objetivo/)
    .fill(
      "Identificar riesgos concretos de seguridad mediante lectura del archivo JavaScript suministrado.",
    );
  await page
    .getByLabel("Criterio 1")
    .fill("Ejecutar pruebas y garantizar que no existe ningún defecto.");
  await page.getByLabel("Archivos JS/TS").setInputFiles({
    name: "entrada.js",
    mimeType: "text/javascript",
    buffer: Buffer.from(
      "export function unsafe(value) {\n  return eval(value);\n}\n",
    ),
  });
  await page
    .getByRole("button", { name: "Guardar y revisar condiciones" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Autoriza límites explícitos" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Autorizar y crear contratación" }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "He revisado y acepto el alcance y sus límites",
    })
    .check();
  await page
    .getByRole("button", { name: "Autorizar y crear contratación" })
    .click();
  await page
    .getByRole("button", { name: "Crear contratación simulada" })
    .click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simular depósito" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  if (!start) return new URL(page.url()).pathname.split("/")[2];
  await page
    .getByRole("button", { name: "Iniciar revisión", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Aceptar entrega y liberar precio" }),
  ).toBeVisible();
  const jobId = new URL(page.url()).pathname.split("/")[2];
  return jobId;
}

test("entrada real → autorización → informe descargable → ampliación → cierre", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const jobId = await createReview(page, "Revisión E2E de entrada propia");
  await page.getByRole("link", { name: "Informe", exact: true }).click();
  await expect(page.getByText("No evaluado", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Casos de prueba propuestos · No ejecutados",
    }),
  ).toBeVisible();
  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  const download = await pendingDownload;
  const report = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(report.jobId).toBe(jobId);
  expect(
    report.findings.some(
      (finding: any) =>
        finding.fileName === "entrada.js" &&
        finding.startLine === 2 &&
        finding.evidence.includes("eval"),
    ),
  ).toBe(true);
  expect(report.criteria[0].status).toBe("no_evaluado");
  expect(report.testCases.every((item: any) => item.executed === false)).toBe(
    true,
  );
  const markdownDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar Markdown" }).click();
  const markdown = await readFile(
    (await (await markdownDownload).path())!,
    "utf8",
  );
  expect(markdown).toContain("entrada.js");
  expect(markdown).toContain("eval(value)");
  await page.getByRole("link", { name: "Gastos", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisar ampliación de límites" })
    .click();
  await page.getByLabel("Límite de modelos · USD").fill("2.000000000");
  await page.getByRole("button", { name: "Proponer nueva versión" }).click();
  await expect(
    page.getByRole("button", { name: "Aceptar ampliación" }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "Autorizo los límites de esta nueva versión de política",
    })
    .check();
  await page.getByRole("button", { name: "Aceptar ampliación" }).click();
  await expect(
    page.getByRole("checkbox", {
      name: "Autorizo los límites de esta nueva versión de política",
    }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await page
    .getByRole("button", { name: "Aceptar entrega y liberar precio" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByText("Precio pagado", { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Precio pagado", { exact: true }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("publicación → moderación → catálogo → retirada del proveedor", async ({
  page,
}) => {
  const title = "Oferta creada por recorrido E2E";
  await page.goto("/");
  await actor(page, "provider");
  await page.goto("/offers/new");
  await page.getByLabel("Nombre", { exact: true }).fill(title);
  await page
    .getByLabel(/^Descripción/)
    .fill(
      "Revisión estática local con alcance y evidencia del archivo aportado.",
    );
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await page.getByRole("button", { name: "Enviar a moderación" }).click();
  await page.getByRole("button", { name: "Enviar versión" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const providerUrl = page.url();
  await actor(page, "admin");
  await page.goto("/moderation");
  const card = page
    .locator(".card")
    .filter({ has: page.getByRole("heading", { name: `${title} · v1` }) });
  await card.getByRole("button", { name: "Aprobar", exact: true }).click();
  await page
    .getByLabel("Motivo de la decisión")
    .fill("Perfil y alcance válidos para la demostración local.");
  await page.getByRole("button", { name: "Confirmar decisión" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await actor(page, "visitor");
  await page.goto("/catalog");
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await actor(page, "provider");
  await page.goto(providerUrl);
  await page.getByRole("button", { name: "Retirar de nuevas ventas" }).click();
  await page
    .getByLabel("Motivo de retirada")
    .fill("Fin de disponibilidad de esta oferta de prueba.");
  await page.getByRole("button", { name: "Confirmar retirada" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await actor(page, "visitor");
  await page.goto("/catalog");
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toHaveCount(0);
});

test("disputa → respuesta del proveedor → arbitraje independiente", async ({
  page,
}) => {
  const jobId = await createReview(page, "Revisión E2E para disputa");
  await page.getByRole("button", { name: "Disputar entrega" }).click();
  await page
    .getByLabel("Motivo", { exact: true })
    .fill("El criterio de negocio necesita una revisión adicional.");
  await page
    .getByLabel("Evidencia mínima a compartir")
    .fill("El informe declara el criterio como no evaluado.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await actor(page, "provider");
  await page.goto("/sales");
  await page.getByRole("button", { name: "Responder a la disputa" }).click();
  await page
    .getByLabel("Respuesta", { exact: true })
    .fill("Reconozco la limitación del analizador local y acepto revisión.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await actor(page, "admin");
  await page.goto("/operations");
  await page.getByRole("button", { name: "Resolver disputa" }).click();
  await page.getByLabel("Resolución total").selectOption("refund");
  await page
    .getByLabel("Motivo", { exact: true })
    .fill("Devolución total simulada por alcance no satisfecho.");
  await page.getByRole("button", { name: "Confirmar decisión" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await actor(page, "buyer");
  await page.goto(`/jobs/${jobId}/summary`);
  await expect(
    page.getByText("Precio devuelto", { exact: true }).first(),
  ).toBeVisible();
});

test("catálogo y formulario conservan acciones en móvil y teclado", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Ir al contenido" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await mkdir(".artifacts/screens", { recursive: true });
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/catalog");
    await expect(
      page.getByRole("heading", { name: "Encuentra una revisión útil" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 320 || width === 1440)
      await page.screenshot({
        path: `.artifacts/screens/catalog-${width}.png`,
        fullPage: true,
      });
    await actor(page, "buyer");
    await page.goto("/jobs/new");
    await expect(
      page.getByRole("button", { name: "Guardar y revisar condiciones" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 320)
      await page.screenshot({
        path: ".artifacts/screens/form-320.png",
        fullPage: true,
      });
  }
});

test("cancelación antes del inicio, avisos y preferencias persistentes", async ({
  page,
}) => {
  const jobId = await createReview(
    page,
    "Encargo cancelado antes de analizar",
    false,
  );
  await page.getByRole("button", { name: "Cancelar antes del inicio" }).click();
  await page
    .getByLabel("Motivo", { exact: true })
    .fill("No necesito continuar con esta demostración.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByText("Precio devuelto", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/notifications");
  await page.getByRole("button", { name: "Marcar todas como leídas" }).click();
  await expect(
    page.getByRole("button", { name: "Marcar leída", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Abrir origen" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Encargo cancelado antes de analizar" }),
  ).toBeVisible();
  expect(new URL(page.url()).pathname).toContain(jobId);
  await page.goto("/preferences");
  await page.getByLabel("Zona horaria").selectOption("UTC");
  await page.getByRole("button", { name: "Guardar preferencias" }).click();
  await expect(page.getByRole("status")).toHaveText("Preferencias guardadas.");
  await page.reload();
  await expect(page.getByLabel("Zona horaria")).toHaveValue("UTC");
  await page.goto(`/jobs/${jobId}/summary`);
  await expect(page.locator(".pagehead p")).toContainText("UTC");
});

test("DEMO-01 conserva operaciones al conciliar y recuperar entregas", async ({
  page,
}) => {
  await page.goto("/");
  await actor(page, "buyer");
  await page.goto("/jobs/new");
  await page.getByRole("button", { name: "Cargar ejemplo" }).click();
  await page
    .getByRole("combobox", { name: "Contexto", exact: true })
    .selectOption("public-demo");
  await page
    .getByRole("button", { name: "Guardar y revisar condiciones" })
    .click();
  await page
    .getByRole("combobox", { name: "Servicio A", exact: true })
    .selectOption("uncertain");
  await page
    .getByRole("combobox", { name: "Servicio B", exact: true })
    .selectOption("delivery_failed");
  await page
    .getByRole("checkbox", {
      name: "He revisado y acepto el alcance y sus límites",
    })
    .check();
  await page
    .getByRole("button", { name: "Autorizar y crear contratación" })
    .click();
  await page
    .getByRole("button", { name: "Crear contratación simulada" })
    .click();
  await page.getByRole("button", { name: "Simular depósito" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Iniciar revisión", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Aceptar entrega y liberar precio" }),
  ).toBeVisible();
  const jobId = new URL(page.url()).pathname.split("/")[2];
  const paymentsUrl = `/api/v1/jobs/${jobId}/payments`;
  const before = await (
    await page.request.get(paymentsUrl, { headers: { "X-Actor-Id": "buyer" } })
  ).json();
  expect(
    before.items.some((item: any) => item.financialState === "uncertain"),
  ).toBe(true);
  await page.getByRole("link", { name: "Gastos", exact: true }).click();
  await page
    .getByRole("button", { name: "Conciliar operación", exact: true })
    .click();
  await page.getByLabel("Resultado comprobado").selectOption("confirmed");
  await page
    .getByLabel("Motivo y evidencia local")
    .fill("Conciliación verificada en el escenario local de demostración.");
  await page.getByRole("button", { name: "Confirmar recuperación" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Recuperar la misma entrega" })
    .first()
    .click();
  await page.getByRole("button", { name: "Confirmar recuperación" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const after = await (
    await page.request.get(paymentsUrl, { headers: { "X-Actor-Id": "buyer" } })
  ).json();
  expect(after.items.map((item: any) => item.id).sort()).toEqual(
    before.items.map((item: any) => item.id).sort(),
  );
  expect(
    after.items.some((item: any) => item.financialState === "uncertain"),
  ).toBe(false);
});
