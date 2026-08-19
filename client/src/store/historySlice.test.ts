import { describe, expect, it } from "vitest";
import type { StudioObject } from "@/types/studio";
import {
  cloneSnapshot,
  selectedIdsFor,
  withUpdatedObjects,
} from "./historySlice";

const cube: StudioObject = {
  id: "cube-1",
  type: "cube",
  color: "#FF6B4A",
  material: "matte",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

describe("history slice helpers", () => {
  it("uses a multi-selection in preference to the primary selection", () => {
    expect(
      selectedIdsFor({
        selectedObjectId: "cube-1",
        selectedObjectIds: ["cube-1", "cube-2"],
      })
    ).toEqual(["cube-1", "cube-2"]);
    expect(
      selectedIdsFor({ selectedObjectId: "cube-1", selectedObjectIds: [] })
    ).toEqual(["cube-1"]);
    expect(
      selectedIdsFor({ selectedObjectId: null, selectedObjectIds: [] })
    ).toEqual([]);
  });

  it("creates isolated snapshots so later object edits cannot rewrite history", () => {
    const snapshot = cloneSnapshot({
      artworkTitle: "Warm shapes",
      objects: [cube],
      lighting: "daylight",
      environment: "atelier",
      selectedObjectId: cube.id,
      selectedObjectIds: [cube.id],
    });
    cube.position[0] = 3;

    expect(snapshot.objects[0].position).toEqual([0, 0, 0]);
    expect(snapshot.selectedObjectIds).toEqual([cube.id]);
  });

  it("updates only selected objects while preserving unrelated shapes", () => {
    const sphere = { ...cube, id: "sphere-1", type: "sphere" as const };
    const updated = withUpdatedObjects([cube, sphere], new Set([sphere.id]), {
      color: "#44B7FF",
    });

    expect(updated[0].color).toBe("#FF6B4A");
    expect(updated[1]).toMatchObject({ id: sphere.id, color: "#44B7FF" });
  });
});
