import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createErrorSink } from "./errorSink";
import type { AppLogger } from "./logger";

function testLogger(): AppLogger {
  return { info: vi.fn(), error: vi.fn() } as unknown as AppLogger;
}

describe("error tracking sink", () => {
  it("is disabled by default for fresh clones", () => {
    const sink = createErrorSink(testLogger(), "");

    expect(() =>
      sink.capture({
        method: "GET",
        path: "/boom",
        message: "ignored",
      })
    ).not.toThrow();
  });

  it("writes structured events when explicitly configured", async () => {
    const directory = await mkdtemp(join(tmpdir(), "creative-art-studio-"));
    const filePath = join(directory, "nested", "errors.jsonl");
    const sink = createErrorSink(testLogger(), filePath);

    sink.capture({
      requestId: "request-test-42",
      method: "GET",
      path: "/boom?token=private&view=gallery",
      message: "test failure",
      stack: "Error: test failure",
    });
    sink.capture({
      method: "POST",
      path: "/save",
      message: "second failure",
    });

    await vi.waitFor(async () => {
      const records = (await readFile(filePath, "utf8")).trim().split("\n");
      expect(records).toHaveLength(2);
      expect(JSON.parse(records[0])).toMatchObject({
        service: "creative-art-studio",
        requestId: "request-test-42",
        path: "/boom?token=%5BREDACTED%5D&view=gallery",
        message: "test failure",
      });
      expect(JSON.parse(records[1])).toMatchObject({
        method: "POST",
        path: "/save",
        message: "second failure",
      });
    });
  });
});
