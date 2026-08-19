import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapView } from "./Map";

describe("MapView", () => {
  it("does not request Forge or Google Maps when credentials are absent", async () => {
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
