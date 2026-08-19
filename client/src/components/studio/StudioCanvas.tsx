/**
 * Playful Atelier design reminder: transforms should feel like intuitive studio tools,
 * with a warm stage that keeps controls secondary to the object being shaped.
 */
import { ContactShadows } from "@react-three/drei/core/ContactShadows";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas } from "@react-three/fiber";
import { lazy, Suspense, useState } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import {
  GroupTransformObject,
  SceneMesh,
  SingleTransformObject,
} from "./StudioSceneObjects";

const workspaceArtwork =
  "/manus-storage/playful-atelier-workspace_6be4be8c.jpg";

// The starfield is a special-occasion environment, not part of the default
// atelier. Loading it on demand keeps the first interactive stage lighter.
const Stars = lazy(() =>
  import("@react-three/drei/core/Stars").then(({ Stars: Starfield }) => ({
    default: Starfield,
  }))
);

function StudioScene() {
  const [isDragging, setIsDragging] = useState(false);
  const objects = useStudioStore(state => state.objects);
  const lighting = useStudioStore(state => state.lighting ?? "daylight");
  const environment = useStudioStore(state => state.environment ?? "atelier");
  const selectedObjectId = useStudioStore(state => state.selectedObjectId);
  const selectedObjectIds = useStudioStore(state => state.selectedObjectIds);
  const selectObject = useStudioStore(state => state.selectObject);
  const activeIds = selectedObjectIds.length
    ? selectedObjectIds
    : selectedObjectId
      ? [selectedObjectId]
      : [];
  const activeSet = new Set(activeIds);
  const groupedObjects = objects.filter(object => activeSet.has(object.id));
  const useGroupGizmo = groupedObjects.length > 1;
  const floorColor =
    environment === "space"
      ? "#101a47"
      : environment === "underwater"
        ? "#c9f3ee"
        : lighting === "neon"
          ? "#111B3B"
          : "#FFF7E9";

  return (
    <>
      {environment === "space" && (
        <Suspense fallback={null}>
          <Stars
            radius={70}
            depth={42}
            count={1500}
            factor={3}
            saturation={0.25}
            fade
            speed={0.22}
          />
        </Suspense>
      )}
      {environment === "underwater" && (
        <fog attach="fog" args={["#81d5e5", 7, 19]} />
      )}
      {lighting === "neon" ? (
        <>
          <ambientLight intensity={0.46} color="#7C70FF" />
          <directionalLight
            castShadow
            intensity={0.72}
            color="#A7D7FF"
            position={[5.5, 7.5, 5]}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight
            color="#FF4FA3"
            intensity={34}
            distance={14}
            position={[-4, 4, 1]}
          />
          <pointLight
            color="#4EE7FF"
            intensity={28}
            distance={12}
            position={[4, 2.5, -4]}
          />
          <pointLight
            color="#B5FF68"
            intensity={18}
            distance={10}
            position={[0, 4, 2]}
          />
        </>
      ) : (
        <>
          <ambientLight
            intensity={environment === "underwater" ? 1.55 : 1.35}
            color={environment === "underwater" ? "#d9ffff" : "#ffffff"}
          />
          <directionalLight
            castShadow
            intensity={2.1}
            position={[5.5, 7.5, 5]}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight
            color={environment === "underwater" ? "#52cfe8" : "#FFD66B"}
            intensity={19}
            distance={14}
            position={[-4, 4, 1]}
          />
          <pointLight
            color="#8CCBF2"
            intensity={14}
            distance={12}
            position={[4, 2.5, -4]}
          />
        </>
      )}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        onClick={() => selectObject(null)}
      >
        <circleGeometry args={[5.6, 96]} />
        <meshStandardMaterial
          color={floorColor}
          transparent
          opacity={environment === "space" || lighting === "neon" ? 0.92 : 0.84}
          roughness={0.96}
        />
      </mesh>
      {objects
        .filter(object => !useGroupGizmo || !activeSet.has(object.id))
        .map(object =>
          activeIds.length === 1 && object.id === selectedObjectId ? (
            <SingleTransformObject
              key={object.id}
              object={object}
              onDraggingChange={setIsDragging}
            />
          ) : (
            <SceneMesh
              key={object.id}
              object={object}
              selected={activeSet.has(object.id)}
              showTag={object.id === selectedObjectId}
            />
          )
        )}
      {useGroupGizmo && (
        <GroupTransformObject
          objects={groupedObjects}
          selectedObjectId={selectedObjectId}
          onDraggingChange={setIsDragging}
        />
      )}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={lighting === "neon" ? 0.44 : 0.24}
        scale={11}
        blur={2.8}
        far={6}
      />
      <OrbitControls
        makeDefault
        enabled={!isDragging}
        enablePan={false}
        minDistance={5.5}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export default function StudioCanvas() {
  const environment = useStudioStore(state => state.environment ?? "atelier");
  const objects = useStudioStore(state => state.objects);
  const backgroundImage =
    environment === "space"
      ? "radial-gradient(circle at 20% 18%, #4f54aa 0 2%, transparent 2.5%), radial-gradient(circle at 78% 24%, #ffffff 0 1%, transparent 1.5%), linear-gradient(145deg, #17174d, #2d2368 54%, #101a47)"
      : environment === "underwater"
        ? "radial-gradient(circle at 23% 12%, rgba(255,255,255,.55) 0 4%, transparent 4.5%), radial-gradient(circle at 68% 24%, rgba(255,255,255,.4) 0 3%, transparent 3.5%), linear-gradient(160deg, #80d9e9, #c4f4e7 72%)"
        : `linear-gradient(180deg, ${"rgba(255,255,255,.16)"}, rgba(255,249,238,.48)), url(${workspaceArtwork})`;

  return (
    <div
      className={`studio-canvas environment-${environment}`}
      style={{ backgroundImage }}
    >
      <Canvas
        id="creative-art-canvas"
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [7.4, 5.7, 8.4], fov: 42 }}
      >
        <StudioScene />
      </Canvas>
      {!objects.length && (
        <div className="paper-cut-stage-arch" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      {!objects.length && (
        <div className="canvas-empty-guide" aria-hidden="true">
          <span>✦</span>
          <strong>Start with one bright shape</strong>
          <p>Pick a form from the maker shelf.</p>
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
      )}
      <div className="canvas-corner-note" aria-hidden="true">
        <span className="canvas-note-dot" /> drag to look around
      </div>
    </div>
  );
}
