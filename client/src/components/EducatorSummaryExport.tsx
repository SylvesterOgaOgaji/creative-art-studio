/** Playful Atelier design reminder: privacy tools should read like a clear, accountable studio label rather than an admin dashboard. */
import { FileDown, FileJson, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { exportAnonymizedProjectSummary } from "@/lib/educatorSummary";
import { useStudioStore } from "@/store/useStudioStore";

export default function EducatorSummaryExport() {
  const savedArtworks = useStudioStore((state) => state.savedArtworks);
  const galleryFolders = useStudioStore((state) => state.galleryFolders);
  const makerSpotlights = useStudioStore((state) => state.makerSpotlights);
  const objects = useStudioStore((state) => state.objects);
  const lighting = useStudioStore((state) => state.lighting);
  const environment = useStudioStore((state) => state.environment);
  const ageMode = useStudioStore((state) => state.ageMode);
  const objectCount = savedArtworks.reduce((total, artwork) => total + artwork.objects.length, 0);
  const download = () => {
    exportAnonymizedProjectSummary({ savedArtworks, galleryFolderCount: galleryFolders.length, makerSpotlights, currentObjects: objects, lighting, environment, ageMode });
    toast.success("An anonymized local summary has downloaded.");
  };

  return <section className="educator-summary-export" aria-labelledby="summary-export-title"><div className="summary-export-copy"><span className="eyebrow">Local learning record</span><h2 id="summary-export-title">Download an anonymous project summary.</h2><p>Use a small JSON file to understand how this browser’s studio has been used—without collecting learner identities or creative content.</p><div className="summary-privacy-label"><LockKeyhole aria-hidden="true" /><span>Aggregate counts only. No names, titles, tag labels, images, scene coordinates, or raw artwork data.</span></div></div><aside className="summary-export-card"><FileJson aria-hidden="true" /><dl><div><dt>Saved worlds</dt><dd>{savedArtworks.length}</dd></div><div><dt>Built shapes</dt><dd>{objectCount}</dd></div><div><dt>Project folders</dt><dd>{galleryFolders.length}</dd></div></dl><button onClick={download} disabled={!savedArtworks.length}><FileDown aria-hidden="true" />Download anonymous JSON</button>{savedArtworks.length ? <small><ShieldCheck aria-hidden="true" />Prepared only from this browser’s saved worlds.</small> : <small>Add and save a world to prepare a local summary.</small>}</aside></section>;
}
