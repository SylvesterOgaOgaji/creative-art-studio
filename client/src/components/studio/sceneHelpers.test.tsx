import { describe, expect, it } from "vitest";
import {
  getStageBackground,
  getStageFloorColor,
  toVectorTuple,
} from "./sceneHelpers";

describe("studio scene helpers", () => {
  it("chooses the intended environment backgrounds and floor colours", () => {
    expect(getStageFloorColor("space", "daylight")).toBe("#101a47");
    expect(getStageFloorColor("atelier", "neon")).toBe("#111B3B");
    expect(getStageBackground("underwater")).toContain("#80d9e9");
    expect(getStageBackground("atelier")).toContain(
      "playful-atelier-workspace"
    );
  });

  it("converts Three-style vector values into persisted tuples", () => {
    expect(toVectorTuple({ x: 2, y: -1, z: 0.5 })).toEqual([2, -1, 0.5]);
  });
});
