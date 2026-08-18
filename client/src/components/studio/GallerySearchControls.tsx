/** Playful Atelier design reminder: gallery filters should feel like simple labels on a maker's project shelf. */
import { Search, Star } from "lucide-react";

interface GallerySearchControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (next: boolean) => void;
  favoriteCount: number;
}

export default function GallerySearchControls({
  search,
  onSearchChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  favoriteCount,
}: GallerySearchControlsProps) {
  return (
    <div className="gallery-filter-row">
      <label className="gallery-search">
        <Search aria-hidden="true" />
        <span className="sr-only">
          Search saved artwork by name, folder, or tag
        </span>
        <input
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Find by name, folder, or tag"
        />
      </label>
      <button
        className={`favorite-filter ${favoritesOnly ? "is-active" : ""}`}
        onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        aria-pressed={favoritesOnly}
      >
        <Star
          aria-hidden="true"
          fill={favoritesOnly ? "currentColor" : "none"}
        />
        Best worlds {favoriteCount > 0 && <span>{favoriteCount}</span>}
      </button>
    </div>
  );
}
