import type { StudioObject } from "@/types/studio";
import type { SceneSnapshot, StudioState } from "./useStudioStore";
import { cloneStudioObject } from "./studioHelpers";

const HISTORY_LIMIT = 40;

type StudioSet = (
  partial: Partial<StudioState> | ((state: StudioState) => Partial<StudioState>)
) => void;
type StudioGet = () => StudioState;

export const selectedIdsFor = (
  state: Pick<StudioState, "selectedObjectId" | "selectedObjectIds">
) =>
  state.selectedObjectIds?.length
    ? state.selectedObjectIds
    : state.selectedObjectId
      ? [state.selectedObjectId]
      : [];

export const cloneSnapshot = (state: SceneSnapshot): SceneSnapshot => ({
  artworkTitle: state.artworkTitle,
  objects: state.objects.map(cloneStudioObject),
  lighting: state.lighting ?? "daylight",
  environment: state.environment ?? "atelier",
  selectedObjectId: state.selectedObjectId,
  selectedObjectIds: [...selectedIdsFor(state)],
});

export function createHistoryActions(set: StudioSet, get: StudioGet) {
  const commit = (next: Partial<SceneSnapshot>) => {
    const current = get();
    set({
      ...next,
      past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT),
      future: [],
    });
  };

  return {
    commit,
    beginDirectTransform: () => {
      const current = get();
      if (current.transformInProgress || !selectedIdsFor(current).length)
        return;
      set({
        transformInProgress: true,
        past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT),
        future: [],
      });
    },
    finishDirectTransform: () =>
      set(state => ({
        transformInProgress: false,
        ...(state.tutorialStep === "move" ? { tutorialStep: "colour" } : {}),
      })),
    undo: () => {
      const current = get();
      const previous = current.past.at(-1);
      if (!previous) return;
      set({
        ...cloneSnapshot(previous),
        past: current.past.slice(0, -1),
        future: [cloneSnapshot(current), ...current.future].slice(
          0,
          HISTORY_LIMIT
        ),
        transformInProgress: false,
      });
    },
    redo: () => {
      const current = get();
      const next = current.future[0];
      if (!next) return;
      set({
        ...cloneSnapshot(next),
        past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT),
        future: current.future.slice(1),
        transformInProgress: false,
      });
    },
  };
}

export function withUpdatedObjects(
  objects: StudioObject[],
  ids: Set<string>,
  updates: Partial<StudioObject>
) {
  return objects.map(object =>
    ids.has(object.id) ? { ...object, ...updates } : object
  );
}
