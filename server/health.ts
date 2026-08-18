import type { Request, Response } from "express";

export const HEALTH_PATH = "/healthz";

export function healthHandler(_request: Request, response: Response) {
  response.status(200).json({
    status: "ok",
    service: "creative-art-studio",
  });
}

export function healthPayload() {
  return {
    status: "ok" as const,
    service: "creative-art-studio" as const,
  };
}
