import { describe, expect, it, vi } from "vitest";
import {
  OFFLINE_SERVICE_WORKER_PATH,
  registerOfflineServiceWorker,
  supportsOfflineServiceWorker,
} from "./offline";

describe("offline service worker", () => {
  it("supports secure origins and local development origins", () => {
    expect(
      supportsOfflineServiceWorker({
        protocol: "https:",
        hostname: "studio.test",
      })
    ).toBe(true);
    expect(
      supportsOfflineServiceWorker({ protocol: "http:", hostname: "localhost" })
    ).toBe(true);
    expect(
      supportsOfflineServiceWorker({
        protocol: "http:",
        hostname: "studio.test",
      })
    ).toBe(false);
  });

  it("registers the root-scoped worker when the browser supports it", () => {
    const register = vi.fn().mockResolvedValue(undefined);
    registerOfflineServiceWorker(
      { register } as unknown as ServiceWorkerContainer,
      { protocol: "https:", hostname: "studio.test" }
    );

    expect(register).toHaveBeenCalledWith(OFFLINE_SERVICE_WORKER_PATH, {
      scope: "/",
    });
  });

  it("does not let registration failures interrupt app startup", async () => {
    const register = vi.fn().mockRejectedValue(new Error("offline"));

    registerOfflineServiceWorker(
      { register } as unknown as ServiceWorkerContainer,
      { protocol: "https:", hostname: "studio.test" }
    );

    await vi.waitFor(() => expect(register).toHaveBeenCalled());
  });
});
