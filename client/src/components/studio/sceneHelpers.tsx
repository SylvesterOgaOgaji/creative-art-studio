/**
 * Playful Atelier scene helpers: reusable mesh, transform, and environment pieces
 * keep the canvas component focused on the child-friendly maker stage.
 */
import { type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  CanvasTexture,
  Euler,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type Mesh,
} from "three";
import { useStudioStore } from "@/store/useStudioStore";
import type {
  StudioEnvironment,
  StudioMaterial,
  StudioObject,
  StudioSticker,
  StudioTexture,
  Vector3Tuple,
} from "@/types/studio";

const workspaceArtwork =
  "/manus-storage/playful-atelier-workspace_6be4be8c.jpg";

export type DraggingChangeHandler = (dragging: boolean) => void;

export const toVectorTuple = (values: {
  x: number;
  y: number;
  z: number;
}): Vector3Tuple => [values.x, values.y, values.z];

export function geometryFor(type: StudioObject["type"]): ReactNode {
  if (type === "sphere") return <sphereGeometry args={[0.78, 48, 32]} />;
  if (type === "cone") return <coneGeometry args={[0.76, 1.55, 48]} />;
  if (type === "cylinder") {
    return <cylinderGeometry args={[0.7, 0.7, 1.45, 48]} />;
  }
  if (type === "torus") return <torusGeometry args={[0.72, 0.25, 20, 64]} />;
  return <boxGeometry args={[1.25, 1.25, 1.25]} />;
}

