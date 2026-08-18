import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./index";
import type { AppLogger } from "./logger";

function createTestLogger(): AppLogger {
  return { info: vi.fn(), error: vi.fn() } as unknown as AppLogger;
}

describe("server error handling", () => {
  it("returns a safe error, preserves a request id, and logs the stack", async () => {
    const log = createTestLogger();
    const app = createApp(undefined, log, configuredApp => {
      configuredApp.get("/boom", () => {
        throw new Error("test failure");
      });
    });

    const response = await request(app)
      .get("/boom")
      .set("x-request-id", "request-test-42");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "internal_error" });
    expect(response.headers["x-request-id"]).toBe("request-test-42");
    expect(response.text).not.toContain("test failure");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "request-test-42",
        method: "GET",
        path: "/boom",
        err: expect.objectContaining({
          message: "test failure",
          stack: expect.any(String),
        }),
      }),
      "unhandled request error"
    );
  });

  it("normalizes non-Error throws and replaces unsafe request IDs", async () => {
    const log = createTestLogger();
    const app = createApp(undefined, log, configuredApp => {
      configuredApp.get("/boom", () => {
        throw "string failure";
      });
    });

    const response = await request(app)
      .get("/boom")
      .set("x-request-id", "x".repeat(129));

    expect(response.status).toBe(500);
    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.objectContaining({ message: "string failure" }),
      }),
      "unhandled request error"
    );
  });
});
