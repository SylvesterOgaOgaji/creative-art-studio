/**
 * Playful Atelier design reminder: transforms should feel like intuitive studio tools,
 * with a warm stage that keeps controls secondary to the object being shaped.
 */
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls, TransformControls } from "@react-three/drei";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import type { Mesh } from "three";
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
    matte: { roughness: .82, metalness: .02, emissive: "#000000", emissiveIntensity: 0 },
    glossy: { roughness: .16, metalness: .08, emissive: "#000000", emissiveIntensity: 0 },
    metallic: { roughness: .28, metalness: .88, emissive: "#000000", emissiveIntensity: 0 },
    neon: { roughness: .22, metalness: .08, emissive: color, emissiveIntensity: .72 },
  };
  return <meshStandardMaterial color={color} {...finishes[material]} />;
}

function ObjectMesh({ object, selected, onDraggingChange }: { object: StudioObject; selected: boolean; onDraggingChange: (dragging: boolean) => void }) {
  const meshRef = useRef<Mesh>(null);
  const selectObject = useStudioStore((state) => state.selectObject);
  const transformMode = useStudioStore((state) => state.transformMode);
  const beginDirectTransform = useStudioStore((state) => state.beginDirectTransform);
  const finishDirectTransform = useStudioStore((state) => state.finishDirectTransform);
  const updateObjectDuringTransform = useStudioStore((state) => state.updateObjectDuringTransform);

  const handleSelect = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); selectObject(object.id); };
  const mesh = (
    <mesh ref={meshRef} castShadow receiveShadow position={object.position} rotation={object.rotation} scale={object.scale} onClick={handleSelect} onPointerDown={(event) => event.stopPropagation()}>
      {geometryFor(object.type)}
      {materialFor(object.material, object.color)}
      {selected && <Edges color="#FF6B4A" threshold={15} />}
      {selected && <Html position={[0, 1.35, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}><span className="selected-tag">Selected</span></Html>}
    </mesh>
  );

  if (!selected) return mesh;
  return (
    <TransformControls
      mode={transformMode}
      size={.82}
      onMouseDown={() => { beginDirectTransform(); onDraggingChange(true); }}
      onMouseUp={() => { finishDirectTransform(); onDraggingChange(false); }}
      onObjectChange={() => {
        const mesh = meshRef.current; if (!mesh) return;
        updateObjectDuringTransform(object.id, { position: toTuple(mesh.position), rotation: toTuple(mesh.rotation), scale: toTuple(mesh.scale) });
      }}
    >
      {mesh}
    </TransformControls>
  );
}

function EmptySceneHint() {
  return <Html center position={[0, 1.2, 0]} style={{ pointerEvents: "none" }}><div className="scene-empty-hint"><span className="scene-empty-star">✦</span><strong>Your world starts here</strong><span>Pick a friendly form from the maker shelf.</span></div></Html>;
}

function StudioScene() {
  const [isDragging, setIsDragging] = useState(false);
  const objects = useStudioStore((state) => state.objects);
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const selectObject = useStudioStore((state) => state.selectObject);
  return <>
    <ambientLight intensity={1.35} />
    <directionalLight castShadow intensity={2.1} position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} />
    <pointLight color="#FFD66B" intensity={19} distance={14} position={[-4, 4, 1]} />
    <pointLight color="#8CCBF2" intensity={14} distance={12} position={[4, 2.5, -4]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, 0]} receiveShadow onClick={() => selectObject(null)}><circleGeometry args={[5.6, 96]} /><meshStandardMaterial color="#FFF7E9" transparent opacity={.84} roughness={.96} /></mesh>
    {objects.map((object) => <ObjectMesh key={object.id} object={object} selected={selectedObjectId === object.id} onDraggingChange={setIsDragging} />)}
    {!objects.length && <EmptySceneHint />}
    <ContactShadows position={[0, -.01, 0]} opacity={.24} scale={11} blur={2.8} far={6} />
    <OrbitControls makeDefault enabled={!isDragging} enablePan={false} minDistance={5.5} maxDistance={14} maxPolarAngle={Math.PI / 2.05} />
  </>;
}

export default function StudioCanvas() {
  return <div className="studio-canvas" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,249,238,.48)), url(${workspaceArtwork})` }}>
    <Canvas id="creative-art-canvas" shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} camera={{ position: [7.4, 5.7, 8.4], fov: 42 }}><StudioScene /></Canvas>
    <div className="canvas-corner-note" aria-hidden="true"><span className="canvas-note-dot" /> drag to look around</div>
  </div>;
}
