import { describe, expect, it } from "vitest";
import type { StudioObject } from "@/types/studio";
import type { SceneSnapshot, StudioState } from "./useStudioStore";
import {
  cloneSnapshot,
  createHistoryActions,
  selectedIdsFor,
  withUpdatedObjects,
} from "./historySlice";

const makeObject = (id = "object-1", color = "#FF6B4A"): StudioObject => ({
  id,
  name: "Friendly cube",
  type: "cube",
  position: [0, 1, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color,
  material: "matte",
  texture: "plain",
  sticker: "none",
});

const makeSnapshot = (color = "#FF6B4A"): SceneSnapshot => ({
  artworkTitle: "My tiny world",
  objects: [makeObject("object-1", color)],
  lighting: "daylight",
  environment: "atelier",
  selectedObjectId: "object-1",
  selectedObjectIds: ["object-1"],
});

function createHarness(overrides: Partial<StudioState> = {}) {
  let state = {
    ...makeSnapshot(),
    past: [],
    future: [],
    transformInProgress: false,
    tutorialStep: "welcome",
    ...overrides,
  } as unknown as StudioState;

  const set = (
    partial:
      | Partial<StudioState>
      | ((current: StudioState) => Partial<StudioState>)
  ) => {
    state = {
      ...state,
      ...(typeof partial === "function" ? partial(state) : partial),
    };
  };

  const actions = createHistoryActions(set, () => state);
  return { actions, getState: () => state };
}

describe("history slice", () => {
  it("normalizes selected ids and clones snapshots deeply", () => {
    expect(
      selectedIdsFor({ selectedObjectId: "single", selectedObjectIds: [] })
    ).toEqual(["single"]);
    expect(
      selectedIdsFor({
        selectedObjectId: "last",
        selectedObjectIds: ["first", "last"],
      })
    ).toEqual(["first", "last"]);

    const snapshot = makeSnapshot();
    const cloned = cloneSnapshot(snapshot);
    cloned.objects[0].position[0] = 12;
    cloned.selectedObjectIds.push("another");

    expect(snapshot.objects[0].position[0]).toBe(0);
    expect(snapshot.selectedObjectIds).toEqual(["object-1"]);
    expect(cloned.lighting).toBe("daylight");
    expect(cloned.environment).toBe("atelier");
  });

  it("records a commit as an undo point and clears stale redo state", () => {
    const harness = createHarness({
      past: [makeSnapshot("#000000")],
      future: [makeSnapshot("#FFFFFF")],
    });

    harness.actions.commit({
      objects: [makeObject("object-1", "#4666E9")],
      selectedObjectId: "object-1",
      selectedObjectIds: ["object-1"],
    });

    expect(harness.getState().past).toHaveLength(2);
    expect(harness.getState().past[1].objects[0].color).toBe("#FF6B4A");
    expect(harness.getState().future).toEqual([]);
    expect(harness.getState().objects[0].color).toBe("#4666E9");
  });

  it("supports direct-transform history boundaries and tutorial progression", () => {
    const harness = createHarness({
      selectedObjectId: "object-1",
      selectedObjectIds: ["object-1"],
      tutorialStep: "move",
    });

    harness.actions.beginDirectTransform();
    harness.actions.beginDirectTransform();
    expect(harness.getState().transformInProgress).toBe(true);
    expect(harness.getState().past).toHaveLength(1);

    harness.actions.finishDirectTransform();
    expect(harness.getState()).toMatchObject({
      transformInProgress: false,
      tutorialStep: "colour",
    });
  });

  it("undoes and redoes a change while keeping future order stable", () => {
    const harness = createHarness();
    harness.actions.commit({
      objects: [makeObject("object-1", "#4666E9")],
      selectedObjectId: "object-1",
      selectedObjectIds: ["object-1"],
    });
    harness.actions.commit({
      objects: [makeObject("object-1", "#7C3AED")],
      selectedObjectId: "object-1",
      selectedObjectIds: ["object-1"],
    });

    harness.actions.undo();
    expect(harness.getState().objects[0].color).toBe("#4666E9");
    expect(harness.getState().future).toHaveLength(1);

    harness.actions.redo();
    expect(harness.getState().objects[0].color).toBe("#7C3AED");
    expect(harness.getState().future).toEqual([]);

    harness.actions.undo();
    harness.actions.undo();
    expect(harness.getState().objects[0].color).toBe("#FF6B4A");
    harness.actions.undo();
    expect(harness.getState().objects[0].color).toBe("#FF6B4A");
  });

  it("updates only objects included in a multi-object update", () => {
    const objects = [makeObject("first"), makeObject("second")];
    const updated = withUpdatedObjects(objects, new Set(["second"]), {
      material: "neon",
    });

    expect(updated).toEqual([objects[0], { ...objects[1], material: "neon" }]);
    expect(objects[0].material).toBe("matte");
  });
});
