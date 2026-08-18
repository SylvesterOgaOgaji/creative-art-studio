/**
 * Playful Atelier design reminder: saved work should feel personal and real, using
 * browser-local folders and tags that help young makers revisit their own worlds.
 */
import {
  Check,
  Download,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  collectGalleryTags,
  createFolderLookup,
  filterGalleryArtworks,
} from "@/lib/galleryOrganization";
import { exportSavedArtworkImage } from "@/lib/studioImage";
import { useStudioStore } from "@/store/useStudioStore";
import GallerySearchControls from "./GallerySearchControls";

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
  const [folderDraft, setFolderDraft] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [spotlightDrafts, setSpotlightDrafts] = useState<
    Record<string, string>
  >({});
  const folderById = useMemo(
    () => createFolderLookup(galleryFolders),
    [galleryFolders]
  );
  const allTags = useMemo(
    () => collectGalleryTags(savedArtworks),
    [savedArtworks]
  );
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
  const saveFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingFolderId) renameGalleryFolder(editingFolderId, folderDraft);
    else {
      const createdId = createGalleryFolder(folderDraft);
      if (createdId) setFolderFilter(createdId);
    }
    setFolderDraft("");
    setEditingFolderId(null);
  };
  const startFolderRename = (id: string) => {
    const folder = folderById.get(id);
    if (!folder) return;
    setEditingFolderId(id);
    setFolderDraft(folder.name);
  };
  const addTag = (
    event: FormEvent<HTMLFormElement>,
    artworkId: string,
    currentTags: string[]
  ) => {
    event.preventDefault();
    const value = tagDrafts[artworkId] ?? "";
    if (!value.trim()) return;
    setArtworkTags(artworkId, [...currentTags, value]);
    setTagDrafts(drafts => ({ ...drafts, [artworkId]: "" }));
  };
  const removeTag = (artworkId: string, tags: string[], tag: string) =>
    setArtworkTags(
      artworkId,
      tags.filter(entry => entry !== tag)
    );
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
            <section
              className="gallery-organizer"
              aria-labelledby="organizer-title"
            >
              <div className="gallery-organizer-heading">
                <div>
                  <span className="eyebrow">Project shelf</span>
                  <h3 id="organizer-title">Folders and tags</h3>
                </div>
                <FolderPlus aria-hidden="true" />
              </div>
              <form className="folder-create-row" onSubmit={saveFolder}>
                <label className="sr-only" htmlFor="gallery-folder-name">
                  {editingFolderId
                    ? "Rename project folder"
                    : "New project folder"}
                </label>
                <input
                  id="gallery-folder-name"
                  value={folderDraft}
                  maxLength={24}
                  onChange={event => setFolderDraft(event.target.value)}
                  placeholder={
                    editingFolderId
                      ? "Rename this folder"
                      : "New project folder"
                  }
                />
                <button type="submit">
                  {editingFolderId ? (
                    "Save"
                  ) : (
                    <>
                      <Plus aria-hidden="true" />
                      Add folder
                    </>
                  )}
                </button>
                {editingFolderId && (
                  <button
                    className="folder-cancel"
                    type="button"
                    onClick={() => {
                      setEditingFolderId(null);
                      setFolderDraft("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
              <div
                className="folder-filter-row"
                aria-label="Filter gallery by folder"
              >
                <button
                  className={`gallery-filter-chip ${folderFilter === "all" ? "is-active" : ""}`}
                  onClick={() => setFolderFilter("all")}
                  aria-pressed={folderFilter === "all"}
                >
                  All worlds
                </button>
                <button
                  className={`gallery-filter-chip ${folderFilter === "loose" ? "is-active" : ""}`}
                  onClick={() => setFolderFilter("loose")}
                  aria-pressed={folderFilter === "loose"}
                >
                  Loose
                </button>
                {galleryFolders.map(folder => (
                  <span className="folder-filter-group" key={folder.id}>
                    <button
                      className={`gallery-filter-chip ${folderFilter === folder.id ? "is-active" : ""}`}
                      onClick={() => setFolderFilter(folder.id)}
                      aria-pressed={folderFilter === folder.id}
                    >
                      <FolderClosed aria-hidden="true" />
                      {folder.name}
                    </button>
                    <button
                      className="folder-mini-action"
                      onClick={() => startFolderRename(folder.id)}
                      aria-label={`Rename ${folder.name}`}
                    >
                      <Pencil aria-hidden="true" />
                    </button>
                    <button
                      className="folder-mini-action delete"
                      onClick={() => setFolderDeleteCandidate(folder.id)}
                      aria-label={`Remove ${folder.name}`}
                    >
                      <X aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
              {allTags.length > 0 && (
                <div
                  className="tag-filter-row"
                  aria-label="Filter gallery by tag"
                >
                  <Tag aria-hidden="true" />
                  <button
                    className={`gallery-tag-filter ${tagFilter === "all" ? "is-active" : ""}`}
                    onClick={() => setTagFilter("all")}
                    aria-pressed={tagFilter === "all"}
                  >
                    Every tag
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`gallery-tag-filter ${tagFilter === tag ? "is-active" : ""}`}
                      onClick={() => setTagFilter(tag)}
                      aria-pressed={tagFilter === tag}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </section>
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
                  const artworkTags = artwork.tags ?? [];
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
                      <div className="artwork-organization">
                        <label className="artwork-folder-picker">
                          <FolderClosed aria-hidden="true" />
                          <span className="sr-only">
                            Place {artwork.title} in a project folder
                          </span>
                          <select
                            value={artwork.folderId ?? ""}
                            onChange={event =>
                              assignArtworkFolder(
                                artwork.id,
                                event.target.value || null
                              )
                            }
                          >
                            <option value="">Loose world</option>
                            {galleryFolders.map(folder => (
                              <option key={folder.id} value={folder.id}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div
                          className="artwork-tag-list"
                          aria-label={`${artwork.title} tags`}
                        >
                          {artworkTags.map(tag => (
                            <button
                              key={tag}
                              className="artwork-tag"
                              onClick={() =>
                                removeTag(artwork.id, artworkTags, tag)
                              }
                              aria-label={`Remove tag ${tag} from ${artwork.title}`}
                            >
                              #{tag}
                              <X aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                        <form
                          className="tag-add-form"
                          onSubmit={event =>
                            addTag(event, artwork.id, artworkTags)
                          }
                        >
                          <label
                            className="sr-only"
                            htmlFor={`tag-${artwork.id}`}
                          >
                            Add a tag to {artwork.title}
                          </label>
                          <input
                            id={`tag-${artwork.id}`}
                            value={tagDrafts[artwork.id] ?? ""}
                            maxLength={18}
                            onChange={event =>
                              setTagDrafts(drafts => ({
                                ...drafts,
                                [artwork.id]: event.target.value,
                              }))
                            }
                            placeholder="Add tag"
                          />
                          <button
                            type="submit"
                            aria-label={`Add tag to ${artwork.title}`}
                          >
                            <Plus aria-hidden="true" />
                          </button>
                        </form>
                      </div>
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
