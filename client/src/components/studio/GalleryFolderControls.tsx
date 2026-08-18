/** Playful Atelier reminder: project organisation stays simple, visible, and browser-local. */
import { FolderClosed, FolderPlus, Pencil, Plus, Tag, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  collectGalleryTags,
  createFolderLookup,
} from "@/lib/galleryOrganization";
import type { GalleryFolder, SavedArtwork } from "@/types/studio";

type GalleryFolderControlsProps = {
  artworks: SavedArtwork[];
  galleryFolders: GalleryFolder[];
  folderFilter: string;
  tagFilter: string;
  onFolderFilterChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
  onCreateFolder: (name: string) => string | null;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolderRequest: (id: string) => void;
};

export default function GalleryFolderControls({
  artworks,
  galleryFolders,
  folderFilter,
  tagFilter,
  onFolderFilterChange,
  onTagFilterChange,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolderRequest,
}: GalleryFolderControlsProps) {
  const [folderDraft, setFolderDraft] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const folderById = useMemo(
    () => createFolderLookup(galleryFolders),
    [galleryFolders]
  );
  const allTags = useMemo(() => collectGalleryTags(artworks), [artworks]);

  const saveFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingFolderId) onRenameFolder(editingFolderId, folderDraft);
    else {
      const createdId = onCreateFolder(folderDraft);
      if (createdId) onFolderFilterChange(createdId);
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

  return (
    <section className="gallery-organizer" aria-labelledby="organizer-title">
      <div className="gallery-organizer-heading">
        <div>
          <span className="eyebrow">Project shelf</span>
          <h3 id="organizer-title">Folders and tags</h3>
        </div>
        <FolderPlus aria-hidden="true" />
      </div>
      <form className="folder-create-row" onSubmit={saveFolder}>
        <label className="sr-only" htmlFor="gallery-folder-name">
          {editingFolderId ? "Rename project folder" : "New project folder"}
        </label>
        <input
          id="gallery-folder-name"
          value={folderDraft}
          maxLength={24}
          onChange={event => setFolderDraft(event.target.value)}
          placeholder={
            editingFolderId ? "Rename this folder" : "New project folder"
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
      <div className="folder-filter-row" aria-label="Filter gallery by folder">
        <button
          className={`gallery-filter-chip ${folderFilter === "all" ? "is-active" : ""}`}
          onClick={() => onFolderFilterChange("all")}
          aria-pressed={folderFilter === "all"}
        >
          All worlds
        </button>
        <button
          className={`gallery-filter-chip ${folderFilter === "loose" ? "is-active" : ""}`}
          onClick={() => onFolderFilterChange("loose")}
          aria-pressed={folderFilter === "loose"}
        >
          Loose
        </button>
        {galleryFolders.map(folder => (
          <span className="folder-filter-group" key={folder.id}>
            <button
              className={`gallery-filter-chip ${folderFilter === folder.id ? "is-active" : ""}`}
              onClick={() => onFolderFilterChange(folder.id)}
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
              onClick={() => onDeleteFolderRequest(folder.id)}
              aria-label={`Remove ${folder.name}`}
            >
              <X aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      {allTags.length > 0 && (
        <div className="tag-filter-row" aria-label="Filter gallery by tag">
          <Tag aria-hidden="true" />
          <button
            className={`gallery-tag-filter ${tagFilter === "all" ? "is-active" : ""}`}
            onClick={() => onTagFilterChange("all")}
            aria-pressed={tagFilter === "all"}
          >
            Every tag
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`gallery-tag-filter ${tagFilter === tag ? "is-active" : ""}`}
              onClick={() => onTagFilterChange(tag)}
              aria-pressed={tagFilter === tag}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
