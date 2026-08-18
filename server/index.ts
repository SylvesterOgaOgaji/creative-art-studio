import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { logger, type AppLogger } from "./logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticPath() {
  return process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");
}

function requestLoggingMiddleware(log: AppLogger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt = performance.now();
    res.once("finish", () => {
      log.info(
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
        },
        "request completed"
      );
    });
    next();
  };
}

function errorHandlingMiddleware(log: AppLogger) {
  return (error: Error, req: Request, res: Response, _next: NextFunction) => {
    log.error(
      {
        err: { message: error.message },
        method: req.method,
        path: req.path,
      },
      "unhandled request error"
    );
    if (!res.headersSent) res.status(500).json({ error: "internal_error" });
  };
}

/**
 * Creates the minimal static application server. Keeping this factory separate
 * from process startup makes the health and logging contracts easy to exercise.
 */
export function createApp(
  staticPath = getStaticPath(),
  log: AppLogger = logger
): Express {
  const app = express();
  app.use(requestLoggingMiddleware(log));

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", service: "creative-art-studio" });
  });

  // Serve static files from dist/public in production.
  app.use(express.static(staticPath));

  // Express 5 requires a named wildcard; serve the app shell for every client route.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(errorHandlingMiddleware(log));

  return app;
}

export function startServer(
  port = Number(process.env.PORT) || 3000,
  log: AppLogger = logger
) {
  const server = createServer(createApp(undefined, log));
  server.once("error", error =>
    log.error({ err: { message: error.message }, port }, "server failed")
  );

  server.listen(port, () => {
    log.info({ port }, "server listening");
  });

  return server;
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  startServer();
}
