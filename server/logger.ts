import pino, { type Logger } from "pino";

/**
 * Operational logs deliberately avoid request bodies, query strings, and client
 * identifiers because the studio is designed for children and runs locally.
 */
export type AppLogger = Pick<Logger, "info" | "error">;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "creative-art-studio" },
  redact: ["req.headers.authorization", "req.headers.cookie"],
});
