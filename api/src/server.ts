import "dotenv/config";
import { connectDB } from "./config/db";
import { createApp } from "./app";

async function start() {
  await connectDB();

  const app = createApp();

  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});