/**
 * Playful Atelier design reminder: scene state makes experimentation safe, reversible,
 * and entirely browser-local. Multi-select stays lightweight by reusing the same scene data.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedArtwork, StudioLighting, StudioMaterial, StudioObject, StudioObjectType, StudioSticker, StudioTexture, TransformMode, TutorialStep, Vector3Tuple } from "@/types/studio";

const HISTORY_LIMIT = 40;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const cloneObject = (object: StudioObject): StudioObject => ({ ...object, position: [...object.position] as Vector3Tuple, rotation: [...object.rotation] as Vector3Tuple, scale: [...object.scale] as Vector3Tuple });

interface StudioState {
  artworkTitle: string;
  objects: StudioObject[];
  lighting: StudioLighting;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  multiSelectMode: boolean;
  transformMode: TransformMode;
  transformInProgress: boolean;
  past: SceneSnapshot[];
  future: SceneSnapshot[];
  savedArtworks: SavedArtwork[];
  galleryOpen: boolean;
  tutorialStep: TutorialStep;
  soundEnabled: boolean;
  challengeIndex: number;
  setArtworkTitle: (title: string) => void;
  setGalleryOpen: (isOpen: boolean) => void;
  setLighting: (lighting: StudioLighting) => void;
  setSoundEnabled: (isEnabled: boolean) => void;
  selectObject: (id: string | null, additive?: boolean) => void;
  setMultiSelectMode: (isEnabled: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  addObject: (type: StudioObjectType) => void;
  updateObject: (id: string, updates: Partial<StudioObject>) => void;
  updateObjectDuringTransform: (id: string, updates: Partial<StudioObject>) => void;
  updateObjectsDuringTransform: (updates: Array<{ id: string; updates: Partial<StudioObject> }>) => void;
  beginDirectTransform: () => void;
  finishDirectTransform: () => void;
  setSelectedColor: (color: string) => void;
  setSelectedMaterial: (material: StudioMaterial) => void;
  setSelectedTexture: (texture: StudioTexture) => void;
  setSelectedSticker: (sticker: StudioSticker) => void;
  duplicateSelectedObjects: () => void;
  deleteSelectedObject: () => void;
  deleteSelectedObjects: () => void;
  clearScene: () => void;
  surpriseMe: () => void;
  undo: () => void;
  redo: () => void;
  saveArtwork: (thumbnailDataUrl?: string) => SavedArtwork | null;
  loadArtwork: (id: string) => void;
  deleteArtwork: (id: string) => void;
  renameArtwork: (id: string, title: string) => void;
  toggleArtworkFavorite: (id: string) => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
  nextChallenge: () => void;
}

type SceneSnapshot = Pick<StudioState, "artworkTitle" | "objects" | "lighting" | "selectedObjectId" | "selectedObjectIds">;
const selectedIdsFor = (state: Pick<StudioState, "selectedObjectId" | "selectedObjectIds">) => state.selectedObjectIds?.length ? state.selectedObjectIds : state.selectedObjectId ? [state.selectedObjectId] : [];
const cloneSnapshot = (state: SceneSnapshot): SceneSnapshot => ({ artworkTitle: state.artworkTitle, objects: state.objects.map(cloneObject), lighting: state.lighting ?? "daylight", selectedObjectId: state.selectedObjectId, selectedObjectIds: selectedIdsFor(state) });

const createObject = (type: StudioObjectType, count: number): StudioObject => {
  const column = (count % 3) - 1;
  const row = Math.floor(count / 3);
  return { id: makeId(), name: `${titleCase(type)} ${count + 1}`, type, position: [column * 1.35, 0.85, -row * 1.1], rotation: [0, count * 0.35, 0], scale: [1, 1, 1], color: "#FF6B4A", material: "matte", texture: "plain", sticker: "none" };
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => {
      const commit = (next: Partial<SceneSnapshot>) => {
        const current = get();
        set({ ...next, past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT), future: [] });
      };
      const editSelected = (updates: Partial<StudioObject>) => {
        const current = get();
        const ids = new Set(selectedIdsFor(current));
        if (!ids.size) return;
        commit({ objects: current.objects.map((object) => ids.has(object.id) ? { ...object, ...updates } : object) });
      };

      return {
        artworkTitle: "My tiny world", objects: [], lighting: "daylight", selectedObjectId: null, selectedObjectIds: [], multiSelectMode: false,
        transformMode: "translate", transformInProgress: false, past: [], future: [], savedArtworks: [], galleryOpen: false, tutorialStep: "welcome", soundEnabled: false, challengeIndex: 0,
        setArtworkTitle: (artworkTitle) => set({ artworkTitle }),
        setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
        setLighting: (lighting) => commit({ lighting }),
        setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
        selectObject: (id, additive = false) => set((state) => {
          if (!id) return { selectedObjectId: null, selectedObjectIds: [] };
          const current = selectedIdsFor(state);
          if (additive) {
            const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
            return { selectedObjectIds: next, selectedObjectId: next.at(-1) ?? null };
          }
          return { selectedObjectId: id, selectedObjectIds: [id] };
        }),
        setMultiSelectMode: (multiSelectMode) => set((state) => ({ multiSelectMode, ...(multiSelectMode ? {} : { selectedObjectIds: state.selectedObjectId ? [state.selectedObjectId] : [] }) })),
        setTransformMode: (transformMode) => set({ transformMode }),
        addObject: (type) => { const object = createObject(type, get().objects.length); commit({ objects: [...get().objects, object], selectedObjectId: object.id, selectedObjectIds: [object.id] }); if (get().tutorialStep === "add") set({ tutorialStep: "move" }); },
        updateObject: (id, updates) => { const current = get(); if (current.objects.some((object) => object.id === id)) { commit({ objects: current.objects.map((object) => object.id === id ? { ...object, ...updates } : object) }); if (current.tutorialStep === "move") set({ tutorialStep: "colour" }); } },
        updateObjectDuringTransform: (id, updates) => set((state) => ({ objects: state.objects.map((object) => object.id === id ? { ...object, ...updates } : object) })),
        updateObjectsDuringTransform: (updates) => set((state) => { const byId = new Map(updates.map((entry) => [entry.id, entry.updates])); return { objects: state.objects.map((object) => byId.has(object.id) ? { ...object, ...byId.get(object.id) } : object) }; }),
        beginDirectTransform: () => { const current = get(); if (current.transformInProgress || !selectedIdsFor(current).length) return; set({ transformInProgress: true, past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT), future: [] }); },
        finishDirectTransform: () => set((state) => ({ transformInProgress: false, ...(state.tutorialStep === "move" ? { tutorialStep: "colour" } : {}) })),
        setSelectedColor: (color) => { editSelected({ color }); if (get().tutorialStep === "colour" && selectedIdsFor(get()).length) set({ tutorialStep: "done" }); },
        setSelectedMaterial: (material) => editSelected({ material }),
        setSelectedTexture: (texture) => editSelected({ texture }),
        setSelectedSticker: (sticker) => editSelected({ sticker }),
        duplicateSelectedObjects: () => {
          const current = get(); const ids = new Set(selectedIdsFor(current));
          const copies = current.objects.filter((object) => ids.has(object.id)).map((object, index) => ({ ...cloneObject(object), id: makeId(), name: `${object.name} copy`, position: [object.position[0] + .48 + index * .1, object.position[1] + .34, object.position[2] - .34] as Vector3Tuple }));
          if (!copies.length) return;
          commit({ objects: [...current.objects, ...copies], selectedObjectId: copies.at(-1)?.id ?? null, selectedObjectIds: copies.map((object) => object.id) });
        },
        deleteSelectedObject: () => get().deleteSelectedObjects(),
        deleteSelectedObjects: () => { const current = get(); const ids = new Set(selectedIdsFor(current)); if (ids.size) commit({ objects: current.objects.filter((object) => !ids.has(object.id)), selectedObjectId: null, selectedObjectIds: [] }); },
        clearScene: () => { if (get().objects.length) commit({ objects: [], selectedObjectId: null, selectedObjectIds: [] }); },
        surpriseMe: () => {
          const palette = ["#FF6B4A", "#4666E9", "#4EB69D", "#F6C945", "#C85A91", "#72BFE8"];
          const types: StudioObjectType[] = ["torus", "sphere", "cone", "cube", "cylinder", "sphere", "torus"];
          const anchors: Vector3Tuple[] = [[-1.9, .9, .3], [-.75, 1.5, -.4], [.55, .75, .1], [1.85, 1.15, -.35], [.05, 2.25, -.9], [-1.25, .6, -1.25], [1.35, .55, -1.4]];
          const materials: StudioMaterial[] = ["matte", "glossy", "metallic", "neon", "matte", "glossy", "metallic"];
          const arrangement: StudioObject[] = types.map((type, index) => { const wobble = () => (Math.random() - .5) * .32; const size = .72 + Math.random() * .72; return { id: makeId(), name: `${titleCase(type)} spark ${index + 1}`, type, position: [anchors[index][0] + wobble(), anchors[index][1] + wobble(), anchors[index][2] + wobble()] as Vector3Tuple, rotation: [Math.random() * 1.1, Math.random() * Math.PI, Math.random() * .8] as Vector3Tuple, scale: [size, size * (.85 + Math.random() * .35), size] as Vector3Tuple, color: palette[index % palette.length], material: materials[index], texture: index % 3 === 0 ? "dots" : index % 3 === 1 ? "stripes" : "plain", sticker: index % 3 === 0 ? "star" : "none" }; });
          commit({ objects: arrangement, selectedObjectId: arrangement[0].id, selectedObjectIds: [arrangement[0].id], artworkTitle: "A surprised little universe" });
        },
        undo: () => { const current = get(); const previous = current.past.at(-1); if (previous) set({ ...cloneSnapshot(previous), past: current.past.slice(0, -1), future: [cloneSnapshot(current), ...current.future].slice(0, HISTORY_LIMIT), transformInProgress: false }); },
        redo: () => { const current = get(); const next = current.future[0]; if (next) set({ ...cloneSnapshot(next), past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT), future: current.future.slice(1), transformInProgress: false }); },
        saveArtwork: (thumbnailDataUrl) => { const { objects, artworkTitle, lighting } = get(); if (!objects.length) return null; const artwork: SavedArtwork = { id: makeId(), title: artworkTitle.trim() || "Untitled artwork", createdAt: new Date().toISOString(), objects: objects.map(cloneObject), lighting, thumbnailDataUrl, isFavorite: false }; set((state) => ({ savedArtworks: [artwork, ...state.savedArtworks].slice(0, 24) })); return artwork; },
        loadArtwork: (id) => { const artwork = get().savedArtworks.find((entry) => entry.id === id); if (!artwork) return; const objects = artwork.objects.map(cloneObject); set({ objects, artworkTitle: artwork.title, lighting: artwork.lighting ?? "daylight", selectedObjectId: objects[0]?.id ?? null, selectedObjectIds: objects[0] ? [objects[0].id] : [], galleryOpen: false, transformInProgress: false }); },
        deleteArtwork: (id) => set((state) => ({ savedArtworks: state.savedArtworks.filter((entry) => entry.id !== id) })),
        renameArtwork: (id, title) => { const nextTitle = title.trim(); if (nextTitle) set((state) => ({ savedArtworks: state.savedArtworks.map((artwork) => artwork.id === id ? { ...artwork, title: nextTitle.slice(0, 48) } : artwork) })); },
        toggleArtworkFavorite: (id) => set((state) => ({ savedArtworks: state.savedArtworks.map((artwork) => artwork.id === id ? { ...artwork, isFavorite: !artwork.isFavorite } : artwork) })),
        startTutorial: () => set({ tutorialStep: "add" }),
        skipTutorial: () => set({ tutorialStep: "done" }),
        replayTutorial: () => set({ tutorialStep: "add" }),
        nextChallenge: () => set((state) => ({ challengeIndex: state.challengeIndex + 1 })),
      };
    },
    { name: "creative-art-studio-v2", partialize: (state) => ({ artworkTitle: state.artworkTitle, objects: state.objects, lighting: state.lighting, savedArtworks: state.savedArtworks, tutorialStep: state.tutorialStep, soundEnabled: state.soundEnabled, challengeIndex: state.challengeIndex }) },
  ),
);
