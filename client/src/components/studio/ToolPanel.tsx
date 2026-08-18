/**
 * Playful Atelier design reminder: use a friendly maker-shelf rhythm—visual controls
 * first, clear labels second, and expressive pigment without a noisy rainbow wall.
 * Age modes quietly change the shelf's depth while preserving one shared creative engine.
 */
import {
  Aperture,
  Box,
  CircleDot,
  Compass,
  Cylinder,
  Heart,
  Palette,
  Rocket,
  Ruler,
  Smile,
  Sparkles,
  Star,
  Sun,
  Triangle,
  Volume2,
  VolumeX,
  Waves,
  Zap,
} from "lucide-react";
import {
  ageModeDetails,
  environmentDetails,
  materialDetails,
  stickerDetails,
  studioColors,
  textureDetails,
  type StudioAgeMode,
  type StudioEnvironment,
  type StudioMaterial,
  type StudioObjectType,
  type StudioSticker,
  type StudioTexture,
} from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";
import { playStudioSound } from "@/lib/studioSound";

const objectOptions: Array<{
  type: StudioObjectType;
  label: string;
  Icon: typeof Box;
}> = [
  { type: "cube", label: "Cube", Icon: Box },
  { type: "sphere", label: "Sphere", Icon: CircleDot },
  { type: "cone", label: "Cone", Icon: Triangle },
  { type: "cylinder", label: "Cylinder", Icon: Cylinder },
  { type: "torus", label: "Torus", Icon: Aperture },
];
const ageModeIcons: Record<StudioAgeMode, typeof Sparkles> = {
  explorer: Compass,
  creator: Palette,
  designer: Ruler,
};

