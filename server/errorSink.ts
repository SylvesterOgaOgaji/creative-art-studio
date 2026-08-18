import { appendFile } from "node:fs/promises";
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

/**
 * Provides a local structured error trail when ERROR_TRACKING_FILE is set.
 * The default remains a no-op so a fresh clone needs no external account.
 */
export function createErrorSink(
  log: AppLogger,
  filePath = process.env.ERROR_TRACKING_FILE
): ErrorSink {
  if (!filePath) {
    return { capture: () => undefined };
  }

  return {
    capture(event) {
      const record = JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "creative-art-studio",
        ...event,
      });
      void appendFile(filePath, `${record}\n`, "utf8").catch(error => {
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
