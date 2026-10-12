import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setup } from "./helpers.js";
test("public context, health and unknown actor rejection", async () => {
  const app = await setup();
  try {
    assert.equal(
      (await app.api("/health", "GET", undefined, "visitor")).status,
      200,
    );
    const result = await app.api("/context", "GET", undefined, "visitor");
    assert.equal(result.data.actors.length, 4);
    assert.equal(result.data.simulation, true);
    assert.equal(
      (await app.api("/context", "GET", undefined, "invalid")).status,
      422,
    );
    assert.equal(
      app.store.db.prepare("PRAGMA foreign_keys").get()!.foreign_keys,
      1,
    );
  } finally {
    await app.close();
  }
});
test("seed and configuration persist over an actual SQLite restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "agentnexo-"));
  const path = join(directory, "test.sqlite");
  const first = await setup({ dbPath: path });
  first.store.save("config", { id: "persisted", value: "saved" });
  const offers = first.store.list("offer").length;
  await first.close();
  const second = await setup({ dbPath: path });
  try {
    assert.equal(
      second.store.get<{ value: string }>("config", "persisted")!.value,
      "saved",
    );
    assert.equal(second.store.list("offer").length, offers);
  } finally {
    await second.close();
    rmSync(directory, { recursive: true });
  }
});
