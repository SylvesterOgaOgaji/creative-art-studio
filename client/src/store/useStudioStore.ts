/**
 * Playful Atelier design reminder: scene state makes experimentation safe, reversible,
 * and entirely browser-local. Multi-select stays lightweight by reusing the same scene data.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parsePersistedStudioState } from "@/lib/studioPersistence";
import { getClassroomStarter } from "./classroomStarters";
import { createGalleryActions } from "./gallerySlice";
import { createHistoryActions } from "./historySlice";
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

export interface StudioState {
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

export type SceneSnapshot = Pick<
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

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => {
      const { commit, ...historyActions } = createHistoryActions(set, get);
      const galleryActions = createGalleryActions(set, get);
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
        ...historyActions,
        ...galleryActions,
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
        loadClassroomStarter: (theme = "garden") => {
          const starter = getClassroomStarter(theme);
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
