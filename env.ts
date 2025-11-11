import { config } from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

const candidates = [
  join(moduleDir, ".env"),
  join(moduleDir, ".env.local"),
  join(moduleDir, ".env.development"),
  join(moduleDir, ".env.development.local"),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    config({ path: candidate });
    if (process.env.NODE_ENV !== "production") {
      console.info(`[env] loaded environment from ${candidate}`);
    }
    break;
  }
}


