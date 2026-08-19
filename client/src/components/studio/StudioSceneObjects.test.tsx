import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioObject } from "@/types/studio";
import {
  GroupTransformObject,
  SceneMesh,
  SingleTransformObject,
} from "./StudioSceneObjects";

const mocks = vi.hoisted(() => ({
  selectObject: vi.fn(),
  beginDirectTransform: vi.fn(),
  finishDirectTransform: vi.fn(),
  updateObjectDuringTransform: vi.fn(),
  updateObjectsDuringTransform: vi.fn(),
}));

vi.mock("@react-three/drei/core/Edges", () => ({
  Edges: ({ children }: { children?: ReactNode }) => (
    <div data-testid="edges">{children}</div>
  ),
}));

vi.mock("@react-three/drei/web/Html", () => ({
  Html: ({ children }: { children?: ReactNode }) => (
    <div data-testid="html">{children}</div>
  ),
}));

vi.mock("@react-three/drei/core/TransformControls", () => ({
  TransformControls: ({
    children,
    onMouseDown,
    onMouseUp,
    onObjectChange,
  }: {
    children?: ReactNode;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onObjectChange?: () => void;
  }) => (
    <button
      type="button"
      data-testid="transform-controls"
      aria-label="Transform controls"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onChange={onObjectChange}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/store/useStudioStore", () => ({
  useStudioStore: (selector: (state: unknown) => unknown) =>
    selector({
      selectObject: mocks.selectObject,
      multiSelectMode: false,
      transformMode: "translate",
      beginDirectTransform: mocks.beginDirectTransform,
      finishDirectTransform: mocks.finishDirectTransform,
      updateObjectDuringTransform: mocks.updateObjectDuringTransform,
      updateObjectsDuringTransform: mocks.updateObjectsDuringTransform,
    }),
}));

function makeObject(
  type: StudioObject["type"],
  id = type,
  position: [number, number, number] = [0, 0, 0]
): StudioObject {
  return {
    id,
    name: id,
    type,
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#FF6B4A",
    material: "matte",
    texture: "plain",
    sticker: "none",
  };
}

describe("StudioSceneObjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["cube", "sphere", "cone", "cylinder", "torus"] as const)(
    "renders the %s geometry and selection affordances",
    type => {
      const { container, getByTestId } = render(
        <SceneMesh object={makeObject(type)} selected showTag />
      );

      expect(
        container.querySelector(
          type === "cube" ? "boxGeometry" : `${type}Geometry`
        )
      ).toBeTruthy();
      expect(getByTestId("edges")).toBeTruthy();
      expect(getByTestId("html")).toHaveTextContent("Chosen");

      const mesh = container.querySelector("mesh");
      expect(mesh).toBeTruthy();
      fireEvent.click(mesh!);
      expect(mocks.selectObject).toHaveBeenCalledWith(type, false);
    }
  );

  it("passes shift selection through to the store", () => {
    const { container } = render(
      <SceneMesh object={makeObject("cube", "one")} selected={false} />
    );

    fireEvent.click(container.querySelector("mesh")!, { shiftKey: true });
    expect(mocks.selectObject).toHaveBeenCalledWith("one", true);
  });

  it("starts and finishes a single-object transform", () => {
    const onDraggingChange = vi.fn();
    const { getByTestId } = render(
      <SingleTransformObject
        object={makeObject("cube")}
        onDraggingChange={onDraggingChange}
      />
    );

    fireEvent.mouseDown(getByTestId("transform-controls"));
    expect(mocks.beginDirectTransform).toHaveBeenCalledOnce();
    expect(onDraggingChange).toHaveBeenLastCalledWith(true);

    fireEvent.mouseUp(getByTestId("transform-controls"));
    expect(mocks.finishDirectTransform).toHaveBeenCalledOnce();
    expect(onDraggingChange).toHaveBeenLastCalledWith(false);
  });

  it("commits the group transform lifecycle", () => {
    const onDraggingChange = vi.fn();
    const { getByTestId, container } = render(
      <GroupTransformObject
        objects={[
          makeObject("cube", "one", [-1, 0, 0]),
          makeObject("sphere", "two", [1, 0, 0]),
        ]}
        selectedObjectId="one"
        onDraggingChange={onDraggingChange}
      />
    );

    expect(container.querySelectorAll("mesh")).toHaveLength(2);
    fireEvent.mouseDown(getByTestId("transform-controls"));
    fireEvent.mouseUp(getByTestId("transform-controls"));

    expect(mocks.beginDirectTransform).toHaveBeenCalledOnce();
    expect(mocks.updateObjectsDuringTransform).toHaveBeenCalledWith([]);
    expect(mocks.finishDirectTransform).toHaveBeenCalledOnce();
    expect(onDraggingChange).toHaveBeenLastCalledWith(false);
  });
});
