import { describe, expect, it } from "vitest";
import { createObject, createSurpriseArrangement } from "./sceneBuilders";

describe("scene builders", () => {
  it("creates a positioned default object with safe studio defaults", () => {
    const object = createObject("sphere", 3);

    expect(object).toMatchObject({
      type: "sphere",
      name: "Sphere 4",
      color: "#FF6B4A",
      material: "matte",
      texture: "plain",
      sticker: "none",
    });
    expect(object.id).toBeTruthy();
    expect(object.position).toEqual([-1.35, 0.85, -1.1]);
    expect(object.rotation[0]).toBe(0);
    expect(object.rotation[1]).toBeCloseTo(1.05);
    expect(object.rotation[2]).toBe(0);
  });

  it("creates a complete surprise arrangement for the studio action", () => {
    const arrangement = createSurpriseArrangement();

    expect(arrangement).toHaveLength(7);
    expect(new Set(arrangement.map(object => object.id)).size).toBe(7);
    expect(arrangement.map(object => object.type)).toEqual([
      "torus",
      "sphere",
      "cone",
      "cube",
      "cylinder",
      "sphere",
      "torus",
    ]);
    expect(
      arrangement.every(object => object.scale.every(value => value > 0))
    ).toBe(true);
    expect(arrangement.some(object => object.texture === "dots")).toBe(true);
    expect(arrangement.some(object => object.material === "neon")).toBe(true);
  });
});
