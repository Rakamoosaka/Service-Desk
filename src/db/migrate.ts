import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "@/db";
import { db } from "@/db";

async function main() {
  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
  });

  await sql.end();
}

main().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
