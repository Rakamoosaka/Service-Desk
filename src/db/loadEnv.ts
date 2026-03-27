import { existsSync } from "node:fs";

const envFile = ".env.local";

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}
