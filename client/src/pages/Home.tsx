/**
 * Playful Atelier design reminder: compose the studio like a physical workbench—the
 * 3D stage leads, with maker tools and inspection controls framing purposeful play.
 */
import { useCallback, useEffect, useState } from "react";
import "@/styles/studioExtensions.css";
import "@/styles/tutorialOverlayFix.css";
import "@/styles/playExtras.css";
import { Archive, CircleHelp, Download, Eraser, GalleryHorizontalEnd, Layers3, Redo2, Sparkles, Undo2, Volume2, VolumeX } from "lucide-react";
import ChallengeCard from "@/components/studio/ChallengeCard";
import { toast } from "sonner";
import GalleryDrawer from "@/components/studio/GalleryDrawer";
import FirstRunTutorial from "@/components/studio/FirstRunTutorial";
import PropertiesPanel from "@/components/studio/PropertiesPanel";
import SaveCelebration from "@/components/studio/SaveCelebration";
import StudioCanvas from "@/components/studio/StudioCanvas";
import ToolPanel from "@/components/studio/ToolPanel";
import { captureStudioImage, exportStudioImage } from "@/lib/studioImage";
import { playStudioSound } from "@/lib/studioSound";
import { useStudioStore } from "@/store/useStudioStore";

const sparkMark = "/manus-storage/creative-art-studio-spark_5082d4a6.png";

