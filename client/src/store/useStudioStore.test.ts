import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "./useStudioStore";

const initialState = useStudioStore.getInitialState();

function resetStudio() {
  useStudioStore.persist.clearStorage();
  useStudioStore.setState(
    {
      ...initialState,
      objects: [],
      past: [],
      future: [],
      savedArtworks: [],
      galleryFolders: [],
      makerSpotlights: [],
      activityHistory: [],
      selectedObjectId: null,
      selectedObjectIds: [],
    },
    true
  );
}

describe("browser-local studio state", () => {
  beforeEach(resetStudio);

  it("creates a shape, applies a transform, and restores it through undo and redo", () => {
    const store = useStudioStore.getState();
    store.addObject("cube");

    const objectId = useStudioStore.getState().selectedObjectId;
    expect(objectId).toBeTruthy();
    expect(useStudioStore.getState().objects).toHaveLength(1);

    store.updateObject(objectId!, { position: [1.5, 2, -0.5] });
    store.setSelectedColor("#4666E9");
    expect(useStudioStore.getState().objects[0]).toMatchObject({
      position: [1.5, 2, -0.5],
      color: "#4666E9",
    });

    store.undo();
    expect(useStudioStore.getState().objects[0].color).toBe("#FF6B4A");
    store.undo();
    const restoredPosition = useStudioStore.getState().objects[0].position;
    expect(restoredPosition[0]).toBe(-1.35);
    expect(restoredPosition[1]).toBe(0.85);
    expect(Math.abs(restoredPosition[2])).toBe(0);
    store.redo();
    expect(useStudioStore.getState().objects[0].position).toEqual([
      1.5, 2, -0.5,
    ]);
  });

  it("duplicates a multi-selection and deletes only the selected copies", () => {
    const store = useStudioStore.getState();
    store.addObject("cube");
    const firstId = useStudioStore.getState().selectedObjectId!;
    store.addObject("sphere");
    const secondId = useStudioStore.getState().selectedObjectId!;

    store.selectObject(firstId);
    store.selectObject(secondId, true);
    store.duplicateSelectedObjects();

    expect(useStudioStore.getState().objects).toHaveLength(4);
    expect(useStudioStore.getState().selectedObjectIds).toHaveLength(2);
    store.deleteSelectedObjects();
    expect(useStudioStore.getState().objects).toHaveLength(2);
    expect(useStudioStore.getState().selectedObjectIds).toEqual([]);
  });

  it("saves and organizes a local artwork without collecting personal data", () => {
    const store = useStudioStore.getState();
    store.addObject("torus");
    store.setArtworkTitle("  Solar playground  ");
    const artwork = store.saveArtwork("data:image/png;base64,preview");
    const folderId = store.createGalleryFolder("  My worlds  ");

    expect(artwork).not.toBeNull();
    store.assignArtworkFolder(artwork!.id, folderId);
    store.setArtworkTags(artwork!.id, ["space", "space", "  bright ideas "]);
    store.toggleArtworkFavorite(artwork!.id);

    expect(useStudioStore.getState().savedArtworks[0]).toMatchObject({
      title: "Solar playground",
      folderId,
      tags: ["space", "bright ideas"],
      isFavorite: true,
    });
  });

  it("records real save and reflection events for the educator report", () => {
    const store = useStudioStore.getState();
    store.addObject("sphere");
    const artwork = store.saveArtwork();
    expect(artwork).not.toBeNull();

    store.saveSessionReflection("I changed the light.", "notice");

    expect(useStudioStore.getState().activityHistory).toHaveLength(2);
    expect(useStudioStore.getState().activityHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "save",
          objectCount: 1,
          sourceId: artwork!.id,
        }),
        expect.objectContaining({
          type: "reflection",
          objectCount: 1,
        }),
      ])
    );
    expect(useStudioStore.getState().activityHistory[0]).not.toHaveProperty(
      "answer"
    );
  });

  it("loads a complete classroom starter through the same creative engine", () => {
    useStudioStore.getState().loadClassroomStarter("underwater");

    const state = useStudioStore.getState();
    expect(state.artworkTitle).toBe("Our underwater discovery lab");
    expect(state.environment).toBe("underwater");
    expect(state.objects).toHaveLength(4);
    expect(state.tutorialStep).toBe("done");
  });

  it("ignores malformed LocalStorage state rather than loading an unsafe scene", async () => {
    localStorage.setItem(
      "creative-art-studio-v2",
      JSON.stringify({
        state: {
          artworkTitle: "Broken saved world",
          objects: [
            {
              id: "bad-object",
              name: "Broken cube",
              type: "cube",
              position: ["not-a-number", 0, 0],
            },
          ],
        },
        version: 0,
      })
    );

    await useStudioStore.persist.rehydrate();

    expect(useStudioStore.getState().objects).toEqual([]);
    expect(useStudioStore.getState().artworkTitle).toBe("My tiny world");
  });
});
