import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import GalleryDrawer from "./GalleryDrawer";

const initialState = useStudioStore.getInitialState();

function resetStudio() {
  useStudioStore.persist.clearStorage();
  useStudioStore.setState(
    {
      ...initialState,
      objects: [],
      savedArtworks: [],
      galleryFolders: [],
      makerSpotlights: [],
      galleryOpen: true,
    },
    true
  );
}

describe("GalleryDrawer", () => {
  beforeEach(resetStudio);

  it("finds, favorites, and renames a saved browser-local world", () => {
    const store = useStudioStore.getState();
    store.addObject("cube");
    store.setArtworkTitle("Sunny studio");
    const artwork = store.saveArtwork();
    expect(artwork).not.toBeNull();
    store.setGalleryOpen(true);

    render(<GalleryDrawer />);

    expect(screen.getByRole("heading", { name: "Sunny studio" })).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Sunny studio to best worlds",
      })
    );
    expect(useStudioStore.getState().savedArtworks[0]?.isFavorite).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "Rename Sunny studio" })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Artwork name" }), {
      target: { value: "Bright studio" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save new artwork name" })
    );
    expect(
      screen.getByRole("heading", { name: "Bright studio" })
    ).toBeVisible();

    fireEvent.change(
      screen.getByPlaceholderText("Find by name, folder, or tag"),
      { target: { value: "moon" } }
    );
    expect(
      screen.getByRole("heading", { name: "No matching worlds" })
    ).toBeVisible();
  });
});
