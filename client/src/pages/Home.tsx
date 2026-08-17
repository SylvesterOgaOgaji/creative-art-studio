/**
 * Playful Atelier design reminder: compose the studio like a physical workbench—the
 * 3D stage leads, with maker tools and inspection controls framing purposeful play.
 */
import { useEffect } from "react";
import { Archive, Eraser, GalleryHorizontalEnd, Sparkles } from "lucide-react";
import { toast } from "sonner";
import GalleryDrawer from "@/components/studio/GalleryDrawer";
import PropertiesPanel from "@/components/studio/PropertiesPanel";
import StudioCanvas from "@/components/studio/StudioCanvas";
import ToolPanel from "@/components/studio/ToolPanel";
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

  useEffect(() => {
    const handleDelete = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if ((event.key === "Backspace" || event.key === "Delete") && selectedObjectId) {
        event.preventDefault();
        deleteSelectedObject();
        toast("Shape removed from your stage.");
      }
    };
    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, [deleteSelectedObject, selectedObjectId]);

  const handleSave = () => {
    const artwork = saveArtwork();
    if (!artwork) {
      toast.error("Add a shape before saving your artwork.");
      return;
    }
    toast.success(`Saved “${artwork.title}” to this device.`);
  };

  const handleSurprise = () => {
    surpriseMe();
    toast.success("A new tiny universe has appeared.");
  };

  const handleClear = () => {
    clearScene();
    toast("Fresh stage, fresh ideas.");
  };

  return (
    <div className="studio-app">
      <header className="studio-header">
        <div className="brand-lockup">
          <div className="brand-spark" aria-hidden="true">
            <img className="spark-mark" src={sparkMark} alt="" />
            <span className="spark-lobe spark-lobe-one" />
            <span className="spark-lobe spark-lobe-two" />
            <span className="spark-lobe spark-lobe-three" />
            <span className="spark-lobe spark-lobe-four" />
          </div>
          <div>
            <span className="brand-kicker">Creative Art Studio</span>
            <strong>Make a tiny world.</strong>
          </div>
        </div>

        <div className="artwork-title-field">
          <label htmlFor="artwork-title">Name your world</label>
          <input id="artwork-title" value={artworkTitle} onChange={(event) => setArtworkTitle(event.target.value)} maxLength={48} />
        </div>

        <nav className="header-actions" aria-label="Studio actions">
          <button className="gallery-button" onClick={() => setGalleryOpen(true)}>
            <GalleryHorizontalEnd aria-hidden="true" />
            <span>Worlds</span>
            {savedArtworks.length > 0 && <b>{savedArtworks.length}</b>}
          </button>
          <button className="save-button" onClick={handleSave}>
            <Archive aria-hidden="true" />
            <span>Keep it</span>
          </button>
        </nav>
      </header>

      <main className="atelier-layout">
        <ToolPanel />

        <section className="workspace-panel" aria-label="3D creative workspace">
          <div className="workspace-header">
            <div>
              <span className="eyebrow">Your art stage</span>
              <h1>{objects.length ? "Keep playing with your shapes." : "Make something that only you could make."}</h1>
            </div>
            <span className="shape-count">{objects.length} shape{objects.length === 1 ? "" : "s"}</span>
          </div>

          <StudioCanvas />

          <div className="workspace-actionbar">
            <button className="clear-button" onClick={handleClear} disabled={!objects.length}>
              <Eraser aria-hidden="true" />
              Fresh stage
            </button>
            <p><span>Tap</span> a shape to make it yours <i>·</i> <span>Drag</span> the stage to look around</p>
            <button className="surprise-button" onClick={handleSurprise}>
              <Sparkles aria-hidden="true" />
              <span>Surprise Me</span>
              <small>new idea</small>
            </button>
          </div>
        </section>

        <PropertiesPanel />
      </main>

      <GalleryDrawer />
    </div>
  );
}