export function makeSurfaceTexture(texture: StudioTexture, color: string) {
  if (texture === "plain") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = color;
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = "rgba(255,255,246,.68)";
  if (texture === "dots") {
    for (let x = 18; x < 128; x += 38) {
      for (let y = 18; y < 128; y += 38) {
        context.beginPath();
        context.arc(x, y, 8, 0, Math.PI * 2);
        context.fill();
      }
    }
  } else if (texture === "stripes") {
    context.lineWidth = 14;
    for (let x = -90; x < 170; x += 35) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + 120, 128);
      context.stroke();
    }
  } else if (texture === "checkerboard") {
    context.fillStyle = "rgba(255,255,246,.66)";
    for (let x = 0; x < 128; x += 24) {
      for (let y = 0; y < 128; y += 24) {
        if ((x / 24 + y / 24) % 2 === 0) context.fillRect(x, y, 24, 24);
      }
    }
  } else {
    context.fillStyle = "rgba(255,255,246,.8)";
    for (let index = 0; index < 44; index += 1) {
      const x = (index * 29) % 128;
      const y = (index * 47 + 13) % 128;
      context.beginPath();
      context.arc(x, y, index % 3 === 0 ? 2.8 : 1.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}

function useSurfaceTexture(texture: StudioTexture, color: string) {
  const map = useMemo(
    () => makeSurfaceTexture(texture, color),
    [texture, color]
  );
  useEffect(() => () => map?.dispose(), [map]);
  return map;
}

function materialFor(
  material: StudioMaterial,
  color: string,
  map: CanvasTexture | null
) {
  const finishes: Record<
    StudioMaterial,
    {
      roughness: number;
      metalness: number;
      emissive: string;
      emissiveIntensity: number;
    }
  > = {
    matte: {
      roughness: 0.82,
      metalness: 0.02,
      emissive: "#000000",
      emissiveIntensity: 0,
    },
    glossy: {
      roughness: 0.16,
      metalness: 0.08,
      emissive: "#000000",
      emissiveIntensity: 0,
    },
    metallic: {
      roughness: 0.28,
      metalness: 0.88,
      emissive: "#000000",
      emissiveIntensity: 0,
    },
    neon: {
      roughness: 0.22,
      metalness: 0.08,
      emissive: color,
      emissiveIntensity: 0.72,
    },
  };
  return (
    <meshStandardMaterial
      color={map ? "#ffffff" : color}
      map={map ?? undefined}
      {...finishes[material]}
    />
  );
}

const stickerMarks: Record<StudioSticker, string> = {
  none: "",
  star: "✦",
  heart: "♥",
  smile: "●",
};

export function SceneMesh({
  object,
  selected,
  showTag,
  position,
  meshRef,
}: {
  object: StudioObject;
  selected: boolean;
  showTag?: boolean;
  position?: Vector3Tuple;
  meshRef?: (mesh: Mesh | null) => void;
}) {
  const selectObject = useStudioStore(state => state.selectObject);
  const multiSelectMode = useStudioStore(state => state.multiSelectMode);
  const texture = object.texture ?? "plain";
  const sticker = object.sticker ?? "none";
  const map = useSurfaceTexture(texture, object.color);
  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectObject(object.id, event.shiftKey || multiSelectMode);
  };

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      position={position ?? object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleSelect}
      onPointerDown={event => event.stopPropagation()}
    >
      {geometryFor(object.type)}
      {materialFor(object.material, object.color, map)}
      {sticker !== "none" && (
        <Html
          transform
          position={[0, 0.08, 0.88]}
          distanceFactor={11}
          style={{ pointerEvents: "none" }}
        >
          <span className={`shape-sticker sticker-${sticker}`}>
            {stickerMarks[sticker]}
          </span>
        </Html>
      )}
      {selected && <Edges color="#FF6B4A" threshold={15} />}
      {showTag && (
        <Html
          position={[0, 1.35, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none" }}
        >
          <span className="selected-tag">Chosen</span>
        </Html>
      )}
    </mesh>
  );
}

export function SingleTransformObject({
  object,
  onDraggingChange,
}: {
  object: StudioObject;
  onDraggingChange: DraggingChangeHandler;
}) {
  const meshRef = useRef<Mesh | null>(null);
  const transformMode = useStudioStore(state => state.transformMode);
  const beginDirectTransform = useStudioStore(
    state => state.beginDirectTransform
  );
  const finishDirectTransform = useStudioStore(
    state => state.finishDirectTransform
  );
  const updateObjectDuringTransform = useStudioStore(
    state => state.updateObjectDuringTransform
  );

  return (
    <TransformControls
      mode={transformMode}
      size={0.82}
      onMouseDown={() => {
        beginDirectTransform();
        onDraggingChange(true);
      }}
      onMouseUp={() => {
        finishDirectTransform();
        onDraggingChange(false);
      }}
      onObjectChange={() => {
        const mesh = meshRef.current;
        if (!mesh) return;
        updateObjectDuringTransform(object.id, {
          position: toVectorTuple(mesh.position),
          rotation: toVectorTuple(mesh.rotation),
          scale: toVectorTuple(mesh.scale),
        });
      }}
    >
      <SceneMesh
        object={object}
        selected
        showTag
        meshRef={mesh => {
          meshRef.current = mesh;
        }}
      />
    </TransformControls>
  );
}

export function GroupTransformObject({
  objects,
  selectedObjectId,
  onDraggingChange,
}: {
  objects: StudioObject[];
  selectedObjectId: string | null;
  onDraggingChange: DraggingChangeHandler;
}) {
  const meshRefs = useRef(new Map<string, Mesh>());
  const transformMode = useStudioStore(state => state.transformMode);
  const beginDirectTransform = useStudioStore(
    state => state.beginDirectTransform
  );
  const finishDirectTransform = useStudioStore(
    state => state.finishDirectTransform
  );
  const updateObjectsDuringTransform = useStudioStore(
    state => state.updateObjectsDuringTransform
  );
  const center = useMemo<Vector3Tuple>(
    () =>
      objects.reduce(
        (sum, object) =>
          [
            sum[0] + object.position[0] / objects.length,
            sum[1] + object.position[1] / objects.length,
            sum[2] + object.position[2] / objects.length,
          ] as Vector3Tuple,
        [0, 0, 0]
      ),
    [objects]
  );
  const commitGroupTransform = () => {
    const worldPosition = new Vector3();
    const worldQuaternion = new Quaternion();
    const worldScale = new Vector3();
    updateObjectsDuringTransform(
      objects.flatMap(object => {
        const mesh = meshRefs.current.get(object.id);
        if (!mesh) return [];
        mesh.getWorldPosition(worldPosition);
        mesh.getWorldQuaternion(worldQuaternion);
        mesh.getWorldScale(worldScale);
        const rotation = new Euler().setFromQuaternion(worldQuaternion, "XYZ");
        return [
          {
            id: object.id,
            updates: {
              position: toVectorTuple(worldPosition),
              rotation: toVectorTuple(rotation),
              scale: toVectorTuple(worldScale),
            },
          },
        ];
      })
    );
    finishDirectTransform();
    onDraggingChange(false);
  };

  return (
    <TransformControls
      mode={transformMode}
      size={0.92}
      onMouseDown={() => {
        beginDirectTransform();
        onDraggingChange(true);
      }}
      onMouseUp={commitGroupTransform}
    >
      <group position={center} rotation={[0, 0, 0]} scale={[1, 1, 1]}>
        {objects.map(object => (
          <SceneMesh
            key={object.id}
            object={object}
            selected
            showTag={object.id === selectedObjectId}
            position={[
              object.position[0] - center[0],
              object.position[1] - center[1],
              object.position[2] - center[2],
            ]}
            meshRef={mesh => {
              if (mesh) meshRefs.current.set(object.id, mesh);
              else meshRefs.current.delete(object.id);
            }}
          />
        ))}
      </group>
    </TransformControls>
  );
}

export function getStageFloorColor(
  environment: StudioEnvironment,
  lighting: "daylight" | "neon"
) {
  if (environment === "space") return "#101a47";
  if (environment === "underwater") return "#c9f3ee";
  return lighting === "neon" ? "#111B3B" : "#FFF7E9";
}

export function getStageBackground(environment: StudioEnvironment) {
  if (environment === "space") {
    return "radial-gradient(circle at 20% 18%, #4f54aa 0 2%, transparent 2.5%), radial-gradient(circle at 78% 24%, #ffffff 0 1%, transparent 1.5%), linear-gradient(145deg, #17174d, #2d2368 54%, #101a47)";
  }
  if (environment === "underwater") {
    return "radial-gradient(circle at 23% 12%, rgba(255,255,255,.55) 0 4%, transparent 4.5%), radial-gradient(circle at 68% 24%, rgba(255,255,255,.4) 0 3%, transparent 3.5%), linear-gradient(160deg, #80d9e9, #c4f4e7 72%)";
  }
  return `linear-gradient(180deg, ${"rgba(255,255,255,.16)"}, rgba(255,249,238,.48)), url(${workspaceArtwork})`;
}
