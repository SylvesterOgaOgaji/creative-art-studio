import type { SavedArtwork } from "@/types/studio";
import type { StudioState } from "./useStudioStore";
import { cloneStudioObject, makeStudioId } from "./studioHelpers";

type StudioSet = (
  partial: Partial<StudioState> | ((state: StudioState) => Partial<StudioState>)
) => void;
type StudioGet = () => StudioState;

/** Browser-local gallery actions are isolated from scene editing for future storage adapters. */
export function createGalleryActions(set: StudioSet, get: StudioGet) {
  return {
    saveArtwork: (thumbnailDataUrl?: string): SavedArtwork | null => {
      const { objects, artworkTitle, lighting, environment } = get();
      if (!objects.length) return null;
      const artwork: SavedArtwork = {
        id: makeStudioId(),
        title: artworkTitle.trim() || "Untitled artwork",
        createdAt: new Date().toISOString(),
        objects: objects.map(cloneStudioObject),
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
    loadArtwork: (id: string) => {
      const artwork = get().savedArtworks.find(entry => entry.id === id);
      if (!artwork) return;
      const objects = artwork.objects.map(cloneStudioObject);
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
    deleteArtwork: (id: string) =>
      set(state => ({
        savedArtworks: state.savedArtworks.filter(entry => entry.id !== id),
        makerSpotlights: state.makerSpotlights.filter(
          spotlight => spotlight.artworkId !== id
        ),
      })),
    renameArtwork: (id: string, title: string) => {
      const nextTitle = title.trim();
      if (!nextTitle) return;
      set(state => ({
        savedArtworks: state.savedArtworks.map(artwork =>
          artwork.id === id
            ? { ...artwork, title: nextTitle.slice(0, 48) }
            : artwork
        ),
      }));
    },
    toggleArtworkFavorite: (id: string) =>
      set(state => ({
        savedArtworks: state.savedArtworks.map(artwork =>
          artwork.id === id
            ? { ...artwork, isFavorite: !artwork.isFavorite }
            : artwork
        ),
      })),
    createGalleryFolder: (name: string): string | null => {
      const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 24);
      if (!cleaned) return null;
      const existing = get().galleryFolders.find(
        folder =>
          folder.name.toLocaleLowerCase() === cleaned.toLocaleLowerCase()
      );
      if (existing) return existing.id;
      const folder = {
        id: makeStudioId(),
        name: cleaned,
        createdAt: new Date().toISOString(),
      };
      set(state => ({ galleryFolders: [...state.galleryFolders, folder] }));
      return folder.id;
    },
    renameGalleryFolder: (id: string, name: string) => {
      const cleaned = name.trim().replace(/\s+/g, " ").slice(0, 24);
      if (!cleaned) return;
      set(state => ({
        galleryFolders: state.galleryFolders.map(folder =>
          folder.id === id ? { ...folder, name: cleaned } : folder
        ),
      }));
    },
    deleteGalleryFolder: (id: string) =>
      set(state => ({
        galleryFolders: state.galleryFolders.filter(folder => folder.id !== id),
        savedArtworks: state.savedArtworks.map(artwork =>
          artwork.folderId === id
            ? { ...artwork, folderId: undefined }
            : artwork
        ),
      })),
    assignArtworkFolder: (artworkId: string, folderId: string | null) =>
      set(state => ({
        savedArtworks: state.savedArtworks.map(artwork =>
          artwork.id === artworkId
            ? { ...artwork, folderId: folderId ?? undefined }
            : artwork
        ),
      })),
    setArtworkTags: (artworkId: string, tags: string[]) => {
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
    setMakerSpotlight: (
      artworkId: string,
      makerName: string,
      note?: string
    ) => {
      const cleanedName = makerName.trim().replace(/\s+/g, " ").slice(0, 32);
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
    removeMakerSpotlight: (artworkId: string) =>
      set(state => ({
        makerSpotlights: state.makerSpotlights.filter(
          spotlight => spotlight.artworkId !== artworkId
        ),
      })),
  };
}
