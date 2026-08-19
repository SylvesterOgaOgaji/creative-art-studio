import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SavedArtwork } from "@/types/studio";
import GalleryFolderControls from "./GalleryFolderControls";
import GalleryTagControls from "./GalleryTagControls";

const artwork: SavedArtwork = {
  id: "art-1",
  title: "Bright robot",
  createdAt: "2026-08-19T00:00:00.000Z",
  objects: [],
  lighting: "daylight",
  environment: "atelier",
  isFavorite: false,
  tags: ["joyful"],
};

const folders = [
  {
    id: "folder-1",
    name: "Finished worlds",
    createdAt: "2026-08-19T00:00:00.000Z",
  },
];

describe("gallery organization controls", () => {
  it("creates a folder and applies folder and tag filters", () => {
    const onCreateFolder = vi.fn(() => "folder-2");
    const onFolderFilterChange = vi.fn();
    const onTagFilterChange = vi.fn();
    render(
      <GalleryFolderControls
        artworks={[artwork]}
        galleryFolders={folders}
        folderFilter="all"
        tagFilter="all"
        onCreateFolder={onCreateFolder}
        onFolderFilterChange={onFolderFilterChange}
        onTagFilterChange={onTagFilterChange}
        onRenameFolder={vi.fn()}
        onDeleteFolderRequest={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("New project folder"), {
      target: { value: "Ideas" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add folder/i }));
    fireEvent.click(screen.getByRole("button", { name: /#joyful/i }));

    expect(onCreateFolder).toHaveBeenCalledWith("Ideas");
    expect(onFolderFilterChange).toHaveBeenCalledWith("folder-2");
    expect(onTagFilterChange).toHaveBeenCalledWith("joyful");
  });

  it("assigns a folder, removes an existing tag, and adds a draft tag", () => {
    const onAssignFolder = vi.fn();
    const onSetTags = vi.fn();
    render(
      <GalleryTagControls
        artwork={artwork}
        galleryFolders={folders}
        onAssignFolder={onAssignFolder}
        onSetTags={onSetTags}
      />
    );

    fireEvent.change(screen.getByDisplayValue("Loose world"), {
      target: { value: "folder-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /remove tag joyful/i }));
    fireEvent.change(screen.getByLabelText(/add a tag to bright robot/i), {
      target: { value: "colourful" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add tag to bright robot/i })
    );

    expect(onAssignFolder).toHaveBeenCalledWith("art-1", "folder-1");
    expect(onSetTags).toHaveBeenNthCalledWith(1, "art-1", []);
    expect(onSetTags).toHaveBeenNthCalledWith(2, "art-1", [
      "joyful",
      "colourful",
    ]);
  });
});
