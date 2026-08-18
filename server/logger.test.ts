import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./index";
import type { AppLogger } from "./logger";

function createTestLogger(): AppLogger {
  return { info: vi.fn(), error: vi.fn() } as unknown as AppLogger;
}

describe("server observability", () => {
  it("logs a privacy-aware request summary for a successful health check", async () => {
    const log = createTestLogger();

    await request(createApp(undefined, log)).get("/healthz?student=private");

    expect(log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/healthz",
        statusCode: 200,
      }),
      "request completed"
    );
  });
});
