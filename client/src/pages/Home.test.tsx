import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import Home from "./Home";

const mocks = vi.hoisted(() => ({
  captureStudioImage: vi.fn(() => "data:image/png;base64,preview"),
  exportStudioImage: vi.fn(() => true),
  playStudioSound: vi.fn(),
  toast: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/components/studio/ChallengeCard", () => ({
  default: () => <div data-testid="challenge-card" />,
}));
vi.mock("@/components/studio/FirstRunTutorial", () => ({
  default: () => <div data-testid="first-run-tutorial" />,
}));
vi.mock("@/components/studio/PropertiesPanel", () => ({
  default: () => <div data-testid="properties-panel" />,
}));
vi.mock("@/components/studio/ToolPanel", () => ({
  default: () => <div data-testid="tool-panel" />,
}));
vi.mock("@/components/studio/StudioCanvas", () => ({
  default: () => <div data-testid="studio-canvas" />,
}));
vi.mock("@/components/studio/GalleryDrawer", () => ({
  default: () => <div role="dialog" aria-label="Saved worlds" />,
}));
vi.mock("@/components/studio/SaveCelebration", () => ({
  default: () => <div data-testid="save-celebration" />,
}));
vi.mock("@/lib/studioImage", () => ({
  captureStudioImage: mocks.captureStudioImage,
  exportStudioImage: mocks.exportStudioImage,
}));
vi.mock("@/lib/studioSound", () => ({
  playStudioSound: mocks.playStudioSound,
}));
vi.mock("sonner", () => ({
  toast: Object.assign(mocks.toast, {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  }),
}));

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
      activityHistory: [],
      selectedObjectId: null,
      selectedObjectIds: [],
      galleryOpen: false,
    },
    true
  );
  mocks.captureStudioImage.mockClear();
  mocks.exportStudioImage.mockClear();
  mocks.playStudioSound.mockClear();
  mocks.toast.mockClear();
  mocks.toastError.mockClear();
  mocks.toastSuccess.mockClear();
}

describe("Home studio workflow", () => {
  beforeEach(resetStudio);

  it("gives feedback for empty saves, then saves, exports, and reopens a local world", async () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Save world" }));
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Add a shape before saving your artwork."
    );

    fireEvent.click(screen.getByRole("button", { name: /Surprise Me/ }));
    expect(useStudioStore.getState().objects.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Save world" }));
    expect(useStudioStore.getState().savedArtworks).toHaveLength(1);
    expect(mocks.captureStudioImage).toHaveBeenCalled();
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Saved “A surprised little universe” to this device."
    );

    fireEvent.click(screen.getByRole("button", { name: /Take a PNG/ }));
    expect(mocks.exportStudioImage).toHaveBeenCalledWith(
      "A surprised little universe",
      useStudioStore.getState().objects
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Your artwork is ready as a PNG."
    );

    fireEvent.click(screen.getByRole("button", { name: /My worlds/ }));
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Saved worlds" })).toBeVisible()
    );
    expect(useStudioStore.getState().galleryOpen).toBe(true);
  });

  it("connects the visible history controls to the browser-local scene", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Surprise Me/ }));

    const undo = screen.getByRole("button", {
      name: "Undo last creative action",
    });
    const redo = screen.getByRole("button", {
      name: "Redo last creative action",
    });
    expect(undo).toBeEnabled();
    expect(redo).toBeDisabled();

    fireEvent.click(undo);
    expect(useStudioStore.getState().objects).toEqual([]);
    expect(undo).toBeDisabled();
    expect(redo).toBeEnabled();

    fireEvent.click(redo);
    expect(useStudioStore.getState().objects.length).toBeGreaterThan(0);
    expect(undo).toBeEnabled();
    expect(redo).toBeDisabled();
  });

  it("deletes a selected shape from the keyboard without hijacking text fields", () => {
    render(<Home />);
    act(() => {
      useStudioStore.getState().addObject("cube");
      const objectId = useStudioStore.getState().objects[0]?.id;
      useStudioStore.getState().selectObject(objectId ?? null);
    });

    fireEvent.keyDown(window, { key: "Delete" });
    expect(useStudioStore.getState().objects).toHaveLength(0);
    expect(mocks.toast).toHaveBeenCalledWith("Shape removed from your stage.");

    act(() => {
      useStudioStore.getState().addObject("sphere");
      useStudioStore
        .getState()
        .selectObject(useStudioStore.getState().objects[0]?.id ?? null);
    });
    const titleField = screen.getByLabelText("Give your world a name");
    fireEvent.keyDown(titleField, { key: "Delete" });
    expect(useStudioStore.getState().objects).toHaveLength(1);
  });
});
