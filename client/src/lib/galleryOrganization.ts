import type { GalleryFolder, SavedArtwork } from "@/types/studio";

export type FolderFilter = "all" | "loose" | string;

interface GalleryFilterOptions {
  artworks: SavedArtwork[];
  folders: GalleryFolder[];
  search: string;
  folderFilter: FolderFilter;
  tagFilter: string;
  favoritesOnly: boolean;
}

export function collectGalleryTags(artworks: SavedArtwork[]) {
  return Array.from(
    new Set(artworks.flatMap(artwork => artwork.tags ?? []))
  ).sort((first, second) => first.localeCompare(second));
}

export function createFolderLookup(folders: GalleryFolder[]) {
  return new Map(folders.map(folder => [folder.id, folder]));
}

export function filterGalleryArtworks({
  artworks,
  folders,
  search,
  folderFilter,
  tagFilter,
  favoritesOnly,
}: GalleryFilterOptions) {
  const folderById = createFolderLookup(folders);
  const query = search.trim().toLocaleLowerCase();

  return artworks.filter(artwork => {
    const folderName = artwork.folderId
      ? (folderById.get(artwork.folderId)?.name ?? "")
      : "";
    const textMatches =
      !query ||
      [artwork.title, folderName, ...(artwork.tags ?? [])].some(value =>
        value.toLocaleLowerCase().includes(query)
      );
    const folderMatches =
      folderFilter === "all" ||
      (folderFilter === "loose"
        ? !artwork.folderId
        : artwork.folderId === folderFilter);
    const tagMatches = tagFilter === "all" || artwork.tags?.includes(tagFilter);

    return (
      textMatches &&
      folderMatches &&
      tagMatches &&
      (!favoritesOnly || artwork.isFavorite)
    );
  });
}
