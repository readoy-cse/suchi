import "./config/env.js";
import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { port } from "./config/env.js";

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.info(`Suchi API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void startServer();
