import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import PropertiesPanel from "./PropertiesPanel";

const initialState = useStudioStore.getInitialState();

function resetStudio() {
  useStudioStore.persist.clearStorage();
  useStudioStore.setState(
    {
      ...initialState,
      objects: [],
      past: [],
      future: [],
      savedArtworks: [],
      galleryFolders: [],
      makerSpotlights: [],
      selectedObjectId: null,
      selectedObjectIds: [],
    },
    true
  );
}

describe("PropertiesPanel", () => {
  beforeEach(resetStudio);

  it("switches the transform tool and manages a selected designer object", () => {
    useStudioStore.getState().setAgeMode("designer");
    useStudioStore.getState().addObject("sphere");
    render(<PropertiesPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Stretch" }));
    expect(useStudioStore.getState().transformMode).toBe("scale");

    fireEvent.click(screen.getByRole("button", { name: "Make a copy" }));
    expect(useStudioStore.getState().objects).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Remove this shape" }));
    expect(useStudioStore.getState().objects).toHaveLength(1);
  });

  it("shows a friendly empty state before a maker selects a shape", () => {
    render(<PropertiesPanel />);

    expect(screen.getByRole("heading", { name: "Pick a shape" })).toBeVisible();
  });
});
