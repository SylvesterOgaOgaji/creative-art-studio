import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStudioStore } from "@/store/useStudioStore";
import StudioCanvas from "./StudioCanvas";
import { SceneMesh } from "./StudioSceneObjects";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
}));

vi.mock("@react-three/drei", () => ({
  ContactShadows: () => null,
  Edges: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  OrbitControls: () => null,
  Stars: () => null,
  TransformControls: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("three", () => ({
  CanvasTexture: class CanvasTexture {
    colorSpace = "";
    dispose() {}
  },
  Euler: class Euler {},
  Quaternion: class Quaternion {},
  SRGBColorSpace: "srgb",
  Vector3: class Vector3 {},
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
      selectedObjectId: null,
      selectedObjectIds: [],
      multiSelectMode: false,
    },
    true
  );
}

describe("StudioCanvas", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetStudio();
    // React Three Fiber primitives are interpreted by WebGL rather than JSDOM.
    // The mocked canvas renders children as DOM nodes solely to exercise selection.
    consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  it("selects multiple scene shapes through the canvas click interaction", () => {
    useStudioStore.getState().addObject("cube");
    const firstId = useStudioStore.getState().selectedObjectId!;
    useStudioStore.getState().addObject("sphere");
    const secondId = useStudioStore.getState().selectedObjectId!;
    useStudioStore.getState().selectObject(null);

    const { container } = render(<StudioCanvas />);
    const meshes = container.querySelectorAll("mesh");

    fireEvent.click(meshes[1]);
    fireEvent.click(meshes[2], { shiftKey: true });

    expect(useStudioStore.getState().selectedObjectIds).toEqual([
      firstId,
      secondId,
    ]);
  });

  it("renders a selected scene object and keeps its click selection contract", () => {
    useStudioStore.getState().addObject("cube");
    const object = useStudioStore.getState().objects[0];
    const { container, getByText } = render(
      <SceneMesh object={object} selected showTag />
    );

    expect(getByText("Chosen")).toBeTruthy();
    fireEvent.click(container.querySelector("mesh")!);
    expect(useStudioStore.getState().selectedObjectId).toBe(object.id);
  });

  it("shows the paper-cut invitation on an empty stage", () => {
    const { container } = render(<StudioCanvas />);

    expect(container.querySelector(".paper-cut-stage-arch")).toBeTruthy();
  });
});
