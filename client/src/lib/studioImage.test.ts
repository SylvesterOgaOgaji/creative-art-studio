import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportSavedArtworkImage, exportStudioImage } from "./studioImage";

const context = {
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  strokeRect: vi.fn(),
  save: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  restore: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
};

const cube = {
  id: "cube-1",
  name: "Cube 1",
  type: "cube" as const,
  position: [0, 1, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
  color: "#FF6B4A",
  material: "matte" as const,
  texture: "plain" as const,
  sticker: "none" as const,
};

describe("studio image export", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,poster"
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector("#creative-art-canvas")?.remove();
  });

  it("exports a structured saved scene with a cleaned, descriptive filename", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    expect(exportSavedArtworkImage("My * Bright / World", [cube])).toBe(true);

    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector("a[download]")).not.toBeInTheDocument();
    expect(click.mock.instances[0]?.download).toBe(
      "my-bright-world-creative-art-studio.png"
    );
  });

  it("uses the live canvas when available before creating a PNG download", () => {
    const liveCanvas = document.createElement("canvas");
    liveCanvas.id = "creative-art-canvas";
    document.body.appendChild(liveCanvas);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    expect(exportStudioImage("Live stage", [cube])).toBe(true);

    expect(context.drawImage).toHaveBeenCalledWith(
      liveCanvas,
      0,
      0,
      1600,
      1060
    );
    expect(click.mock.instances[0]?.download).toBe(
      "live-stage-creative-art-studio.png"
    );
  });

  it("does not create a download when canvas rendering is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    expect(exportSavedArtworkImage("Unavailable", [cube])).toBe(false);
  });
});
