/**
 * Playful Atelier design reminder: scene state makes experimentation safe, reversible,
 * and entirely browser-local. Multi-select stays lightweight by reusing the same scene data.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parsePersistedStudioState } from "@/lib/studioPersistence";
import type {
  ClassroomStarterTheme,
  GalleryFolder,
  MakerSpotlight,
  SavedArtwork,
  SessionDuration,
  SessionReflection,
  StudioAgeMode,
  StudioEnvironment,
  StudioLighting,
  StudioMaterial,
  StudioObject,
  StudioObjectType,
  StudioSticker,
  StudioTexture,
  TransformMode,
  TutorialStep,
  Vector3Tuple,
} from "@/types/studio";

const HISTORY_LIMIT = 40;
const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
const cloneObject = (object: StudioObject): StudioObject => ({
  ...object,
  position: [...object.position] as Vector3Tuple,
  rotation: [...object.rotation] as Vector3Tuple,
  scale: [...object.scale] as Vector3Tuple,
});

interface StudioState {
  artworkTitle: string;
  objects: StudioObject[];
  lighting: StudioLighting;
  environment: StudioEnvironment;
  ageMode: StudioAgeMode;
  selectedObjectId: string | null;
  selectedObjectIds: string[];
  multiSelectMode: boolean;
  transformMode: TransformMode;
  transformInProgress: boolean;
  past: SceneSnapshot[];
  future: SceneSnapshot[];
  savedArtworks: SavedArtwork[];
  galleryFolders: GalleryFolder[];
  makerSpotlights: MakerSpotlight[];
  galleryOpen: boolean;
  tutorialStep: TutorialStep;
  soundEnabled: boolean;
  soundVolume: number;
  challengeIndex: number;
  completedChallengeIds: number[];
  sessionDuration: SessionDuration;
  lastSessionReflection: SessionReflection | null;
  setArtworkTitle: (title: string) => void;
  setGalleryOpen: (isOpen: boolean) => void;
  setLighting: (lighting: StudioLighting) => void;
  setEnvironment: (environment: StudioEnvironment) => void;
  setAgeMode: (ageMode: StudioAgeMode) => void;
  setSoundEnabled: (isEnabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  selectObject: (id: string | null, additive?: boolean) => void;
  setMultiSelectMode: (isEnabled: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  addObject: (type: StudioObjectType) => void;
  updateObject: (id: string, updates: Partial<StudioObject>) => void;
  updateObjectDuringTransform: (
    id: string,
    updates: Partial<StudioObject>
  ) => void;
  updateObjectsDuringTransform: (
    updates: Array<{ id: string; updates: Partial<StudioObject> }>
  ) => void;
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
  createGalleryFolder: (name: string) => string | null;
  renameGalleryFolder: (id: string, name: string) => void;
  deleteGalleryFolder: (id: string) => void;
  assignArtworkFolder: (artworkId: string, folderId: string | null) => void;
  setArtworkTags: (artworkId: string, tags: string[]) => void;
  setMakerSpotlight: (
    artworkId: string,
    makerName: string,
    note?: string
  ) => void;
  removeMakerSpotlight: (artworkId: string) => void;
  loadClassroomStarter: (theme?: ClassroomStarterTheme) => void;
  startTutorial: () => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
  nextChallenge: () => void;
  completeChallenge: (challengeId: number) => void;
  setSessionDuration: (duration: SessionDuration) => void;
  saveSessionReflection: (answer: string, promptId: string) => boolean;
  clearSessionReflection: () => void;
}

type SceneSnapshot = Pick<
  StudioState,
  | "artworkTitle"
  | "objects"
  | "lighting"
  | "environment"
  | "selectedObjectId"
  | "selectedObjectIds"
>;
const selectedIdsFor = (
  state: Pick<StudioState, "selectedObjectId" | "selectedObjectIds">
) =>
  state.selectedObjectIds?.length
    ? state.selectedObjectIds
    : state.selectedObjectId
      ? [state.selectedObjectId]
      : [];
const cloneSnapshot = (state: SceneSnapshot): SceneSnapshot => ({
  artworkTitle: state.artworkTitle,
  objects: state.objects.map(cloneObject),
  lighting: state.lighting ?? "daylight",
  environment: state.environment ?? "atelier",
  selectedObjectId: state.selectedObjectId,
  selectedObjectIds: selectedIdsFor(state),
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
    texture: "plain",
    sticker: "none",
  };
};

const classroomStarterScene = (theme: ClassroomStarterTheme) => {
  const starters: Record<
    ClassroomStarterTheme,
    {
      title: string;
      lighting: StudioLighting;
      environment: StudioEnvironment;
      objects: StudioObject[];
    }
  > = {
    garden: {
      title: "Our tiny future garden",
      lighting: "daylight",
      environment: "atelier",
      objects: [
        {
          id: makeId(),
          name: "Garden ground",
          type: "cube",
          position: [0, 0.22, 0],
          rotation: [0, 0.08, 0],
          scale: [1.9, 0.34, 1.5],
          color: "#4EB69D",
          material: "matte",
          texture: "dots",
          sticker: "none",
        },
        {
          id: makeId(),
          name: "Story tower",
          type: "cylinder",
          position: [-0.76, 1.02, 0.16],
          rotation: [0, 0.18, 0],
          scale: [0.42, 0.8, 0.42],
          color: "#4666E9",
          material: "glossy",
          texture: "plain",
          sticker: "star",
        },
        {
          id: makeId(),
          name: "Tree crown",
          type: "sphere",
          position: [0.64, 1.5, -0.08],
          rotation: [0, 0.25, 0],
          scale: [0.76, 0.76, 0.76],
          color: "#F6C945",
          material: "matte",
          texture: "checkerboard",
          sticker: "smile",
        },
        {
          id: makeId(),
          name: "Idea flag",
          type: "cone",
          position: [0.08, 1.08, 0.7],
          rotation: [0.2, 0.55, 0],
          scale: [0.5, 0.68, 0.5],
          color: "#FF6B4A",
          material: "neon",
          texture: "glitter",
          sticker: "heart",
        },
      ],
    },
    space: {
      title: "Our friendly space station",
      lighting: "neon",
      environment: "space",
      objects: [
        {
          id: makeId(),
          name: "Launch pad",
          type: "cylinder",
          position: [0, 0.24, 0],
          rotation: [0, 0.1, 0],
          scale: [1.55, 0.34, 1.55],
          color: "#4666E9",
          material: "metallic",
          texture: "checkerboard",
          sticker: "none",
        },
        {
          id: makeId(),
          name: "Orbit friend",
          type: "sphere",
          position: [-0.82, 1.16, 0.08],
          rotation: [0, 0.2, 0],
          scale: [0.65, 0.65, 0.65],
          color: "#F6C945",
          material: "glossy",
          texture: "plain",
          sticker: "smile",
        },
        {
          id: makeId(),
          name: "Signal hoop",
          type: "torus",
          position: [0.68, 1.3, -0.2],
          rotation: [0.45, 0.2, 0.24],
          scale: [0.75, 0.75, 0.75],
          color: "#C85A91",
          material: "neon",
          texture: "glitter",
          sticker: "star",
        },
        {
          id: makeId(),
          name: "Idea comet",
          type: "cone",
          position: [0.04, 1.68, 0.58],
          rotation: [0.55, 0.15, 0.38],
          scale: [0.48, 0.78, 0.48],
          color: "#72BFE8",
          material: "metallic",
          texture: "stripes",
          sticker: "heart",
        },
      ],
    },
    underwater: {
      title: "Our underwater discovery lab",
      lighting: "daylight",
      environment: "underwater",
      objects: [
        {
          id: makeId(),
          name: "Sea floor",
          type: "cube",
          position: [0, 0.2, 0],
          rotation: [0, -0.1, 0],
          scale: [1.95, 0.3, 1.55],
          color: "#4EB69D",
          material: "matte",
          texture: "dots",
          sticker: "none",
        },
        {
          id: makeId(),
          name: "Bubble home",
          type: "sphere",
          position: [-0.67, 1.12, 0.15],
          rotation: [0, 0.25, 0],
          scale: [0.7, 0.7, 0.7],
          color: "#72BFE8",
          material: "glossy",
          texture: "glitter",
          sticker: "smile",
        },
        {
          id: makeId(),
          name: "Coral tower",
          type: "cone",
          position: [0.66, 1.06, -0.14],
          rotation: [0, -0.24, 0],
          scale: [0.62, 0.85, 0.62],
          color: "#FF6B4A",
          material: "matte",
          texture: "stripes",
          sticker: "heart",
        },
        {
          id: makeId(),
          name: "Treasure ring",
          type: "torus",
          position: [0.1, 1.62, 0.58],
          rotation: [0.44, 0.1, -0.12],
          scale: [0.63, 0.63, 0.63],
          color: "#F6C945",
          material: "metallic",
          texture: "checkerboard",
          sticker: "star",
        },
      ],
    },
  };
  return starters[theme];
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => {
      const commit = (next: Partial<SceneSnapshot>) => {
        const current = get();
        set({
          ...next,
          past: [...current.past, cloneSnapshot(current)].slice(-HISTORY_LIMIT),
          future: [],
        });
      };
      const editSelected = (updates: Partial<StudioObject>) => {
        const current = get();
        const ids = new Set(selectedIdsFor(current));
        if (!ids.size) return;
        commit({
          objects: current.objects.map(object =>
            ids.has(object.id) ? { ...object, ...updates } : object
          ),
        });
      };

      return {
        artworkTitle: "My tiny world",
        objects: [],
        lighting: "daylight",
        environment: "atelier",
        ageMode: "creator",
        selectedObjectId: null,
        selectedObjectIds: [],
        multiSelectMode: false,
        transformMode: "translate",
        transformInProgress: false,
        past: [],
        future: [],
        savedArtworks: [],
        galleryFolders: [],
        makerSpotlights: [],
        galleryOpen: false,
        tutorialStep: "welcome",
        soundEnabled: false,
        soundVolume: 0.62,
        challengeIndex: 0,
        completedChallengeIds: [],
        sessionDuration: "extended",
        lastSessionReflection: null,
        setArtworkTitle: artworkTitle => set({ artworkTitle }),
        setGalleryOpen: galleryOpen => set({ galleryOpen }),
        setLighting: lighting => commit({ lighting }),
        setEnvironment: environment => commit({ environment }),
        setAgeMode: ageMode =>
          set(state =>
            ageMode === "explorer"
              ? {
                  ageMode,
                  transformMode: "translate",
                  multiSelectMode: false,
                  selectedObjectIds: state.selectedObjectId
                    ? [state.selectedObjectId]
                    : [],
                }
              : { ageMode }
          ),
        setSoundEnabled: soundEnabled => set({ soundEnabled }),
        setSoundVolume: soundVolume =>
          set({ soundVolume: Math.max(0, Math.min(1, soundVolume)) }),
        selectObject: (id, additive = false) =>
          set(state => {
            if (!id) return { selectedObjectId: null, selectedObjectIds: [] };
            const current = selectedIdsFor(state);
            if (additive) {
              const next = current.includes(id)
                ? current.filter(entry => entry !== id)
                : [...current, id];
              return {
                selectedObjectIds: next,
                selectedObjectId: next.at(-1) ?? null,
              };
            }
            return { selectedObjectId: id, selectedObjectIds: [id] };
          }),
        setMultiSelectMode: multiSelectMode =>
          set(state => ({
            multiSelectMode,
            ...(multiSelectMode
              ? {}
              : {
                  selectedObjectIds: state.selectedObjectId
                    ? [state.selectedObjectId]
                    : [],
                }),
          })),
        setTransformMode: transformMode => set({ transformMode }),
        addObject: type => {
          const object = createObject(type, get().objects.length);
          commit({
            objects: [...get().objects, object],
            selectedObjectId: object.id,
            selectedObjectIds: [object.id],
          });
          if (get().tutorialStep === "add") set({ tutorialStep: "move" });
        },
        updateObject: (id, updates) => {
          const current = get();
          if (current.objects.some(object => object.id === id)) {
            commit({
              objects: current.objects.map(object =>
                object.id === id ? { ...object, ...updates } : object
              ),
            });
            if (current.tutorialStep === "move")
              set({ tutorialStep: "colour" });
          }
        },
        updateObjectDuringTransform: (id, updates) =>
          set(state => ({
            objects: state.objects.map(object =>
              object.id === id ? { ...object, ...updates } : object
            ),
          })),
        updateObjectsDuringTransform: updates =>
          set(state => {
            const byId = new Map(
              updates.map(entry => [entry.id, entry.updates])
            );
            return {
              objects: state.objects.map(object =>
                byId.has(object.id)
                  ? { ...object, ...byId.get(object.id) }
                  : object
              ),
            };
          }),
        beginDirectTransform: () => {
          const current = get();
          if (current.transformInProgress || !selectedIdsFor(current).length)
            return;
          set({
            transformInProgress: true,
            past: [...current.past, cloneSnapshot(current)].slice(
              -HISTORY_LIMIT
            ),
            future: [],
          });
        },
        finishDirectTransform: () =>
          set(state => ({
            transformInProgress: false,
            ...(state.tutorialStep === "move"
              ? { tutorialStep: "colour" }
              : {}),
          })),
        setSelectedColor: color => {
          editSelected({ color });
          if (get().tutorialStep === "colour" && selectedIdsFor(get()).length)
            set({ tutorialStep: "done" });
        },
        setSelectedMaterial: material => editSelected({ material }),
        setSelectedTexture: texture => editSelected({ texture }),
        setSelectedSticker: sticker => editSelected({ sticker }),
        duplicateSelectedObjects: () => {
          const current = get();
          const ids = new Set(selectedIdsFor(current));
          const copies = current.objects
            .filter(object => ids.has(object.id))
            .map((object, index) => ({
              ...cloneObject(object),
              id: makeId(),
              name: `${object.name} copy`,
              position: [
                object.position[0] + 0.48 + index * 0.1,
                object.position[1] + 0.34,
                object.position[2] - 0.34,
              ] as Vector3Tuple,
            }));
          if (!copies.length) return;
          commit({
            objects: [...current.objects, ...copies],
            selectedObjectId: copies.at(-1)?.id ?? null,
            selectedObjectIds: copies.map(object => object.id),
          });
        },
        deleteSelectedObject: () => get().deleteSelectedObjects(),
        deleteSelectedObjects: () => {
          const current = get();
          const ids = new Set(selectedIdsFor(current));
          if (ids.size)
            commit({
              objects: current.objects.filter(object => !ids.has(object.id)),
              selectedObjectId: null,
              selectedObjectIds: [],
            });
        },
        clearScene: () => {
          if (get().objects.length)
            commit({
              objects: [],
              selectedObjectId: null,
              selectedObjectIds: [],
            });
        },
        surpriseMe: () => {
          const palette = [
            "#FF6B4A",
            "#4666E9",
            "#4EB69D",
            "#F6C945",
            "#C85A91",
            "#72BFE8",
          ];
          const types: StudioObjectType[] = [
            "torus",
            "sphere",
            "cone",
            "cube",
            "cylinder",
            "sphere",
            "torus",
          ];
          const anchors: Vector3Tuple[] = [
            [-1.9, 0.9, 0.3],
            [-0.75, 1.5, -0.4],
            [0.55, 0.75, 0.1],
            [1.85, 1.15, -0.35],
            [0.05, 2.25, -0.9],
            [-1.25, 0.6, -1.25],
            [1.35, 0.55, -1.4],
          ];
          const materials: StudioMaterial[] = [
            "matte",
            "glossy",
            "metallic",
            "neon",
            "matte",
            "glossy",
            "metallic",
          ];
          const arrangement: StudioObject[] = types.map((type, index) => {
            const wobble = () => (Math.random() - 0.5) * 0.32;
            const size = 0.72 + Math.random() * 0.72;
            return {
              id: makeId(),
              name: `${titleCase(type)} spark ${index + 1}`,
              type,
              position: [
                anchors[index][0] + wobble(),
                anchors[index][1] + wobble(),
                anchors[index][2] + wobble(),
              ] as Vector3Tuple,
              rotation: [
                Math.random() * 1.1,
                Math.random() * Math.PI,
                Math.random() * 0.8,
              ] as Vector3Tuple,
              scale: [
                size,
                size * (0.85 + Math.random() * 0.35),
                size,
              ] as Vector3Tuple,
              color: palette[index % palette.length],
              material: materials[index],
              texture:
                index % 3 === 0
                  ? "dots"
                  : index % 3 === 1
                    ? "stripes"
                    : "plain",
              sticker: index % 3 === 0 ? "star" : "none",
            };
          });
          commit({
            objects: arrangement,
            selectedObjectId: arrangement[0].id,
            selectedObjectIds: [arrangement[0].id],
            artworkTitle: "A surprised little universe",
          });
        },
        undo: () => {
          const current = get();
          const previous = current.past.at(-1);
          if (previous)
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
          if (next)
            set({
              ...cloneSnapshot(next),
              past: [...current.past, cloneSnapshot(current)].slice(
                -HISTORY_LIMIT
              ),
              future: current.future.slice(1),
              transformInProgress: false,
            });
        },
        saveArtwork: thumbnailDataUrl => {
          const { objects, artworkTitle, lighting, environment } = get();
          if (!objects.length) return null;
          const artwork: SavedArtwork = {
            id: makeId(),
            title: artworkTitle.trim() || "Untitled artwork",
            createdAt: new Date().toISOString(),
            objects: objects.map(cloneObject),
            lighting,
            environment,
            thumbnailDataUrl,
            isFavorite: false,
            tags: [],
          };
          set(state => ({
            savedArtworks: [artwork, ...state.savedArtworks].slice(0, 24),
          }));
          return artwork;
        },
        loadArtwork: id => {
          const artwork = get().savedArtworks.find(entry => entry.id === id);
          if (!artwork) return;
          const objects = artwork.objects.map(cloneObject);
          set({
            objects,
            artworkTitle: artwork.title,
            lighting: artwork.lighting ?? "daylight",
            environment: artwork.environment ?? "atelier",
            selectedObjectId: objects[0]?.id ?? null,
            selectedObjectIds: objects[0] ? [objects[0].id] : [],
            galleryOpen: false,
            transformInProgress: false,
          });
        },
        deleteArtwork: id =>
          set(state => ({
            savedArtworks: state.savedArtworks.filter(entry => entry.id !== id),
            makerSpotlights: state.makerSpotlights.filter(
              spotlight => spotlight.artworkId !== id
            ),
          })),
        renameArtwork: (id, title) => {
          const nextTitle = title.trim();
          if (nextTitle)
            set(state => ({
              savedArtworks: state.savedArtworks.map(artwork =>
                artwork.id === id
                  ? { ...artwork, title: nextTitle.slice(0, 48) }
                  : artwork
              ),
            }));
        },
        toggleArtworkFavorite: id =>
          set(state => ({
            savedArtworks: state.savedArtworks.map(artwork =>
              artwork.id === id
                ? { ...artwork, isFavorite: !artwork.isFavorite }
                : artwork
            ),
          })),
        createGalleryFolder: name => {
          const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 24);
          if (!cleaned) return null;
          const existing = get().galleryFolders.find(
            folder =>
              folder.name.toLocaleLowerCase() === cleaned.toLocaleLowerCase()
          );
          if (existing) return existing.id;
          const folder = {
            id: makeId(),
            name: cleaned,
            createdAt: new Date().toISOString(),
          };
          set(state => ({ galleryFolders: [...state.galleryFolders, folder] }));
          return folder.id;
        },
        renameGalleryFolder: (id, name) => {
          const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 24);
          if (cleaned)
            set(state => ({
              galleryFolders: state.galleryFolders.map(folder =>
                folder.id === id ? { ...folder, name: cleaned } : folder
              ),
            }));
        },
        deleteGalleryFolder: id =>
          set(state => ({
            galleryFolders: state.galleryFolders.filter(
              folder => folder.id !== id
            ),
            savedArtworks: state.savedArtworks.map(artwork =>
              artwork.folderId === id
                ? { ...artwork, folderId: undefined }
                : artwork
            ),
          })),
        assignArtworkFolder: (artworkId, folderId) =>
          set(state => ({
            savedArtworks: state.savedArtworks.map(artwork =>
              artwork.id === artworkId
                ? { ...artwork, folderId: folderId ?? undefined }
                : artwork
            ),
          })),
        setArtworkTags: (artworkId, tags) => {
          const cleaned = Array.from(
            new Set(
              tags
                .map(tag => tag.trim().replace(/\s+/g, " ").slice(0, 18))
                .filter(Boolean)
            )
          ).slice(0, 6);
          set(state => ({
            savedArtworks: state.savedArtworks.map(artwork =>
              artwork.id === artworkId ? { ...artwork, tags: cleaned } : artwork
            ),
          }));
        },
        setMakerSpotlight: (artworkId, makerName, note) => {
          const cleanedName = makerName
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 32);
          if (
            !cleanedName ||
            !get().savedArtworks.some(artwork => artwork.id === artworkId)
          )
            return;
          const cleanedNote =
            note?.trim().replace(/\s+/g, " ").slice(0, 90) || undefined;
          set(state => ({
            makerSpotlights: [
              ...state.makerSpotlights.filter(
                spotlight => spotlight.artworkId !== artworkId
              ),
              { artworkId, makerName: cleanedName, note: cleanedNote },
            ].slice(-12),
          }));
        },
        removeMakerSpotlight: artworkId =>
          set(state => ({
            makerSpotlights: state.makerSpotlights.filter(
              spotlight => spotlight.artworkId !== artworkId
            ),
          })),
        loadClassroomStarter: (theme = "garden") => {
          const starter = classroomStarterScene(theme);
          commit({
            artworkTitle: starter.title,
            objects: starter.objects,
            lighting: starter.lighting,
            environment: starter.environment,
            selectedObjectId: starter.objects[0].id,
            selectedObjectIds: [starter.objects[0].id],
          });
          set({
            ageMode: "creator",
            multiSelectMode: false,
            transformMode: "translate",
            tutorialStep: "done",
          });
        },
        startTutorial: () => set({ tutorialStep: "add" }),
        skipTutorial: () => set({ tutorialStep: "done" }),
        replayTutorial: () => set({ tutorialStep: "add" }),
        nextChallenge: () =>
          set(state => ({ challengeIndex: state.challengeIndex + 1 })),
        completeChallenge: challengeId =>
          set(state =>
            state.completedChallengeIds.includes(challengeId)
              ? state
              : {
                  completedChallengeIds: [
                    ...state.completedChallengeIds,
                    challengeId,
                  ],
                }
          ),
        setSessionDuration: sessionDuration => set({ sessionDuration }),
        saveSessionReflection: (answer, promptId) => {
          const cleaned = answer.trim().replace(/\s+/g, " ").slice(0, 240);
          if (!cleaned) return false;
          set({
            lastSessionReflection: {
              id: makeId(),
              createdAt: new Date().toISOString(),
              promptId,
              answer: cleaned,
              objectCount: get().objects.length,
            },
          });
          return true;
        },
        clearSessionReflection: () => set({ lastSessionReflection: null }),
      };
    },
    {
      name: "creative-art-studio-v2",
      partialize: state => ({
        artworkTitle: state.artworkTitle,
        objects: state.objects,
        lighting: state.lighting,
        environment: state.environment,
        ageMode: state.ageMode,
        savedArtworks: state.savedArtworks,
        galleryFolders: state.galleryFolders,
        makerSpotlights: state.makerSpotlights,
        tutorialStep: state.tutorialStep,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        challengeIndex: state.challengeIndex,
        completedChallengeIds: state.completedChallengeIds,
        sessionDuration: state.sessionDuration,
        lastSessionReflection: state.lastSessionReflection,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...parsePersistedStudioState(persistedState),
      }),
    }
  )
);
