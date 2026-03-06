import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { db } from "./config/database.js";

async function start() {
  await db.raw("SELECT 1");

  app.listen(env.PORT, () => {
    console.log(`[Stylio Backend] Server running on :${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
