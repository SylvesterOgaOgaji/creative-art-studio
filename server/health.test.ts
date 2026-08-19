import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./index";
import { healthPayload } from "./health";

describe("production server health endpoint", () => {
  it("returns an explicit operational status without requiring external credentials", async () => {
    const response = await request(createApp()).get("/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(healthPayload());
  });
});
