import { describe, expect, it } from "vitest";
import type { StudioObject } from "@/types/studio";
import type { StudioState } from "./useStudioStore";
import { createGalleryActions } from "./gallerySlice";
import { useStudioStore } from "./useStudioStore";

const cube: StudioObject = {
  id: "cube-1",
  type: "cube",
  color: "#FF6B4A",
  material: "matte",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};

function galleryHarness() {
  let state: StudioState = {
    ...useStudioStore.getInitialState(),
    objects: [cube],
    artworkTitle: "  Bright robot  ",
  };
  const set = ((
    partial:
      | Partial<StudioState>
      | ((current: StudioState) => Partial<StudioState>)
  ) => {
    state = {
      ...state,
      ...(typeof partial === "function" ? partial(state) : partial),
    };
  }) as Parameters<typeof createGalleryActions>[0];
  const actions = createGalleryActions(set, () => state);
  return { actions, getState: () => state };
}

describe("gallery slice", () => {
  it("saves a browser-local artwork and keeps its scene data independent", () => {
    const { actions, getState } = galleryHarness();
    const saved = actions.saveArtwork("data:image/png;base64,preview");

    expect(saved).toMatchObject({
      title: "Bright robot",
      thumbnailDataUrl: "data:image/png;base64,preview",
    });
    expect(getState().savedArtworks).toHaveLength(1);
    cube.position[0] = 9;
    expect(getState().savedArtworks[0].objects[0].position).toEqual([0, 0, 0]);
  });

  it("normalizes folders and tags, then clears folder assignments when deleted", () => {
    const { actions, getState } = galleryHarness();
    const saved = actions.saveArtwork()!;
    const folderId = actions.createGalleryFolder("  Finished   worlds  ")!;
    actions.assignArtworkFolder(saved.id, folderId);
    actions.setArtworkTags(saved.id, [
      " sky ",
      "sky",
      "  joyful work ",
      "",
      "small worlds",
    ]);

    expect(getState().savedArtworks[0]).toMatchObject({
      folderId,
      tags: ["sky", "joyful work", "small worlds"],
    });
    expect(actions.createGalleryFolder("finished worlds")).toBe(folderId);

    actions.deleteGalleryFolder(folderId);
    expect(getState().savedArtworks[0].folderId).toBeUndefined();
  });
});
