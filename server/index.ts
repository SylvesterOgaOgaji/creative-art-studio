import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticPath() {
  return process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");
}

/**
 * Creates the minimal static application server.  Keeping this factory separate
 * from process startup makes the health contract easy to exercise in tests.
 */
export function createApp(staticPath = getStaticPath()): Express {
  const app = express();

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", service: "creative-art-studio" });
  });

  // Serve static files from dist/public in production.
  app.use(express.static(staticPath));

  // Express 5 requires a named wildcard; serve the app shell for every client route.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(JSON.stringify({ level: "error", message: error.message }));
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

export function startServer(port = Number(process.env.PORT) || 3000) {
  const server = createServer(createApp());

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  return server;
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  startServer();
}
