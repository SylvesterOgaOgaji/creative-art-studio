/**
 * Playful Atelier design reminder: transforms should feel like intuitive studio tools,
 * with a warm stage that keeps controls secondary to the object being shaped.
 */
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls, TransformControls } from "@react-three/drei";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { Euler, Quaternion, Vector3, type Mesh } from "three";
import type { StudioMaterial, StudioObject, Vector3Tuple } from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";

const workspaceArtwork = "/manus-storage/playful-atelier-workspace_6be4be8c.jpg";
const toTuple = (values: { x: number; y: number; z: number }): Vector3Tuple => [values.x, values.y, values.z];

function geometryFor(type: StudioObject["type"]): ReactNode {
  if (type === "sphere") return <sphereGeometry args={[.78, 48, 32]} />;
  if (type === "cone") return <coneGeometry args={[.76, 1.55, 48]} />;
  if (type === "cylinder") return <cylinderGeometry args={[.7, .7, 1.45, 48]} />;
  if (type === "torus") return <torusGeometry args={[.72, .25, 20, 64]} />;
  return <boxGeometry args={[1.25, 1.25, 1.25]} />;
}

function materialFor(material: StudioMaterial, color: string) {
  const finishes: Record<StudioMaterial, { roughness: number; metalness: number; emissive: string; emissiveIntensity: number }> = {
    matte: { roughness: .82, metalness: .02, emissive: "#000000", emissiveIntensity: 0 }, glossy: { roughness: .16, metalness: .08, emissive: "#000000", emissiveIntensity: 0 }, metallic: { roughness: .28, metalness: .88, emissive: "#000000", emissiveIntensity: 0 }, neon: { roughness: .22, metalness: .08, emissive: color, emissiveIntensity: .72 },
  };
  return <meshStandardMaterial color={color} {...finishes[material]} />;
}

function SceneMesh({ object, selected, showTag, position, meshRef }: { object: StudioObject; selected: boolean; showTag?: boolean; position?: Vector3Tuple; meshRef?: (mesh: Mesh | null) => void }) {
  const selectObject = useStudioStore((state) => state.selectObject);
  const multiSelectMode = useStudioStore((state) => state.multiSelectMode);
  const handleSelect = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); selectObject(object.id, event.shiftKey || multiSelectMode); };
  return <mesh ref={meshRef} castShadow receiveShadow position={position ?? object.position} rotation={object.rotation} scale={object.scale} onClick={handleSelect} onPointerDown={(event) => event.stopPropagation()}>{geometryFor(object.type)}{materialFor(object.material, object.color)}{selected && <Edges color="#FF6B4A" threshold={15} />}{showTag && <Html position={[0, 1.35, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}><span className="selected-tag">Chosen</span></Html>}</mesh>;
}

function SingleTransformObject({ object, onDraggingChange }: { object: StudioObject; onDraggingChange: (dragging: boolean) => void }) {
  const meshRef = useRef<Mesh | null>(null);
  const transformMode = useStudioStore((state) => state.transformMode);
  const beginDirectTransform = useStudioStore((state) => state.beginDirectTransform);
  const finishDirectTransform = useStudioStore((state) => state.finishDirectTransform);
  const updateObjectDuringTransform = useStudioStore((state) => state.updateObjectDuringTransform);
  return <TransformControls mode={transformMode} size={.82} onMouseDown={() => { beginDirectTransform(); onDraggingChange(true); }} onMouseUp={() => { finishDirectTransform(); onDraggingChange(false); }} onObjectChange={() => { const mesh = meshRef.current; if (mesh) updateObjectDuringTransform(object.id, { position: toTuple(mesh.position), rotation: toTuple(mesh.rotation), scale: toTuple(mesh.scale) }); }}><SceneMesh object={object} selected showTag meshRef={(mesh) => { meshRef.current = mesh; }} /></TransformControls>;
}

