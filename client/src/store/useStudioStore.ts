/**
 * Playful Atelier design reminder: scene state must make creative experimentation safe.
 * History is intentionally bounded and direct transforms are grouped into one reversible move.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SavedArtwork,
  StudioMaterial,
  StudioObject,
  StudioObjectType,
  TransformMode,
  Vector3Tuple,
} from "@/types/studio";

const HISTORY_LIMIT = 40;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const cloneObject = (object: StudioObject): StudioObject => ({
  ...object,
  position: [...object.position] as Vector3Tuple,
  rotation: [...object.rotation] as Vector3Tuple,
  scale: [...object.scale] as Vector3Tuple,
});

type SceneSnapshot = Pick<StudioState, "artworkTitle" | "objects" | "selectedObjectId">;

const cloneSnapshot = (state: SceneSnapshot): SceneSnapshot => ({
  artworkTitle: state.artworkTitle,
  objects: state.objects.map(cloneObject),
  selectedObjectId: state.selectedObjectId,
});

const createObject = (type: StudioObjectType, count: number): StudioObject => {
  const column = (count % 3) - 1;
  const row = Math.floor(count / 3);
  return {
    id: makeId(), name: `${titleCase(type)} ${count + 1}`, type,
    position: [column * 1.35, 0.85, -row * 1.1], rotation: [0, count * 0.35, 0],
    scale: [1, 1, 1], color: "#FF6B4A", material: "matte",
  };
};

interface StudioState {
  artworkTitle: string;
  objects: StudioObject[];
  selectedObjectId: string | null;
  transformMode: TransformMode;
  transformInProgress: boolean;
  past: SceneSnapshot[];
  future: SceneSnapshot[];
  savedArtworks: SavedArtwork[];
  galleryOpen: boolean;
  setArtworkTitle: (title: string) => void;
  setGalleryOpen: (isOpen: boolean) => void;
  selectObject: (id: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  addObject: (type: StudioObjectType) => void;
  updateObject: (id: string, updates: Partial<StudioObject>) => void;
  updateObjectDuringTransform: (id: string, updates: Partial<StudioObject>) => void;
  beginDirectTransform: () => void;
  finishDirectTransform: () => void;
  setSelectedColor: (color: string) => void;
  setSelectedMaterial: (material: StudioMaterial) => void;
  deleteSelectedObject: () => void;
  clearScene: () => void;
  surpriseMe: () => void;
  undo: () => void;
  redo: () => void;
  saveArtwork: (thumbnailDataUrl?: string) => SavedArtwork | null;
  loadArtwork: (id: string) => void;
  deleteArtwork: (id: string) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => {
      const commit = (next: Partial<SceneSnapshot>) => {
        const current = get();
        const before = cloneSnapshot(current);
        set({
          ...next,
          past: [...current.past, before].slice(-HISTORY_LIMIT),
          future: [],
        });
      };

      return {
        artworkTitle: "My tiny world", objects: [], selectedObjectId: null,
        transformMode: "translate", transformInProgress: false, past: [], future: [],
        savedArtworks: [], galleryOpen: false,
        setArtworkTitle: (artworkTitle) => set({ artworkTitle }),
        setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
        selectObject: (selectedObjectId) => set({ selectedObjectId }),
        setTransformMode: (transformMode) => set({ transformMode }),
        addObject: (type) => {
          const object = createObject(type, get().objects.length);
          commit({ objects: [...get().objects, object], selectedObjectId: object.id });
        },
        updateObject: (id, updates) => {
          const current = get();
          if (!current.objects.some((object) => object.id === id)) return;
          commit({ objects: current.objects.map((object) => object.id === id ? { ...object, ...updates } : object) });
        },
        updateObjectDuringTransform: (id, updates) => set((state) => ({
          objects: state.objects.map((object) => object.id === id ? { ...object, ...updates } : object),
        })),
        beginDirectTransform: () => {
          const current = get();
          if (current.transformInProgress || !current.selectedObjectId) return;
          set({
            transformInProgress: true,
            past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT),
            future: [],
          });
        },
        finishDirectTransform: () => set({ transformInProgress: false }),
        setSelectedColor: (color) => { const id = get().selectedObjectId; if (id) get().updateObject(id, { color }); },
        setSelectedMaterial: (material) => { const id = get().selectedObjectId; if (id) get().updateObject(id, { material }); },
        deleteSelectedObject: () => {
          const selectedId = get().selectedObjectId;
          if (!selectedId) return;
          commit({ objects: get().objects.filter((object) => object.id !== selectedId), selectedObjectId: null });
        },
        clearScene: () => { if (get().objects.length) commit({ objects: [], selectedObjectId: null }); },
        surpriseMe: () => {
          const palette = ["#FF6B4A", "#4666E9", "#4EB69D", "#F6C945", "#C85A91", "#72BFE8"];
          const types: StudioObjectType[] = ["torus", "sphere", "cone", "cube", "cylinder", "sphere", "torus"];
          const anchors: Vector3Tuple[] = [[-1.9, .9, .3], [-.75, 1.5, -.4], [.55, .75, .1], [1.85, 1.15, -.35], [.05, 2.25, -.9], [-1.25, .6, -1.25], [1.35, .55, -1.4]];
          const materials: StudioMaterial[] = ["matte", "glossy", "metallic", "neon", "matte", "glossy", "metallic"];
          const arrangement = types.map((type, index) => {
            const wobble = () => (Math.random() - .5) * .32;
            const size = .72 + Math.random() * .72;
            return {
              id: makeId(), name: `${titleCase(type)} spark ${index + 1}`, type,
              position: [anchors[index][0] + wobble(), anchors[index][1] + wobble(), anchors[index][2] + wobble()] as Vector3Tuple,
              rotation: [Math.random() * 1.1, Math.random() * Math.PI, Math.random() * .8] as Vector3Tuple,
              scale: [size, size * (.85 + Math.random() * .35), size] as Vector3Tuple,
              color: palette[index % palette.length], material: materials[index],
            };
          });
          commit({ objects: arrangement, selectedObjectId: arrangement[0].id, artworkTitle: "A surprised little universe" });
        },
        undo: () => {
          const current = get(); const previous = current.past.at(-1);
          if (!previous) return;
          set({ ...cloneSnapshot(previous), past: current.past.slice(0, -1), future: [cloneSnapshot(current), ...current.future].slice(0, HISTORY_LIMIT), transformInProgress: false });
        },
        redo: () => {
          const current = get(); const next = current.future[0];
          if (!next) return;
          set({ ...cloneSnapshot(next), past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT), future: current.future.slice(1), transformInProgress: false });
        },
        saveArtwork: (thumbnailDataUrl) => {
          const { objects, artworkTitle } = get(); if (!objects.length) return null;
          const artwork: SavedArtwork = { id: makeId(), title: artworkTitle.trim() || "Untitled artwork", createdAt: new Date().toISOString(), objects: objects.map(cloneObject), thumbnailDataUrl };
          set((state) => ({ savedArtworks: [artwork, ...state.savedArtworks].slice(0, 24) }));
          return artwork;
        },
        loadArtwork: (id) => {
          const artwork = get().savedArtworks.find((entry) => entry.id === id); if (!artwork) return;
          const objects = artwork.objects.map(cloneObject);
          set({ objects, artworkTitle: artwork.title, selectedObjectId: objects[0]?.id ?? null, galleryOpen: false, transformInProgress: false });
        },
        deleteArtwork: (id) => set((state) => ({ savedArtworks: state.savedArtworks.filter((entry) => entry.id !== id) })),
      };
    },
    { name: "creative-art-studio-v2", partialize: (state) => ({ artworkTitle: state.artworkTitle, objects: state.objects, savedArtworks: state.savedArtworks }) },
  ),
);
