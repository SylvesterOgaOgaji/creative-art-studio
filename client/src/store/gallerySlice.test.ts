import { describe, expect, it } from "vitest";
import type { GalleryFolder, SavedArtwork, StudioObject } from "@/types/studio";
import type { StudioState } from "./useStudioStore";
import { createGalleryActions } from "./gallerySlice";

const makeObject = (id = "object-1"): StudioObject => ({
  id,
  name: "Friendly cube",
  type: "cube",
  position: [0, 1, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: "#FF6B4A",
  material: "matte",
  texture: "plain",
  sticker: "none",
});

const makeArtwork = (id = "artwork-1"): SavedArtwork => ({
  id,
  title: "A bright world",
  createdAt: "2026-08-18T12:00:00.000Z",
  objects: [makeObject()],
  lighting: "daylight",
  environment: "atelier",
  isFavorite: false,
  tags: [],
});

function createHarness(overrides: Partial<StudioState> = {}) {
  let state = {
    objects: [],
    artworkTitle: "My tiny world",
    lighting: "daylight",
    environment: "atelier",
    savedArtworks: [],
    galleryFolders: [],
    makerSpotlights: [],
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

  const actions = createGalleryActions(set, () => state);
  return { actions, getState: () => state };
}

describe("gallery slice", () => {
  it("does not save an empty scene and clones saved objects", () => {
    const empty = createHarness();
    expect(empty.actions.saveArtwork()).toBeNull();

    const source = makeObject();
    const harness = createHarness({
      objects: [source],
      artworkTitle: "  Solar playground  ",
    });
    const artwork = harness.actions.saveArtwork(
      "data:image/png;base64,preview"
    );

    expect(artwork).toMatchObject({
      title: "Solar playground",
      thumbnailDataUrl: "data:image/png;base64,preview",
      isFavorite: false,
      tags: [],
    });
    expect(artwork!.objects).not.toBe(harness.getState().objects);
    expect(artwork!.objects[0]).not.toBe(source);
    expect(artwork!.objects[0].position).not.toBe(source.position);
  });

  it("loads a saved artwork into an isolated editable scene", () => {
    const artwork = makeArtwork();
    const harness = createHarness({
      savedArtworks: [artwork],
      galleryOpen: true,
      transformInProgress: true,
    });

    harness.actions.loadArtwork(artwork.id);
    const loaded = harness.getState();

    expect(loaded).toMatchObject({
      artworkTitle: artwork.title,
      lighting: "daylight",
      environment: "atelier",
      galleryOpen: false,
      transformInProgress: false,
      selectedObjectId: "object-1",
      selectedObjectIds: ["object-1"],
    });
    expect(loaded.objects).toEqual(artwork.objects);
    expect(loaded.objects[0]).not.toBe(artwork.objects[0]);

    loaded.objects[0].position[0] = 9;
    expect(artwork.objects[0].position[0]).toBe(0);
  });

  it("normalizes folders, tags, and favorites while avoiding duplicate folders", () => {
    const harness = createHarness({ savedArtworks: [makeArtwork()] });
    const firstFolderId =
      harness.actions.createGalleryFolder("  My   Worlds  ");
    const duplicateFolderId = harness.actions.createGalleryFolder("my worlds");

    expect(firstFolderId).toBeTruthy();
    expect(duplicateFolderId).toBe(firstFolderId);
    expect(harness.getState().galleryFolders).toHaveLength(1);

    harness.actions.assignArtworkFolder("artwork-1", firstFolderId);
    harness.actions.setArtworkTags("artwork-1", [
      " space ",
      "space",
      " bright   ideas ",
      "",
      "colourful",
    ]);
    harness.actions.toggleArtworkFavorite("artwork-1");

    expect(harness.getState().savedArtworks[0]).toMatchObject({
      folderId: firstFolderId,
      tags: ["space", "bright ideas", "colourful"],
      isFavorite: true,
    });
  });

  it("clears artwork folder references and spotlights when records are removed", () => {
    const folder: GalleryFolder = {
      id: "folder-1",
      name: "Class gallery",
      createdAt: "2026-08-18T12:00:00.000Z",
    };
    const harness = createHarness({
      savedArtworks: [{ ...makeArtwork(), folderId: folder.id }],
      galleryFolders: [folder],
    });

    harness.actions.setMakerSpotlight(
      "artwork-1",
      "  Ada   Maker ",
      "  A joyful world  "
    );
    expect(harness.getState().makerSpotlights).toEqual([
      {
        artworkId: "artwork-1",
        makerName: "Ada Maker",
        note: "A joyful world",
      },
    ]);

    harness.actions.deleteGalleryFolder(folder.id);
    expect(harness.getState().savedArtworks[0].folderId).toBeUndefined();

    harness.actions.deleteArtwork("artwork-1");
    expect(harness.getState().savedArtworks).toEqual([]);
    expect(harness.getState().makerSpotlights).toEqual([]);
  });

  it("ignores invalid folder and spotlight input without mutating the gallery", () => {
    const harness = createHarness({ savedArtworks: [makeArtwork()] });

    expect(harness.actions.createGalleryFolder("   ")).toBeNull();
    harness.actions.setMakerSpotlight("missing-artwork", "A maker");
    harness.actions.setMakerSpotlight("artwork-1", "   ");

    expect(harness.getState().galleryFolders).toEqual([]);
    expect(harness.getState().makerSpotlights).toEqual([]);
  });
});
