import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: "../../apps/panel/.env" });
loadEnv({ path: "../../apps/panel/.env.local", override: true });
loadEnv({ path: ".env", override: true });
loadEnv({ path: ".env.local", override: true });

const applicationDatabaseUrl = env("DATABASE_URL");
const migrationDatabaseUrl = new URL(
	process.env.DIRECT_URL ?? applicationDatabaseUrl.replace("-pooler.", "."),
);
migrationDatabaseUrl.searchParams.delete("channel_binding");
migrationDatabaseUrl.searchParams.set("connect_timeout", "30");

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
		url: migrationDatabaseUrl.toString(),
  },
});
