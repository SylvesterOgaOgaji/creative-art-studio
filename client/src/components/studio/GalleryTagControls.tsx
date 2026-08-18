/** Playful Atelier reminder: tags and folders should help makers find work without adding complexity. */
import { FolderClosed, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { GalleryFolder, SavedArtwork } from "@/types/studio";

type GalleryTagControlsProps = {
  artwork: SavedArtwork;
  galleryFolders: GalleryFolder[];
  onAssignFolder: (artworkId: string, folderId: string | null) => void;
  onSetTags: (artworkId: string, tags: string[]) => void;
};

export default function GalleryTagControls({
  artwork,
  galleryFolders,
  onAssignFolder,
  onSetTags,
}: GalleryTagControlsProps) {
  const [tagDraft, setTagDraft] = useState("");
  const artworkTags = artwork.tags ?? [];
  const addTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tagDraft.trim()) return;
    onSetTags(artwork.id, [...artworkTags, tagDraft]);
    setTagDraft("");
  };

  return (
    <div className="artwork-organization">
      <label className="artwork-folder-picker">
        <FolderClosed aria-hidden="true" />
        <span className="sr-only">
          Place {artwork.title} in a project folder
        </span>
        <select
          value={artwork.folderId ?? ""}
          onChange={event =>
            onAssignFolder(artwork.id, event.target.value || null)
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
      <div className="artwork-tag-list" aria-label={`${artwork.title} tags`}>
        {artworkTags.map(tag => (
          <button
            key={tag}
            className="artwork-tag"
            onClick={() =>
              onSetTags(
                artwork.id,
                artworkTags.filter(entry => entry !== tag)
              )
            }
            aria-label={`Remove tag ${tag} from ${artwork.title}`}
          >
            #{tag}
            <X aria-hidden="true" />
          </button>
        ))}
      </div>
      <form className="tag-add-form" onSubmit={addTag}>
        <label className="sr-only" htmlFor={`tag-${artwork.id}`}>
          Add a tag to {artwork.title}
        </label>
        <input
          id={`tag-${artwork.id}`}
          value={tagDraft}
          maxLength={18}
          onChange={event => setTagDraft(event.target.value)}
          placeholder="Add tag"
        />
        <button type="submit" aria-label={`Add tag to ${artwork.title}`}>
          <Plus aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
