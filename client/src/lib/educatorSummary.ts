/**
 * Privacy-first educator export: this helper serializes aggregate studio usage only.
 * It intentionally excludes project titles, gallery labels, display names, images, object positions, and raw scenes.
 */
import type {
  MakerSpotlight,
  SavedArtwork,
  StudioAgeMode,
  StudioEnvironment,
  StudioLighting,
  StudioMaterial,
  StudioObject,
  StudioObjectType,
} from "@/types/studio";

type EducatorSummaryInput = {
  savedArtworks: SavedArtwork[];
  galleryFolderCount: number;
  makerSpotlights: MakerSpotlight[];
  currentObjects: StudioObject[];
  lighting: StudioLighting;
  environment: StudioEnvironment;
  ageMode: StudioAgeMode;
};

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }),
    {} as Record<T, number>
  );
}

export function createAnonymizedProjectSummary(input: EducatorSummaryInput) {
  const allSavedObjects = input.savedArtworks.flatMap(
    artwork => artwork.objects
  );
  const tagAssignmentCount = input.savedArtworks.reduce(
    (total, artwork) => total + (artwork.tags?.length ?? 0),
    0
  );
  return {
    schema: "creative-art-studio.educator-summary.v1",
    generatedAt: new Date().toISOString(),
    privacy: {
      level: "aggregate-only",
      omitted: [
        "artwork titles",
        "maker display names",
        "folder names",
        "tag labels",
        "thumbnail images",
        "object coordinates",
        "raw scene data",
      ],
    },
    savedCollection: {
      worldCount: input.savedArtworks.length,
      favoriteWorldCount: input.savedArtworks.filter(
        artwork => artwork.isFavorite
      ).length,
      folderCount: input.galleryFolderCount,
      tagAssignmentCount,
      featuredWorldCount: input.makerSpotlights.length,
      totalObjectCount: allSavedObjects.length,
    },
    creativeMakeup: {
      objectTypes: countBy<StudioObjectType>(
        allSavedObjects.map(object => object.type)
      ),
      materials: countBy<StudioMaterial>(
        allSavedObjects.map(object => object.material)
      ),
      lightingPresets: countBy<StudioLighting>(
        input.savedArtworks.map(artwork => artwork.lighting ?? "daylight")
      ),
      environments: countBy<StudioEnvironment>(
        input.savedArtworks.map(artwork => artwork.environment ?? "atelier")
      ),
    },
    currentStage: {
      objectCount: input.currentObjects.length,
      lighting: input.lighting,
      environment: input.environment,
      ageMode: input.ageMode,
    },
  };
}

export function exportAnonymizedProjectSummary(input: EducatorSummaryInput) {
  const summary = createAnonymizedProjectSummary(input);
  const blob = new Blob([JSON.stringify(summary, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `creative-art-studio-anonymized-summary-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return summary;
}