export default function ToolPanel() {
  const addObject = useStudioStore(state => state.addObject);
  const selectedObjectIds = useStudioStore(state => state.selectedObjectIds);
  const selectedObject = useStudioStore(state =>
    state.objects.find(object => object.id === state.selectedObjectId)
  );
  const setSelectedColor = useStudioStore(state => state.setSelectedColor);
  const setSelectedMaterial = useStudioStore(
    state => state.setSelectedMaterial
  );
  const lighting = useStudioStore(state => state.lighting ?? "daylight");
  const setLighting = useStudioStore(state => state.setLighting);
  const setSelectedTexture = useStudioStore(state => state.setSelectedTexture);
  const setSelectedSticker = useStudioStore(state => state.setSelectedSticker);
  const soundEnabled = useStudioStore(state => state.soundEnabled);
  const setSoundEnabled = useStudioStore(state => state.setSoundEnabled);
  const soundVolume = useStudioStore(state => state.soundVolume);
  const setSoundVolume = useStudioStore(state => state.setSoundVolume);
  const environment = useStudioStore(state => state.environment);
  const setEnvironment = useStudioStore(state => state.setEnvironment);
  const ageMode = useStudioStore(state => state.ageMode);
  const setAgeMode = useStudioStore(state => state.setAgeMode);
  const tutorialStep = useStudioStore(state => state.tutorialStep);
  const hasSelection = selectedObjectIds.length > 0;
  const selectedTexture = selectedObject?.texture ?? "plain";
  const selectedSticker = selectedObject?.sticker ?? "none";
  const isExplorer = ageMode === "explorer";
  const isDesigner = ageMode === "designer";
  const availableObjects = isExplorer
    ? objectOptions.slice(0, 3)
    : objectOptions;
  const availableColours = isExplorer ? studioColors.slice(0, 5) : studioColors;
  const stickerIcons: Record<StudioSticker, typeof Star> = {
    none: CircleDot,
    star: Star,
    heart: Heart,
    smile: Smile,
  };
  const environmentIcons: Record<StudioEnvironment, typeof Palette> = {
    atelier: Palette,
    space: Rocket,
    underwater: Waves,
  };
  return (
    <aside
      className={`tool-panel panel-surface age-mode-${ageMode}`}
      aria-label="Creation panel"
    >
      <section className="age-mode-section" aria-labelledby="age-mode-heading">
        <div className="panel-heading compact-heading">
          <span className="eyebrow">Making mode</span>
          <h2 id="age-mode-heading">Choose your pace</h2>
        </div>
        <div
          className="age-mode-row"
          role="group"
          aria-label="Age-adaptive studio mode"
        >
          {(
            Object.entries(ageModeDetails) as [
              StudioAgeMode,
              (typeof ageModeDetails)[StudioAgeMode],
            ][]
          ).map(([mode, detail]) => {
            const Icon = ageModeIcons[mode];
            return (
              <button
                key={mode}
                className={`age-mode-button ${ageMode === mode ? "is-active" : ""}`}
                onClick={() => setAgeMode(mode)}
                aria-pressed={ageMode === mode}
              >
                <Icon aria-hidden="true" />
                <span>
                  <b>{detail.label}</b>
                  <small>{detail.ageRange}</small>
                </span>
              </button>
            );
          })}
        </div>
        <p className="age-mode-description">
          {ageModeDetails[ageMode].description}
        </p>
      </section>
      <div className="panel-heading">
        <span className="eyebrow">Maker shelf</span>
        <h2>Pick a shape</h2>
        <p>
          {isExplorer
            ? "Tap a bright shape to start playing."
            : "Tap a form to bring it onto your stage."}
        </p>
      </div>
      <div
        className={`shape-grid ${tutorialStep === "add" ? "tutorial-target is-guided" : ""}`}
        aria-label="Add a 3D object"
      >
        {availableObjects.map(({ type, label, Icon }) => (
          <button
            key={type}
            className="shape-button has-tooltip"
            data-tooltip={`Add a ${label}`}
            onClick={() => {
              addObject(type);
              playStudioSound("pop", soundEnabled, soundVolume);
            }}
            aria-label={`Add a ${label}`}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="tool-divider" />
      <div className="panel-heading compact-heading">
        <span className="eyebrow">Pigment</span>
        <h2>Give it a colour</h2>
      </div>
      <div
        className={`color-grid ${tutorialStep === "colour" ? "tutorial-target is-guided" : ""}`}
        aria-label="Colour selection"
      >
        {availableColours.map(color => (
          <button
            key={color.name}
            className={`color-swatch ${selectedObject?.color === color.value ? "is-active" : ""}`}
            style={{ backgroundColor: color.value }}
            onClick={() => {
              setSelectedColor(color.value);
              playStudioSound("colour", soundEnabled, soundVolume);
            }}
            disabled={!hasSelection}
            aria-label={`Set selected shape colour to ${color.name}`}
            aria-pressed={selectedObject?.color === color.value}
          >
            {selectedObject?.color === color.value && (
              <span aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
      {!isExplorer && (
        <label className="custom-color-label">
          <span>Mix your own</span>
          <input
            type="color"
            value={selectedObject?.color ?? "#FF6B4A"}
            onChange={event => {
              setSelectedColor(event.target.value);
              playStudioSound("colour", soundEnabled, soundVolume);
            }}
            disabled={!hasSelection}
            aria-label="Choose a custom colour for selected shapes"
          />
        </label>
      )}
      {!isExplorer && (
        <>
          <div className="tool-divider" />
          <div className="panel-heading compact-heading">
            <span className="eyebrow">Surface feel</span>
            <h2>Choose a material</h2>
          </div>
          <div className="material-list" aria-label="Material selection">
            {Object.entries(materialDetails).map(([value, detail]) => (
              <button
                key={value}
                className={`material-button ${selectedObject?.material === value ? "is-active" : ""}`}
                onClick={() => setSelectedMaterial(value as StudioMaterial)}
                disabled={!hasSelection}
                aria-pressed={selectedObject?.material === value}
              >
                <span
                  className="material-dot"
                  style={{ background: detail.swatch }}
                  aria-hidden="true"
                />
                <span>
                  <strong>{detail.label}</strong>
                  <small>{detail.description}</small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {isDesigner && (
        <>
          <div className="tool-divider" />
          <div className="panel-heading compact-heading">
            <span className="eyebrow">Pattern shelf</span>
            <h2>Dress it up</h2>
          </div>
          <div className="texture-row" aria-label="Shape pattern">
            {(
              Object.entries(textureDetails) as [
                StudioTexture,
                (typeof textureDetails)[StudioTexture],
              ][]
            ).map(([value, detail]) => (
              <button
                key={value}
                className={`texture-button texture-${value} ${selectedTexture === value ? "is-active" : ""}`}
                onClick={() => {
                  setSelectedTexture(value);
                  playStudioSound("texture", soundEnabled, soundVolume);
                }}
                disabled={!hasSelection}
                aria-pressed={selectedTexture === value}
              >
                <span aria-hidden="true" />
                <b>{detail.label}</b>
              </button>
            ))}
          </div>
          <div className="sticker-row" aria-label="Shape sticker">
            {(
              Object.entries(stickerDetails) as [
                StudioSticker,
                (typeof stickerDetails)[StudioSticker],
              ][]
            ).map(([value, detail]) => {
              const Icon = stickerIcons[value];
              return (
                <button
                  key={value}
                  className={`sticker-button ${selectedSticker === value ? "is-active" : ""}`}
                  onClick={() => {
                    setSelectedSticker(value);
                    playStudioSound("texture", soundEnabled, soundVolume);
                  }}
                  disabled={!hasSelection}
                  aria-label={`Put ${detail.label.toLowerCase()} sticker on selected shape`}
                  aria-pressed={selectedSticker === value}
                >
                  <Icon aria-hidden="true" />
                  <span>{detail.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {!isExplorer && (
        <>
          <div className="tool-divider" />
          <div className="panel-heading compact-heading">
            <span className="eyebrow">Stage glow</span>
            <h2>Light your world</h2>
          </div>
          <div className="lighting-row" aria-label="Scene lighting">
            <button
              className={`lighting-button ${lighting === "daylight" ? "is-active" : ""}`}
              onClick={() => setLighting("daylight")}
              aria-pressed={lighting === "daylight"}
              title="Warm, clear daylight"
            >
              <Sun aria-hidden="true" />
              Daylight
            </button>
            <button
              className={`lighting-button ${lighting === "neon" ? "is-active" : ""}`}
              onClick={() => setLighting("neon")}
              aria-pressed={lighting === "neon"}
              title="Colourful after-dark glow"
            >
              <Zap aria-hidden="true" />
              Neon
            </button>
          </div>
          <div className="panel-heading compact-heading environment-heading">
            <span className="eyebrow">World backdrop</span>
            <h2>Choose a place</h2>
          </div>
          <div className="environment-row" aria-label="Background environment">
            {(
              Object.entries(environmentDetails) as [
                StudioEnvironment,
                (typeof environmentDetails)[StudioEnvironment],
              ][]
            ).map(([value, detail]) => {
              const Icon = environmentIcons[value];
              return (
                <button
                  key={value}
                  className={`environment-button environment-${value} ${environment === value ? "is-active" : ""}`}
                  onClick={() => setEnvironment(value)}
                  aria-pressed={environment === value}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <b>{detail.label}</b>
                    <small>{detail.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {isDesigner && (
        <>
          <button
            className={`sound-setting ${soundEnabled ? "is-active" : ""}`}
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              playStudioSound("toggle", next, soundVolume);
            }}
            aria-pressed={soundEnabled}
          >
            <span>
              {soundEnabled ? (
                <Volume2 aria-hidden="true" />
              ) : (
                <VolumeX aria-hidden="true" />
              )}
            </span>
            <span>
              <b>Studio sounds</b>
              <small>
                {soundEnabled
                  ? "On — tiny chimes are playing"
                  : "Off — tap to turn on"}
              </small>
            </span>
          </button>
          <label className="volume-control">
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(soundVolume * 100)}
              onChange={event => {
                const next = Number(event.target.value) / 100;
                setSoundVolume(next);
                playStudioSound("toggle", soundEnabled, next);
              }}
              disabled={!soundEnabled}
              aria-label="Studio sound volume"
            />
            <output>{Math.round(soundVolume * 100)}%</output>
          </label>
        </>
      )}
    </aside>
  );
}
