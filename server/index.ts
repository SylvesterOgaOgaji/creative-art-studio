import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createErrorSink, type ErrorSink } from "./errorSink";
import { healthHandler } from "./health";
import { logger, type AppLogger } from "./logger";
import { metricsQuerySchema, validateQuery } from "./schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticPath() {
  return process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");
}

export type RequestMetrics = {
  record(statusCode: number, durationMs: number): void;
  snapshot(): {
    requestCount: number;
    errorCount: number;
    averageDurationMs: number;
    statusCounts: Record<string, number>;
  };
};

export function createMetrics(): RequestMetrics {
  let requestCount = 0;
  let errorCount = 0;
  let totalDurationMs = 0;
  const statusCounts: Record<string, number> = {};

  return {
    record(statusCode, durationMs) {
      requestCount += 1;
      totalDurationMs += durationMs;
      statusCounts[String(statusCode)] =
        (statusCounts[String(statusCode)] ?? 0) + 1;
      if (statusCode >= 500) errorCount += 1;
    },
    snapshot() {
      return {
        requestCount,
        errorCount,
        averageDurationMs:
          requestCount === 0
            ? 0
            : Math.round((totalDurationMs / requestCount) * 100) / 100,
        statusCounts: { ...statusCounts },
      };
    },
  };
}

function requestLoggingMiddleware(log: AppLogger, metrics: RequestMetrics) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt = performance.now();
    const requestId = req.header("x-request-id")?.trim() || randomUUID();
    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    res.once("finish", () => {
      const durationMs =
        Math.round((performance.now() - startedAt) * 100) / 100;
      metrics.record(res.statusCode, durationMs);
      log.info(
        {
          requestId: res.locals.requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs,
        },
        "request completed"
      );
    });
    next();
  };
}

function errorHandlingMiddleware(log: AppLogger, errorSink: ErrorSink) {
  return (error: Error, req: Request, res: Response, _next: NextFunction) => {
    const event = {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
      message: error.message,
      stack: error.stack,
    };
    log.error(
      {
        err: { message: error.message, stack: error.stack },
        requestId: event.requestId,
        method: event.method,
        path: event.path,
      },
      "unhandled request error"
    );
    errorSink.capture(event);
    if (!res.headersSent) res.status(500).json({ error: "internal_error" });
  };
}

/**
 * Creates the minimal static application server. Keeping this factory separate
 * from process startup makes the health and logging contracts easy to exercise.
 */
export function createApp(
  staticPath = getStaticPath(),
  log: AppLogger = logger,
  registerRoutes?: (app: Express) => void,
  metrics: RequestMetrics = createMetrics(),
  errorSink: ErrorSink = createErrorSink(log)
): Express {
  const app = express();
  app.use(requestLoggingMiddleware(log, metrics));
  registerRoutes?.(app);

  app.get("/healthz", healthHandler);

  app.get("/metrics", validateQuery(metricsQuerySchema), (_req, res) => {
    res.status(200).json({
      service: "creative-art-studio",
      ...metrics.snapshot(),
    });
  });

  // Serve static files from dist/public in production.
  app.use(express.static(staticPath));

  // Express 5 requires a named wildcard; serve the app shell for every client route.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(errorHandlingMiddleware(log, errorSink));

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
