import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./index";

describe("server request validation", () => {
  it("rejects unsupported metrics query parameters with a safe 400 response", async () => {
    const response = await request(createApp()).get("/metrics?unexpected=true");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "invalid_request",
      message: "Query parameters are not supported for this endpoint.",
    });
  });

  it("keeps the health and metrics endpoints usable without Forge credentials", async () => {
    const app = createApp();

    const health = await request(app).get("/healthz");
    const metrics = await request(app).get("/metrics");

    expect(health.status).toBe(200);
    expect(health.body).toEqual({
      status: "ok",
      service: "creative-art-studio",
    });
    expect(metrics.status).toBe(200);
    expect(metrics.body.service).toBe("creative-art-studio");
  });
});
