import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import ToolPanel from "./ToolPanel";

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

describe("ToolPanel", () => {
  beforeEach(resetStudio);

  it("adds a shape, applies a pigment, and changes its material", () => {
    useStudioStore.getState().setAgeMode("designer");
    render(<ToolPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Add a Cube" }));
    expect(useStudioStore.getState().objects).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Set selected shape colour to Cobalt",
      })
    );
    fireEvent.click(screen.getByRole("button", { name: /Metallic/ }));

    expect(useStudioStore.getState().objects[0]).toMatchObject({
      color: "#4666E9",
      material: "metallic",
    });
  });

  it("keeps the Explorer shelf deliberately simple", () => {
    useStudioStore.getState().setAgeMode("explorer");
    render(<ToolPanel />);

    expect(screen.getByRole("button", { name: "Add a Cube" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Add a Torus" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Metallic/ })
    ).not.toBeInTheDocument();
  });
});
