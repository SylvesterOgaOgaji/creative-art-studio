/**
 * Playful Atelier design reminder: the workspace is the hero—soft, tactile, and
 * visually calm around the active 3D artwork, never a technical-looking viewport.
 */
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Edges, Html, OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";
import type { StudioMaterial, StudioObject } from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";

const workspaceArtwork = "/manus-storage/playful-atelier-workspace_6be4be8c.jpg";

function geometryFor(type: StudioObject["type"]): ReactNode {
  switch (type) {
    case "sphere":
      return <sphereGeometry args={[0.78, 48, 32]} />;
    case "cone":
      return <coneGeometry args={[0.76, 1.55, 48]} />;
    case "cylinder":
      return <cylinderGeometry args={[0.7, 0.7, 1.45, 48]} />;
    case "torus":
      return <torusGeometry args={[0.72, 0.25, 20, 64]} />;
    case "cube":
    default:
      return <boxGeometry args={[1.25, 1.25, 1.25]} />;
  }
}

function materialFor(material: StudioMaterial, color: string) {
  const finishes: Record<StudioMaterial, { roughness: number; metalness: number; emissive: string; emissiveIntensity: number }> = {
    matte: { roughness: 0.82, metalness: 0.02, emissive: "#000000", emissiveIntensity: 0 },
    glossy: { roughness: 0.16, metalness: 0.08, emissive: "#000000", emissiveIntensity: 0 },
    metallic: { roughness: 0.28, metalness: 0.88, emissive: "#000000", emissiveIntensity: 0 },
    neon: { roughness: 0.22, metalness: 0.08, emissive: color, emissiveIntensity: 0.72 },
  };

  return <meshStandardMaterial color={color} {...finishes[material]} />;
}

function ObjectMesh({ object, selected }: { object: StudioObject; selected: boolean }) {
  const selectObject = useStudioStore((state) => state.selectObject);

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectObject(object.id);
  };

  return (
    <mesh
      castShadow
      receiveShadow
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleSelect}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {geometryFor(object.type)}
      {materialFor(object.material, object.color)}
      {selected && <Edges color="#FF6B4A" threshold={15} />}
      {selected && (
        <Html position={[0, 1.35, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
          <span className="selected-tag">Selected</span>
        </Html>
      )}
    </mesh>
  );
}

function EmptySceneHint() {
  return (
    <Html center position={[0, 1.2, 0]} style={{ pointerEvents: "none" }}>
      <div className="scene-empty-hint">
        <span className="scene-empty-star">✦</span>
        <strong>Your world starts here</strong>
        <span>Pick a friendly form from the maker shelf.</span>
      </div>
    </Html>
  );
}

function StudioScene() {
  const objects = useStudioStore((state) => state.objects);
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const selectObject = useStudioStore((state) => state.selectObject);

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight castShadow intensity={2.1} position={[5.5, 7.5, 5]} shadow-mapSize={[1024, 1024]} />
      <pointLight color="#FFD66B" intensity={19} distance={14} position={[-4, 4, 1]} />
      <pointLight color="#8CCBF2" intensity={14} distance={12} position={[4, 2.5, -4]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow onClick={() => selectObject(null)}>
        <circleGeometry args={[5.6, 96]} />
        <meshStandardMaterial color="#FFF7E9" transparent opacity={0.84} roughness={0.96} />
      </mesh>
      {objects.map((object) => (
        <ObjectMesh key={object.id} object={object} selected={selectedObjectId === object.id} />
      ))}
      {!objects.length && <EmptySceneHint />}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.24} scale={11} blur={2.8} far={6} />
      <OrbitControls makeDefault enablePan={false} minDistance={5.5} maxDistance={14} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}

export default function StudioCanvas() {
  return (
    <div
      className="studio-canvas"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,249,238,0.48)), url(${workspaceArtwork})` }}
    >
      <Canvas shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ position: [7.4, 5.7, 8.4], fov: 42 }}>
        <StudioScene />
      </Canvas>
      <div className="canvas-corner-note" aria-hidden="true">
        <span className="canvas-note-dot" />
        drag to look around
      </div>
    </div>
  );
}
