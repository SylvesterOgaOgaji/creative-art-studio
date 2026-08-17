/**
 * Playful Atelier design reminder: saved work should feel personal and real, using
 * the user's actual object palettes rather than fabricated reviews or social signals.
 */
import { Check, FolderOpen, Trash2, X } from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";

const emptyGalleryArtwork = "/manus-storage/atelier-gallery-card_f01187c1.jpg";

export default function GalleryDrawer() {
  const galleryOpen = useStudioStore((state) => state.galleryOpen);
  const savedArtworks = useStudioStore((state) => state.savedArtworks);
  const setGalleryOpen = useStudioStore((state) => state.setGalleryOpen);
  const loadArtwork = useStudioStore((state) => state.loadArtwork);
  const deleteArtwork = useStudioStore((state) => state.deleteArtwork);

  if (!galleryOpen) return null;

  return (
    <div className="gallery-overlay" role="presentation" onMouseDown={() => setGalleryOpen(false)}>
      <aside className="gallery-drawer" role="dialog" aria-modal="true" aria-labelledby="gallery-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="gallery-header">
          <div>
            <span className="eyebrow">Local gallery</span>
            <h2 id="gallery-title">Your little worlds</h2>
          </div>
          <button className="icon-button" onClick={() => setGalleryOpen(false)} aria-label="Close gallery"><X /></button>
        </header>

        {savedArtworks.length === 0 ? (
          <div className="gallery-empty">
            <img src={emptyGalleryArtwork} alt="A playful example sculpture made of colourful shapes" />
            <h3>Your gallery is ready</h3>
            <p>Build something, then press Save to keep its shapes and colours on this device.</p>
          </div>
        ) : (
          <div className="artwork-list">
            {savedArtworks.map((artwork) => (
              <article className="artwork-card" key={artwork.id}>
                <div className="artwork-thumbnail" aria-label={`Preview of ${artwork.title}`}>
                  {artwork.thumbnailDataUrl ? (
                    <img src={artwork.thumbnailDataUrl} alt={`Generated preview of ${artwork.title}`} />
                  ) : (
                    <div className="artwork-thumbnail-fallback" aria-hidden="true">
                      {artwork.objects.slice(0, 5).map((object, index) => <span key={object.id} style={{ backgroundColor: object.color, transform: `translate(${index * 19 - 34}px, ${(index % 2) * 19 - 9}px) rotate(${index * 23}deg)` }} />)}
                    </div>
                  )}
                </div>
                <div className="artwork-colour-strip" aria-hidden="true">
                  {artwork.objects.slice(0, 6).map((object) => <span key={object.id} style={{ backgroundColor: object.color }} />)}
                </div>
                <div className="artwork-card-main">
                  <div>
                    <h3>{artwork.title}</h3>
                    <p>{artwork.objects.length} shape{artwork.objects.length === 1 ? "" : "s"} · {new Date(artwork.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="gallery-delete" onClick={() => deleteArtwork(artwork.id)} aria-label={`Delete ${artwork.title}`}><Trash2 /></button>
                </div>
                <button className="open-artwork-button" onClick={() => loadArtwork(artwork.id)}><FolderOpen aria-hidden="true" /> Open and keep making <Check aria-hidden="true" /></button>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
