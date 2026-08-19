import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapView } from "./Map";

describe("MapView", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("does not request Forge or Google Maps when credentials are absent", async () => {
    vi.stubEnv("VITE_FRONTEND_FORGE_API_KEY", "");
    const appendChild = vi.spyOn(document.head, "appendChild");
    const { container } = render(<MapView />);

    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        "data-map-state",
        "unavailable"
      );
    });

    expect(appendChild).not.toHaveBeenCalledWith(expect.any(HTMLScriptElement));
    appendChild.mockRestore();
  });
});
