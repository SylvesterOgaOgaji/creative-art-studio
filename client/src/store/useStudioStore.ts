/**
 * Playful Atelier design reminder: this store is the calm, dependable engine behind
 * direct creative play. Keep interactions immediate and structured data portable.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SavedArtwork,
  StudioMaterial,
  StudioObject,
  StudioObjectType,
  Vector3Tuple,
} from "@/types/studio";

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const cloneObject = (object: StudioObject): StudioObject => ({
  ...object,
  position: [...object.position] as Vector3Tuple,
  rotation: [...object.rotation] as Vector3Tuple,
  scale: [...object.scale] as Vector3Tuple,
});

const createObject = (type: StudioObjectType, count: number): StudioObject => {
  const column = (count % 3) - 1;
  const row = Math.floor(count / 3);

  return {
    id: makeId(),
    name: `${titleCase(type)} ${count + 1}`,
    type,
    position: [column * 1.35, 0.85, -row * 1.1],
    rotation: [0, count * 0.35, 0],
    scale: [1, 1, 1],
    color: "#FF6B4A",
    material: "matte",
  };
};

interface StudioState {
  artworkTitle: string;
  objects: StudioObject[];
  selectedObjectId: string | null;
  savedArtworks: SavedArtwork[];
  galleryOpen: boolean;
  setArtworkTitle: (title: string) => void;
  setGalleryOpen: (isOpen: boolean) => void;
  selectObject: (id: string | null) => void;
  addObject: (type: StudioObjectType) => void;
  updateObject: (id: string, updates: Partial<StudioObject>) => void;
  setSelectedColor: (color: string) => void;
  setSelectedMaterial: (material: StudioMaterial) => void;
  deleteSelectedObject: () => void;
  clearScene: () => void;
  surpriseMe: () => void;
  saveArtwork: () => SavedArtwork | null;
  loadArtwork: (id: string) => void;
  deleteArtwork: (id: string) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      artworkTitle: "My tiny world",
      objects: [],
      selectedObjectId: null,
      savedArtworks: [],
      galleryOpen: false,
      setArtworkTitle: (artworkTitle) => set({ artworkTitle }),
      setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
      selectObject: (selectedObjectId) => set({ selectedObjectId }),
      addObject: (type) => {
        const object = createObject(type, get().objects.length);
        set((state) => ({ objects: [...state.objects, object], selectedObjectId: object.id }));
      },
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((object) =>
            object.id === id ? { ...object, ...updates } : object,
          ),
        })),
      setSelectedColor: (color) => {
        const id = get().selectedObjectId;
        if (id) get().updateObject(id, { color });
      },
      setSelectedMaterial: (material) => {
        const id = get().selectedObjectId;
        if (id) get().updateObject(id, { material });
      },
      deleteSelectedObject: () => {
        const selectedId = get().selectedObjectId;
        if (!selectedId) return;
        set((state) => ({
          objects: state.objects.filter((object) => object.id !== selectedId),
          selectedObjectId: null,
        }));
      },
      clearScene: () => set({ objects: [], selectedObjectId: null }),
      surpriseMe: () => {
        const palette = ["#FF6B4A", "#4666E9", "#4EB69D", "#F6C945", "#C85A91", "#72BFE8"];
        const types: StudioObjectType[] = ["torus", "sphere", "cone", "cube", "cylinder", "sphere", "torus"];
        const anchors: Vector3Tuple[] = [
          [-1.9, 0.9, 0.3],
          [-0.75, 1.5, -0.4],
          [0.55, 0.75, 0.1],
          [1.85, 1.15, -0.35],
          [0.05, 2.25, -0.9],
          [-1.25, 0.6, -1.25],
          [1.35, 0.55, -1.4],
        ];
        const materials: StudioMaterial[] = ["matte", "glossy", "metallic", "neon", "matte", "glossy", "metallic"];
        const arrangement = types.map((type, index) => {
          const wobble = () => (Math.random() - 0.5) * 0.32;
          const size = 0.72 + Math.random() * 0.72;
          return {
            id: makeId(),
            name: `${titleCase(type)} spark ${index + 1}`,
            type,
            position: [anchors[index][0] + wobble(), anchors[index][1] + wobble(), anchors[index][2] + wobble()] as Vector3Tuple,
            rotation: [Math.random() * 1.1, Math.random() * Math.PI, Math.random() * 0.8] as Vector3Tuple,
            scale: [size, size * (0.85 + Math.random() * 0.35), size] as Vector3Tuple,
            color: palette[index],
            material: materials[index],
          };
        });

        set({
          objects: arrangement,
          selectedObjectId: arrangement[0].id,
          artworkTitle: "A surprised little universe",
        });
      },
      saveArtwork: () => {
        const { objects, artworkTitle } = get();
        if (!objects.length) return null;
        const artwork: SavedArtwork = {
          id: makeId(),
          title: artworkTitle.trim() || "Untitled artwork",
          createdAt: new Date().toISOString(),
          objects: objects.map(cloneObject),
        };
        set((state) => ({ savedArtworks: [artwork, ...state.savedArtworks].slice(0, 24) }));
        return artwork;
      },
      loadArtwork: (id) => {
        const artwork = get().savedArtworks.find((entry) => entry.id === id);
        if (!artwork) return;
        const objects = artwork.objects.map(cloneObject);
        set({
          objects,
          artworkTitle: artwork.title,
          selectedObjectId: objects[0]?.id ?? null,
          galleryOpen: false,
        });
      },
      deleteArtwork: (id) =>
        set((state) => ({ savedArtworks: state.savedArtworks.filter((entry) => entry.id !== id) })),
    }),
    {
      name: "creative-art-studio-v1",
      partialize: (state) => ({
        artworkTitle: state.artworkTitle,
        objects: state.objects,
        savedArtworks: state.savedArtworks,
      }),
    },
  ),
);
