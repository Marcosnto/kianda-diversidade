import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: "../../apps/panel/.env" });
loadEnv({ path: "../../apps/panel/.env.local", override: true });
loadEnv({ path: ".env", override: true });
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
