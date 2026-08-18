/**
 * Playful Atelier design reminder: transforms should feel like intuitive studio tools,
 * with a warm stage that keeps controls secondary to the object being shaped.
 */
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls, Stars, TransformControls } from "@react-three/drei";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, Euler, Quaternion, SRGBColorSpace, Vector3, type Mesh } from "three";
import type { StudioMaterial, StudioObject, StudioSticker, StudioTexture, Vector3Tuple } from "@/types/studio";
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

function makeSurfaceTexture(texture: StudioTexture, color: string) {
  if (texture === "plain") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = color;
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = "rgba(255,255,246,.68)";
  if (texture === "dots") {
    for (let x = 18; x < 128; x += 38) for (let y = 18; y < 128; y += 38) { context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2); context.fill(); }
  } else if (texture === "stripes") {
    context.lineWidth = 14;
    for (let x = -90; x < 170; x += 35) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x + 120, 128); context.stroke(); }
  } else if (texture === "checkerboard") {
    context.fillStyle = "rgba(255,255,246,.66)";
    for (let x = 0; x < 128; x += 24) for (let y = 0; y < 128; y += 24) if ((x / 24 + y / 24) % 2 === 0) context.fillRect(x, y, 24, 24);
  } else {
    context.fillStyle = "rgba(255,255,246,.8)";
    for (let index = 0; index < 44; index += 1) { const x = (index * 29) % 128; const y = (index * 47 + 13) % 128; context.beginPath(); context.arc(x, y, index % 3 === 0 ? 2.8 : 1.5, 0, Math.PI * 2); context.fill(); }
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}

function useSurfaceTexture(texture: StudioTexture, color: string) {
  const map = useMemo(() => makeSurfaceTexture(texture, color), [texture, color]);
  useEffect(() => () => map?.dispose(), [map]);
  return map;
}

function materialFor(material: StudioMaterial, color: string, map: CanvasTexture | null) {
  const finishes: Record<StudioMaterial, { roughness: number; metalness: number; emissive: string; emissiveIntensity: number }> = {
    matte: { roughness: .82, metalness: .02, emissive: "#000000", emissiveIntensity: 0 }, glossy: { roughness: .16, metalness: .08, emissive: "#000000", emissiveIntensity: 0 }, metallic: { roughness: .28, metalness: .88, emissive: "#000000", emissiveIntensity: 0 }, neon: { roughness: .22, metalness: .08, emissive: color, emissiveIntensity: .72 },
  };
  return <meshStandardMaterial color={map ? "#ffffff" : color} map={map ?? undefined} {...finishes[material]} />;
}

const stickerMarks: Record<StudioSticker, string> = { none: "", star: "✦", heart: "♥", smile: "●" };

