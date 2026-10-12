import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
if (!process.argv.includes("--confirm")) {
  console.error(
    "Detén la aplicación. Para borrar sólo la base demo predeterminada y volver a los datos iniciales: npm run demo:reset -- --confirm",
  );
  process.exitCode = 1;
} else {
  const target = resolve(root, ".local/agentnexo.sqlite");
  if (dirname(target) !== resolve(root, ".local"))
    throw new Error("Ruta de demo inválida.");
  for (const suffix of ["", "-wal", "-shm"]) {
    await unlink(target + suffix).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  console.log(
    "Base demo local eliminada. El siguiente inicio recreará los datos iniciales.",
  );
}
