import { describe, expect, it } from "vitest";
import {
  collectGalleryTags,
  filterGalleryArtworks,
} from "./galleryOrganization";

const artworks = [
  {
    id: "sun-1",
    title: "Sun Garden",
    createdAt: "2026-08-18T00:00:00.000Z",
    objects: [],
    folderId: "garden",
    tags: ["bright", "garden"],
    isFavorite: true,
  },
  {
    id: "moon-1",
    title: "Moon Lab",
    createdAt: "2026-08-18T00:00:00.000Z",
    objects: [],
    tags: ["space"],
  },
];

describe("galleryOrganization", () => {
  it("collects a stable, unique tag list for gallery filters", () => {
    expect(collectGalleryTags(artworks)).toEqual(["bright", "garden", "space"]);
  });

  it("combines title, folder, tag, and favourite filters predictably", () => {
    expect(
      filterGalleryArtworks({
        artworks,
        folders: [
          {
            id: "garden",
            name: "Tiny garden worlds",
            createdAt: "2026-08-18T00:00:00.000Z",
          },
        ],
        search: "garden",
        folderFilter: "garden",
        tagFilter: "bright",
        favoritesOnly: true,
      }).map(artwork => artwork.id)
    ).toEqual(["sun-1"]);
  });
});
