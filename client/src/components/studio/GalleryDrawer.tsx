/**
 * Playful Atelier design reminder: saved work should feel personal and real, using
 * browser-local folders and tags that help young makers revisit their own worlds.
 */
import {
  Check,
  Download,
  FolderOpen,
  Pencil,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { filterGalleryArtworks } from "@/lib/galleryOrganization";
import { exportSavedArtworkImage } from "@/lib/studioImage";
import { useStudioStore } from "@/store/useStudioStore";
import GalleryFolderControls from "./GalleryFolderControls";
import GallerySearchControls from "./GallerySearchControls";
import GalleryTagControls from "./GalleryTagControls";

const emptyGalleryArtwork = "/manus-storage/atelier-gallery-card_f01187c1.jpg";

export default function GalleryDrawer() {
  const galleryOpen = useStudioStore(state => state.galleryOpen);
  const savedArtworks = useStudioStore(state => state.savedArtworks);
  const galleryFolders = useStudioStore(state => state.galleryFolders);
  const setGalleryOpen = useStudioStore(state => state.setGalleryOpen);
  const loadArtwork = useStudioStore(state => state.loadArtwork);
  const deleteArtwork = useStudioStore(state => state.deleteArtwork);
  const renameArtwork = useStudioStore(state => state.renameArtwork);
  const toggleArtworkFavorite = useStudioStore(
    state => state.toggleArtworkFavorite
  );
  const createGalleryFolder = useStudioStore(
    state => state.createGalleryFolder
  );
  const renameGalleryFolder = useStudioStore(
    state => state.renameGalleryFolder
  );
  const deleteGalleryFolder = useStudioStore(
    state => state.deleteGalleryFolder
  );
  const assignArtworkFolder = useStudioStore(
    state => state.assignArtworkFolder
  );
  const setArtworkTags = useStudioStore(state => state.setArtworkTags);
  const makerSpotlights = useStudioStore(state => state.makerSpotlights);
  const setMakerSpotlight = useStudioStore(state => state.setMakerSpotlight);
  const removeMakerSpotlight = useStudioStore(
    state => state.removeMakerSpotlight
  );
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const [folderDeleteCandidate, setFolderDeleteCandidate] = useState<
    string | null
  >(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [folderFilter, setFolderFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [spotlightDrafts, setSpotlightDrafts] = useState<
    Record<string, string>
  >({});
  const matchingArtworks = useMemo(() => {
    return filterGalleryArtworks({
      artworks: savedArtworks,
      folders: galleryFolders,
      search,
      folderFilter,
      tagFilter,
      favoritesOnly,
    });
  }, [
    savedArtworks,
    galleryFolders,
    search,
    folderFilter,
    tagFilter,
    favoritesOnly,
  ]);
  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setDraftTitle(title);
  };
  const saveRename = () => {
    if (editingId && draftTitle.trim()) renameArtwork(editingId, draftTitle);
    setEditingId(null);
  };
  const confirmDelete = () => {
    if (deleteCandidate) deleteArtwork(deleteCandidate);
    setDeleteCandidate(null);
  };
  const featureArtwork = (
    event: FormEvent<HTMLFormElement>,
    artworkId: string
  ) => {
    event.preventDefault();
    const makerName = spotlightDrafts[artworkId] ?? "";
    if (!makerName.trim()) {
      toast.error("Add the maker’s first name or chosen display name.");
      return;
    }
    setMakerSpotlight(artworkId, makerName);
    setSpotlightDrafts(drafts => ({ ...drafts, [artworkId]: "" }));
    toast.success(
      "This world is now featured in Meet the Makers on this device."
    );
  };
  const downloadArtwork = (
    title: string,
    objects: Parameters<typeof exportSavedArtworkImage>[1]
  ) => {
    if (exportSavedArtworkImage(title, objects))
      toast.success(`Downloaded “${title}” as a PNG.`);
    else toast.error("This artwork could not be made into an image just yet.");
  };
  if (!galleryOpen) return null;

  const favoriteCount = savedArtworks.filter(
    artwork => artwork.isFavorite
  ).length;
  return (
    <div
      className="gallery-overlay"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) setGalleryOpen(false);
      }}
    >
      <aside
        className="gallery-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-title"
      >
        <header className="gallery-header">
          <div>
            <span className="eyebrow">Local gallery</span>
            <h2 id="gallery-title">Your little worlds</h2>
          </div>
          <button
            className="icon-button"
            onClick={() => setGalleryOpen(false)}
            aria-label="Close gallery"
          >
            <X />
          </button>
        </header>
        {savedArtworks.length === 0 ? (
          <div className="gallery-empty">
            <img
              src={emptyGalleryArtwork}
              alt="A playful example sculpture made of colourful shapes"
            />
            <h3>Your gallery is ready</h3>
            <p>
              Build something, then press Save to keep its shapes and colours on
              this device.
            </p>
          </div>
        ) : (
          <>
            <GalleryFolderControls
              artworks={savedArtworks}
              galleryFolders={galleryFolders}
              folderFilter={folderFilter}
              tagFilter={tagFilter}
              onFolderFilterChange={setFolderFilter}
              onTagFilterChange={setTagFilter}
              onCreateFolder={createGalleryFolder}
              onRenameFolder={renameGalleryFolder}
              onDeleteFolderRequest={setFolderDeleteCandidate}
            />
            <GallerySearchControls
              search={search}
              onSearchChange={setSearch}
              favoritesOnly={favoritesOnly}
              onFavoritesOnlyChange={setFavoritesOnly}
              favoriteCount={favoriteCount}
            />
            {matchingArtworks.length === 0 ? (
              <div className="gallery-no-results">
                <Search aria-hidden="true" />
                <h3>
                  {favoritesOnly
                    ? "No starred worlds yet"
                    : "No matching worlds"}
                </h3>
                <p>Try another folder, tag, or search word.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFavoritesOnly(false);
                    setFolderFilter("all");
                    setTagFilter("all");
                  }}
                >
                  Show all worlds
                </button>
              </div>
            ) : (
              <div className="artwork-list">
                {matchingArtworks.map(artwork => {
                  const spotlight = makerSpotlights.find(
                    entry => entry.artworkId === artwork.id
                  );
                  return (
                    <article className="artwork-card" key={artwork.id}>
                      <div
                        className="artwork-thumbnail"
                        aria-label={`Preview of ${artwork.title}`}
                      >
                        {artwork.thumbnailDataUrl ? (
                          <img
                            src={artwork.thumbnailDataUrl}
                            alt={`Generated preview of ${artwork.title}`}
                          />
                        ) : (
                          <div
                            className="artwork-thumbnail-fallback"
                            aria-hidden="true"
                          >
                            {artwork.objects
                              .slice(0, 5)
                              .map((object, index) => (
                                <span
                                  key={object.id}
                                  style={{
                                    backgroundColor: object.color,
                                    transform: `translate(${index * 19 - 34}px, ${(index % 2) * 19 - 9}px) rotate(${index * 23}deg)`,
                                  }}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="artwork-colour-strip" aria-hidden="true">
                        {artwork.objects.slice(0, 6).map(object => (
                          <span
                            key={object.id}
                            style={{ backgroundColor: object.color }}
                          />
                        ))}
                      </div>
                      <div className="artwork-card-main">
                        <div>
                          {editingId === artwork.id ? (
                            <div className="gallery-rename-row">
                              <input
                                aria-label="Artwork name"
                                value={draftTitle}
                                maxLength={48}
                                onChange={event =>
                                  setDraftTitle(event.target.value)
                                }
                                onKeyDown={event => {
                                  if (event.key === "Enter") saveRename();
                                  if (event.key === "Escape")
                                    setEditingId(null);
                                }}
                              />
                              <button
                                className="gallery-rename-save"
                                onClick={saveRename}
                                aria-label="Save new artwork name"
                              >
                                <Check />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3>{artwork.title}</h3>
                              <p>
                                {artwork.objects.length} shape
                                {artwork.objects.length === 1 ? "" : "s"} ·{" "}
                                {new Date(
                                  artwork.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="artwork-card-actions">
                          <button
                            className={`gallery-favorite ${artwork.isFavorite ? "is-favorite" : ""}`}
                            onClick={() => toggleArtworkFavorite(artwork.id)}
                            aria-label={`${artwork.isFavorite ? "Remove" : "Add"} ${artwork.title} ${artwork.isFavorite ? "from" : "to"} best worlds`}
                            aria-pressed={Boolean(artwork.isFavorite)}
                          >
                            <Star
                              aria-hidden="true"
                              fill={
                                artwork.isFavorite ? "currentColor" : "none"
                              }
                            />
                          </button>
                          {editingId !== artwork.id && (
                            <button
                              className="gallery-edit"
                              onClick={() =>
                                startRename(artwork.id, artwork.title)
                              }
                              aria-label={`Rename ${artwork.title}`}
                              title="Rename this world"
                            >
                              <Pencil />
                            </button>
                          )}
                          <button
                            className="gallery-delete"
                            onClick={() => setDeleteCandidate(artwork.id)}
                            aria-label={`Delete ${artwork.title}`}
                            title="Delete this world"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                      <GalleryTagControls
                        artwork={artwork}
                        galleryFolders={galleryFolders}
                        onAssignFolder={assignArtworkFolder}
                        onSetTags={setArtworkTags}
                      />
                      <div className="maker-spotlight-control">
                        {spotlight ? (
                          <>
                            <span>
                              <Sparkles aria-hidden="true" /> Featured as{" "}
                              <b>{spotlight.makerName}</b>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMakerSpotlight(artwork.id)}
                            >
                              Remove feature
                            </button>
                          </>
                        ) : (
                          <form
                            onSubmit={event =>
                              featureArtwork(event, artwork.id)
                            }
                          >
                            <label
                              className="sr-only"
                              htmlFor={`feature-${artwork.id}`}
                            >
                              Maker display name for {artwork.title}
                            </label>
                            <input
                              id={`feature-${artwork.id}`}
                              value={spotlightDrafts[artwork.id] ?? ""}
                              maxLength={32}
                              onChange={event =>
                                setSpotlightDrafts(drafts => ({
                                  ...drafts,
                                  [artwork.id]: event.target.value,
                                }))
                              }
                              placeholder="Maker display name"
                            />
                            <button type="submit">
                              <Sparkles aria-hidden="true" />
                              Feature in Makers
                            </button>
                          </form>
                        )}
                        <small>
                          This stays on this browser until you remove it.
                        </small>
                      </div>
                      <div className="gallery-card-bottom">
                        <button
                          className="download-artwork-button"
                          onClick={() =>
                            downloadArtwork(artwork.title, artwork.objects)
                          }
                        >
                          <Download aria-hidden="true" />
                          Download PNG
                        </button>
                        <button
                          className="open-artwork-button"
                          onClick={() => loadArtwork(artwork.id)}
                        >
                          <FolderOpen aria-hidden="true" />
                          Open and keep making <Check aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
        {deleteCandidate && (
          <div
            className="gallery-confirm"
            role="alertdialog"
            aria-label="Confirm deletion"
          >
            <p>Put this saved world in the bin?</p>
            <div>
              <button
                className="gallery-confirm-cancel"
                onClick={() => setDeleteCandidate(null)}
              >
                Keep it
              </button>
              <button
                className="gallery-confirm-delete"
                onClick={confirmDelete}
              >
                Delete world
              </button>
            </div>
          </div>
        )}
        {folderDeleteCandidate && (
          <div
            className="gallery-confirm"
            role="alertdialog"
            aria-label="Confirm folder removal"
          >
            <p>
              Remove this project folder? Your worlds will stay safe and become
              loose worlds.
            </p>
            <div>
              <button
                className="gallery-confirm-cancel"
                onClick={() => setFolderDeleteCandidate(null)}
              >
                Keep folder
              </button>
              <button
                className="gallery-confirm-delete"
                onClick={() => {
                  deleteGalleryFolder(folderDeleteCandidate);
                  setFolderDeleteCandidate(null);
                  setFolderFilter("all");
                }}
              >
                Remove folder
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