function GroupTransformObject({ objects, selectedObjectId, onDraggingChange }: { objects: StudioObject[]; selectedObjectId: string | null; onDraggingChange: (dragging: boolean) => void }) {
  const meshRefs = useRef(new Map<string, Mesh>());
  const transformMode = useStudioStore((state) => state.transformMode);
  const beginDirectTransform = useStudioStore((state) => state.beginDirectTransform);
  const finishDirectTransform = useStudioStore((state) => state.finishDirectTransform);
  const updateObjectsDuringTransform = useStudioStore((state) => state.updateObjectsDuringTransform);
  const center = useMemo<Vector3Tuple>(() => objects.reduce((sum, object) => [sum[0] + object.position[0] / objects.length, sum[1] + object.position[1] / objects.length, sum[2] + object.position[2] / objects.length] as Vector3Tuple, [0, 0, 0]), [objects]);
  const commitGroupTransform = () => {
    const worldPosition = new Vector3(); const worldQuaternion = new Quaternion(); const worldScale = new Vector3();
    updateObjectsDuringTransform(objects.flatMap((object) => { const mesh = meshRefs.current.get(object.id); if (!mesh) return []; mesh.getWorldPosition(worldPosition); mesh.getWorldQuaternion(worldQuaternion); mesh.getWorldScale(worldScale); const rotation = new Euler().setFromQuaternion(worldQuaternion, "XYZ"); return [{ id: object.id, updates: { position: toTuple(worldPosition), rotation: toTuple(rotation), scale: toTuple(worldScale) } }]; }));
    finishDirectTransform(); onDraggingChange(false);
  };
  return <TransformControls mode={transformMode} size={.92} onMouseDown={() => { beginDirectTransform(); onDraggingChange(true); }} onMouseUp={commitGroupTransform}><group position={center} rotation={[0, 0, 0]} scale={[1, 1, 1]}>{objects.map((object) => <SceneMesh key={object.id} object={object} selected showTag={object.id === selectedObjectId} position={[object.position[0] - center[0], object.position[1] - center[1], object.position[2] - center[2]]} meshRef={(mesh) => { if (mesh) meshRefs.current.set(object.id, mesh); else meshRefs.current.delete(object.id); }} />)}</group></TransformControls>;
}

function EmptySceneHint() { return <Html center position={[0, 1.2, 0]} style={{ pointerEvents: "none" }}><div className="scene-empty-hint"><span className="scene-empty-star">✦</span><strong>Start with one bright shape</strong><span>Pick a form, then make it completely yours.</span></div></Html>; }

function StudioScene() {
  const [isDragging, setIsDragging] = useState(false);
  const objects = useStudioStore((state) => state.objects);
  const lighting = useStudioStore((state) => state.lighting ?? "daylight");
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const selectedObjectIds = useStudioStore((state) => state.selectedObjectIds);
  const selectObject = useStudioStore((state) => state.selectObject);
  const activeIds = selectedObjectIds.length ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
  const activeSet = new Set(activeIds);
  const groupedObjects = objects.filter((object) => activeSet.has(object.id));
  const useGroupGizmo = groupedObjects.length > 1;
  return <>{lighting === "neon" ? <><ambientLight intensity={.46} color="#7C70FF" /><directionalLight castShadow intensity={.72} color="#A7D7FF" position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} /><pointLight color="#FF4FA3" intensity={34} distance={14} position={[-4, 4, 1]} /><pointLight color="#4EE7FF" intensity={28} distance={12} position={[4, 2.5, -4]} /><pointLight color="#B5FF68" intensity={18} distance={10} position={[0, 4, 2]} /></> : <><ambientLight intensity={1.35} /><directionalLight castShadow intensity={2.1} position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} /><pointLight color="#FFD66B" intensity={19} distance={14} position={[-4, 4, 1]} /><pointLight color="#8CCBF2" intensity={14} distance={12} position={[4, 2.5, -4]} /></>}<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 0]} receiveShadow onClick={() => selectObject(null)}><circleGeometry args={[5.6, 96]} /><meshStandardMaterial color={lighting === "neon" ? "#111B3B" : "#FFF7E9"} transparent opacity={lighting === "neon" ? .92 : .84} roughness={.96} /></mesh>{objects.filter((object) => !useGroupGizmo || !activeSet.has(object.id)).map((object) => activeIds.length === 1 && object.id === selectedObjectId ? <SingleTransformObject key={object.id} object={object} onDraggingChange={setIsDragging} /> : <SceneMesh key={object.id} object={object} selected={activeSet.has(object.id)} showTag={object.id === selectedObjectId} />)}{useGroupGizmo && <GroupTransformObject objects={groupedObjects} selectedObjectId={selectedObjectId} onDraggingChange={setIsDragging} />}{!objects.length && <EmptySceneHint />}<ContactShadows position={[0, -.01, 0]} opacity={lighting === "neon" ? .44 : .24} scale={11} blur={2.8} far={6} /><OrbitControls makeDefault enabled={!isDragging} enablePan={false} minDistance={5.5} maxDistance={14} maxPolarAngle={Math.PI / 2.05} /></>;
}

export default function StudioCanvas() { return <div className="studio-canvas" style={{ backgroundImage: `linear-gradient(180deg, ${"rgba(255,255,255,.16)"}, rgba(255,249,238,.48)), url(${workspaceArtwork})` }}><Canvas id="creative-art-canvas" shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} camera={{ position: [7.4, 5.7, 8.4], fov: 42 }}><StudioScene /></Canvas><div className="canvas-corner-note" aria-hidden="true"><span className="canvas-note-dot" /> drag to look around</div></div>; }
