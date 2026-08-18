import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { AppLogger } from "./logger";

export type ErrorTrackingEvent = {
  requestId?: string;
  method: string;
  path: string;
  message: string;
  stack?: string;
};

export type ErrorSink = {
  capture(event: ErrorTrackingEvent): void;
};

const MAX_FIELD_LENGTH = 4_096;
const SENSITIVE_QUERY_FIELDS = [
  "password",
  "token",
  "secret",
  "key",
  "authorization",
  "cookie",
  "session",
];

function bounded(value: string | undefined) {
  if (!value) return value;
  return value.length > MAX_FIELD_LENGTH
    ? `${value.slice(0, MAX_FIELD_LENGTH)}...[truncated]`
    : value;
}

function safePath(path: string) {
  try {
    const url = new URL(path, "http://creative-art-studio.local");
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        SENSITIVE_QUERY_FIELDS.some(field => key.toLowerCase().includes(field))
      ) {
        url.searchParams.set(key, "[REDACTED]");
      }
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return bounded(path) ?? "unknown";
  }
}

function sanitizeEvent(event: ErrorTrackingEvent): ErrorTrackingEvent {
  return {
    requestId: bounded(event.requestId),
    method: bounded(event.method)?.toUpperCase() ?? "UNKNOWN",
    path: safePath(event.path),
    message: bounded(event.message) ?? "Unknown error",
    stack: bounded(event.stack),
  };
}

/**
 * Provides a local structured error trail when ERROR_TRACKING_FILE is set.
 * The default remains a no-op so a fresh clone needs no external account.
 * Writes are serialized so concurrent failures cannot interleave JSONL records.
 */
export function createErrorSink(
  log: AppLogger,
  filePath = process.env.ERROR_TRACKING_FILE
): ErrorSink {
  if (!filePath) {
    return { capture: () => undefined };
  }

  let pendingWrite = Promise.resolve();
  return {
    capture(event) {
      const record = JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "creative-art-studio",
        ...sanitizeEvent(event),
      });
      pendingWrite = pendingWrite
        .then(async () => {
          await mkdir(dirname(filePath), { recursive: true });
          await appendFile(filePath, `${record}\n`, "utf8");
        })
        .catch(error => {
          log.error(
            {
              err: {
                message: error instanceof Error ? error.message : String(error),
              },
            },
            "error tracking sink failed"
          );
        });
    },
  };
}
