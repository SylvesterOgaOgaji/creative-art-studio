import type {
  SavedArtwork,
  SessionDuration,
  StudioAgeMode,
  StudioEnvironment,
  StudioLighting,
} from "@/types/studio";

export const ACTIVITY_HISTORY_LIMIT = 180;
export const ACTIVITY_WINDOW_DAYS = 14;

export type StudioActivityType = "save" | "reflection";

export interface StudioActivityEntry {
  id: string;
  type: StudioActivityType;
  createdAt: string;
  objectCount: number;
  ageMode: StudioAgeMode;
  environment: StudioEnvironment;
  lighting: StudioLighting;
  sessionDuration: SessionDuration;
  sourceId?: string;
}

export type StudioActivityDraft = Pick<
  StudioActivityEntry,
  "type" | "objectCount" | "sourceId"
>;

export function createStudioActivityEntry(
  draft: StudioActivityDraft,
  context: Pick<
    StudioActivityEntry,
    "ageMode" | "environment" | "lighting" | "sessionDuration"
  >,
  createdAt = new Date().toISOString(),
  id = `activity-${createdAt}-${draft.type}`
): StudioActivityEntry {
  return {
    id,
    type: draft.type,
    createdAt,
    objectCount: draft.objectCount,
    ageMode: context.ageMode,
    environment: context.environment,
    lighting: context.lighting,
    sessionDuration: context.sessionDuration,
    ...(draft.sourceId ? { sourceId: draft.sourceId } : {}),
  };
}

export interface ActivityChartPoint {
  date: string;
  label: string;
  saves: number;
  reflections: number;
  total: number;
}

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const startOfUtcDay = (date: Date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

export function createSavedArtworkActivity(
  artwork: SavedArtwork,
  defaults: Pick<StudioActivityEntry, "ageMode" | "sessionDuration"> &
    Partial<Pick<StudioActivityEntry, "environment" | "lighting">>
): StudioActivityEntry {
  return {
    id: `saved-artwork-${artwork.id}`,
    type: "save",
    createdAt: artwork.createdAt,
    objectCount: artwork.objects.length,
    ageMode: defaults.ageMode,
    environment: artwork.environment ?? defaults.environment ?? "atelier",
    lighting: artwork.lighting ?? defaults.lighting ?? "daylight",
    sessionDuration: defaults.sessionDuration,
    sourceId: artwork.id,
  };
}

/**
 * Combines newly recorded events with historical saved worlds from older
 * versions of the app. Existing artwork timestamps are real activity signals,
 * so this backfill never invents dates or chart points.
 */
export function getReportActivityEntries(
  activityHistory: StudioActivityEntry[],
  savedArtworks: SavedArtwork[],
  defaults: Pick<StudioActivityEntry, "ageMode" | "sessionDuration"> &
    Partial<Pick<StudioActivityEntry, "environment" | "lighting">>
) {
  const recordedSaveIds = new Set(
    activityHistory
      .filter(entry => entry.type === "save" && entry.sourceId)
      .map(entry => entry.sourceId)
  );
  const legacySaves = savedArtworks
    .filter(artwork => !recordedSaveIds.has(artwork.id))
    .map(artwork => createSavedArtworkActivity(artwork, defaults));

  return [...activityHistory, ...legacySaves]
    .filter(entry => isValidDate(entry.createdAt))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, ACTIVITY_HISTORY_LIMIT);
}

export function createActivityChartData(
  entries: StudioActivityEntry[],
  endDate = new Date(),
  windowDays = ACTIVITY_WINDOW_DAYS
): ActivityChartPoint[] {
  const end = startOfUtcDay(endDate);
  const points = Array.from({ length: windowDays }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (windowDays - index - 1));
    return {
      date: dayKey(date),
      label: date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      saves: 0,
      reflections: 0,
      total: 0,
    } satisfies ActivityChartPoint;
  });
  const byDate = new Map(points.map(point => [point.date, point]));

  entries.forEach(entry => {
    const point = byDate.get(dayKey(new Date(entry.createdAt)));
    if (!point) return;
    if (entry.type === "save") point.saves += 1;
    if (entry.type === "reflection") point.reflections += 1;
    point.total += 1;
  });

  return points;
}

export function summarizeActivity(entries: StudioActivityEntry[]) {
  const saves = entries.filter(entry => entry.type === "save");
  const reflections = entries.filter(entry => entry.type === "reflection");
  const activeDays = new Set(
    entries.map(entry => dayKey(new Date(entry.createdAt)))
  );
  const totalObjectsCreated = saves.reduce(
    (total, entry) => total + entry.objectCount,
    0
  );

  return {
    totalEvents: entries.length,
    saveCount: saves.length,
    reflectionCount: reflections.length,
    activeDays: activeDays.size,
    totalObjectsCreated,
    latestActivityAt: entries[0]?.createdAt ?? null,
  };
}