export default function Home() {
  const artworkTitle = useStudioStore((state) => state.artworkTitle);
  const setArtworkTitle = useStudioStore((state) => state.setArtworkTitle);
  const objects = useStudioStore((state) => state.objects);
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const savedArtworks = useStudioStore((state) => state.savedArtworks);
  const setGalleryOpen = useStudioStore((state) => state.setGalleryOpen);
  const clearScene = useStudioStore((state) => state.clearScene);
  const surpriseMe = useStudioStore((state) => state.surpriseMe);
  const saveArtwork = useStudioStore((state) => state.saveArtwork);
  const deleteSelectedObject = useStudioStore((state) => state.deleteSelectedObject);
  const undo = useStudioStore((state) => state.undo);
  const redo = useStudioStore((state) => state.redo);
  const multiSelectMode = useStudioStore((state) => state.multiSelectMode);
  const setMultiSelectMode = useStudioStore((state) => state.setMultiSelectMode);
  const canUndo = useStudioStore((state) => state.past.length > 0);
  const canRedo = useStudioStore((state) => state.future.length > 0);
  const tutorialStep = useStudioStore((state) => state.tutorialStep);
  const startTutorial = useStudioStore((state) => state.startTutorial);
  const skipTutorial = useStudioStore((state) => state.skipTutorial);
  const replayTutorial = useStudioStore((state) => state.replayTutorial);
  const soundEnabled = useStudioStore((state) => state.soundEnabled);
  const setSoundEnabled = useStudioStore((state) => state.setSoundEnabled);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => { const handleDelete = (event: KeyboardEvent) => { const target = event.target as HTMLElement | null; if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return; if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; } if ((event.key === "Backspace" || event.key === "Delete") && selectedObjectId) { event.preventDefault(); deleteSelectedObject(); toast("Shape removed from your stage."); } }; window.addEventListener("keydown", handleDelete); return () => window.removeEventListener("keydown", handleDelete); }, [deleteSelectedObject, redo, selectedObjectId, undo]);
  const handleSave = () => { const artwork = saveArtwork(captureStudioImage(objects, 520, 340) ?? undefined); if (!artwork) { toast.error("Add a shape before saving your artwork."); return; } setIsCelebrating(true); playStudioSound("celebrate", soundEnabled); toast.success(`Saved “${artwork.title}” to this device.`); };
  const finishCelebration = useCallback(() => setIsCelebrating(false), []);
  const handleExport = () => { if (exportStudioImage(artworkTitle, objects)) toast.success("Your artwork is ready as a PNG."); else toast.error("The stage is still waking up. Try export again in a moment."); };
  const handleSurprise = () => { surpriseMe(); toast.success("A new tiny universe has appeared."); };
  const handleClear = () => { clearScene(); toast("Fresh stage, fresh ideas."); };
  const toggleMultiSelect = () => { setMultiSelectMode(!multiSelectMode); toast(multiSelectMode ? "Pick one shape at a time." : "Pick many is on. Tap shapes to choose a group."); };
  return <div className="studio-app"><header className="studio-header"><div className="brand-lockup"><div className="brand-spark" aria-hidden="true"><img className="spark-mark" src={sparkMark} alt="" /><span className="spark-lobe spark-lobe-one" /><span className="spark-lobe spark-lobe-two" /><span className="spark-lobe spark-lobe-three" /><span className="spark-lobe spark-lobe-four" /></div><div><span className="brand-kicker">Creative Art Studio</span><strong>Make a tiny world.</strong></div></div><div className="artwork-title-field"><label htmlFor="artwork-title">Give your world a name</label><input id="artwork-title" value={artworkTitle} onChange={(event) => setArtworkTitle(event.target.value)} maxLength={48} /></div><nav className="header-actions" aria-label="Studio actions"><div className="history-controls" aria-label="Undo and redo controls"><button className="history-button has-tooltip" data-tooltip="Undo" onClick={undo} disabled={!canUndo} aria-label="Undo last creative action"><Undo2 aria-hidden="true" /></button><button className="history-button has-tooltip" data-tooltip="Redo" onClick={redo} disabled={!canRedo} aria-label="Redo last creative action"><Redo2 aria-hidden="true" /></button></div><FirstRunTutorial step={tutorialStep} onStart={startTutorial} onSkip={skipTutorial} onReplay={replayTutorial} /><button className={`header-sound-toggle has-tooltip ${soundEnabled ? "is-active" : ""}`} data-tooltip={soundEnabled ? "Turn studio sounds off" : "Turn studio sounds on"} onClick={() => { const next = !soundEnabled; setSoundEnabled(next); playStudioSound("toggle", next); }} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Turn studio sounds off" : "Turn studio sounds on"}>{soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}<span>Sounds</span></button><button className="gallery-button has-tooltip" data-tooltip="Your saved worlds" onClick={() => setGalleryOpen(true)}><GalleryHorizontalEnd aria-hidden="true" /><span>My worlds</span>{savedArtworks.length > 0 && <b>{savedArtworks.length}</b>}</button><button className="save-button has-tooltip" data-tooltip="Save to this browser" onClick={handleSave}><Archive aria-hidden="true" /><span>Save world</span></button></nav></header><main className="atelier-layout"><ToolPanel /><section className="workspace-panel" aria-label="3D creative workspace"><div className="workspace-header"><div><span className="eyebrow">Your art stage</span><h1>{objects.length ? "Keep playing with your shapes." : "Make something that only you could make."}</h1></div><span className="shape-count">{objects.length} shape{objects.length === 1 ? "" : "s"}</span></div><StudioCanvas /><div className="workspace-actionbar"><button className="clear-button has-tooltip" data-tooltip="Clear the stage" onClick={handleClear} disabled={!objects.length}><Eraser aria-hidden="true" />Fresh stage</button><button className={`multi-select-button has-tooltip ${multiSelectMode ? "is-active" : ""}`} data-tooltip="Choose several shapes" onClick={toggleMultiSelect} aria-pressed={multiSelectMode}><Layers3 aria-hidden="true" />{multiSelectMode ? "Picking many" : "Pick many"}</button><p><span>Tap</span> a shape to make it yours <i>·</i> <span>Drag</span> the stage to look around</p><button className="surprise-button has-tooltip" data-tooltip="Make a ready-to-play scene" onClick={handleSurprise}><Sparkles aria-hidden="true" /><span>Surprise Me</span><small>new idea</small></button><button className="export-button has-tooltip" data-tooltip="Save a picture to this device" type="button" onClick={handleExport} disabled={!objects.length}><Download aria-hidden="true" /><span>Take a PNG</span></button></div><ChallengeCard /><div className="studio-quick-guide" role="note"><CircleHelp aria-hidden="true" /><p><strong>Try this:</strong> pick a shape, tap it on your stage, then drag the colourful handles. Turn on <b>Pick many</b> to shape a group together.</p></div></section><PropertiesPanel /></main><GalleryDrawer /><SaveCelebration active={isCelebrating} onDone={finishCelebration} /></div>;
}