function SceneMesh({ object, selected, showTag, position, meshRef }: { object: StudioObject; selected: boolean; showTag?: boolean; position?: Vector3Tuple; meshRef?: (mesh: Mesh | null) => void }) {
  const selectObject = useStudioStore((state) => state.selectObject);
  const multiSelectMode = useStudioStore((state) => state.multiSelectMode);
  const handleSelect = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); selectObject(object.id, event.shiftKey || multiSelectMode); };
  const texture = object.texture ?? "plain";
  const sticker = object.sticker ?? "none";
  const map = useSurfaceTexture(texture, object.color);
  return <mesh ref={meshRef} castShadow receiveShadow position={position ?? object.position} rotation={object.rotation} scale={object.scale} onClick={handleSelect} onPointerDown={(event) => event.stopPropagation()}>{geometryFor(object.type)}{materialFor(object.material, object.color, map)}{sticker !== "none" && <Html transform position={[0, .08, .88]} distanceFactor={11} style={{ pointerEvents: "none" }}><span className={`shape-sticker sticker-${sticker}`}>{stickerMarks[sticker]}</span></Html>}{selected && <Edges color="#FF6B4A" threshold={15} />}{showTag && <Html position={[0, 1.35, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}><span className="selected-tag">Chosen</span></Html>}</mesh>;
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

function StudioScene() {
  const [isDragging, setIsDragging] = useState(false);
  const objects = useStudioStore((state) => state.objects);
  const lighting = useStudioStore((state) => state.lighting ?? "daylight");
  const environment = useStudioStore((state) => state.environment ?? "atelier");
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const selectedObjectIds = useStudioStore((state) => state.selectedObjectIds);
  const selectObject = useStudioStore((state) => state.selectObject);
  const activeIds = selectedObjectIds.length ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
  const activeSet = new Set(activeIds);
  const groupedObjects = objects.filter((object) => activeSet.has(object.id));
  const useGroupGizmo = groupedObjects.length > 1;
  const floorColor = environment === "space" ? "#101a47" : environment === "underwater" ? "#c9f3ee" : lighting === "neon" ? "#111B3B" : "#FFF7E9";
  return <>{environment === "space" && <Stars radius={70} depth={42} count={1500} factor={3} saturation={.25} fade speed={.22} />}{environment === "underwater" && <fog attach="fog" args={["#81d5e5", 7, 19]} />}{lighting === "neon" ? <><ambientLight intensity={.46} color="#7C70FF" /><directionalLight castShadow intensity={.72} color="#A7D7FF" position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} /><pointLight color="#FF4FA3" intensity={34} distance={14} position={[-4, 4, 1]} /><pointLight color="#4EE7FF" intensity={28} distance={12} position={[4, 2.5, -4]} /><pointLight color="#B5FF68" intensity={18} distance={10} position={[0, 4, 2]} /></> : <><ambientLight intensity={environment === "underwater" ? 1.55 : 1.35} color={environment === "underwater" ? "#d9ffff" : "#ffffff"} /><directionalLight castShadow intensity={2.1} position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} /><pointLight color={environment === "underwater" ? "#52cfe8" : "#FFD66B"} intensity={19} distance={14} position={[-4, 4, 1]} /><pointLight color="#8CCBF2" intensity={14} distance={12} position={[4, 2.5, -4]} /></>}<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 0]} receiveShadow onClick={() => selectObject(null)}><circleGeometry args={[5.6, 96]} /><meshStandardMaterial color={floorColor} transparent opacity={environment === "space" || lighting === "neon" ? .92 : .84} roughness={.96} /></mesh>{objects.filter((object) => !useGroupGizmo || !activeSet.has(object.id)).map((object) => activeIds.length === 1 && object.id === selectedObjectId ? <SingleTransformObject key={object.id} object={object} onDraggingChange={setIsDragging} /> : <SceneMesh key={object.id} object={object} selected={activeSet.has(object.id)} showTag={object.id === selectedObjectId} />)}{useGroupGizmo && <GroupTransformObject objects={groupedObjects} selectedObjectId={selectedObjectId} onDraggingChange={setIsDragging} />}{<ContactShadows position={[0, -.01, 0]} opacity={lighting === "neon" ? .44 : .24} scale={11} blur={2.8} far={6} />}<OrbitControls makeDefault enabled={!isDragging} enablePan={false} minDistance={5.5} maxDistance={14} maxPolarAngle={Math.PI / 2.05} /></>;
}

export default function StudioCanvas() { const environment = useStudioStore((state) => state.environment ?? "atelier"); const objects = useStudioStore((state) => state.objects); const backgroundImage = environment === "space" ? "radial-gradient(circle at 20% 18%, #4f54aa 0 2%, transparent 2.5%), radial-gradient(circle at 78% 24%, #ffffff 0 1%, transparent 1.5%), linear-gradient(145deg, #17174d, #2d2368 54%, #101a47)" : environment === "underwater" ? "radial-gradient(circle at 23% 12%, rgba(255,255,255,.55) 0 4%, transparent 4.5%), radial-gradient(circle at 68% 24%, rgba(255,255,255,.4) 0 3%, transparent 3.5%), linear-gradient(160deg, #80d9e9, #c4f4e7 72%)" : `linear-gradient(180deg, ${"rgba(255,255,255,.16)"}, rgba(255,249,238,.48)), url(${workspaceArtwork})`; return <div className={`studio-canvas environment-${environment}`} style={{ backgroundImage }}><Canvas id="creative-art-canvas" shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} camera={{ position: [7.4, 5.7, 8.4], fov: 42 }}><StudioScene /></Canvas>{!objects.length && <div className="canvas-empty-guide" aria-hidden="true"><span>✦</span><strong>Start with one bright shape</strong><p>Pick a form from the maker shelf.</p><div><i /><i /><i /></div></div>}<div className="canvas-corner-note" aria-hidden="true"><span className="canvas-note-dot" /> drag to look around</div></div>; }
