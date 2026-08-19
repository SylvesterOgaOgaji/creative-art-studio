import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp, createMetrics } from "./index";

describe("production server metrics endpoint", () => {
  it("reports request counts and status totals without user content", async () => {
    const metrics = createMetrics();
    const app = createApp(undefined, undefined, undefined, metrics);

    const healthResponse = await request(app).get("/healthz");
    const metricsResponse = await request(app).get("/metrics");

    expect(healthResponse.status).toBe(200);
    expect(metricsResponse.status).toBe(200);
    expect(metricsResponse.body).toMatchObject({
      service: "creative-art-studio",
      requestCount: 1,
      errorCount: 0,
      statusCounts: { "200": 1 },
    });
    expect(metricsResponse.body).not.toHaveProperty("headers");
    expect(metricsResponse.body).not.toHaveProperty("body");
  });

  it("counts server errors while keeping the client response generic", async () => {
    const metrics = createMetrics();
    const app = createApp(
      undefined,
      undefined,
      registeredApp => {
        registeredApp.get("/boom", () => {
          throw new Error("private implementation detail");
        });
      },
      metrics
    );

    const errorResponse = await request(app).get("/boom");
    const metricsResponse = await request(app).get("/metrics");

    expect(errorResponse.status).toBe(500);
    expect(errorResponse.body).toEqual({ error: "internal_error" });
    expect(metricsResponse.body).toMatchObject({
      errorCount: 1,
      statusCounts: { "500": 1 },
    });
    expect(JSON.stringify(metricsResponse.body)).not.toContain(
      "private implementation detail"
    );
  });
});
