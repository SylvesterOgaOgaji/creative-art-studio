import { describe, expect, it } from "vitest";
import {
  createActivityChartData,
  getReportActivityEntries,
  summarizeActivity,
  type StudioActivityEntry,
} from "./studioActivity";

const entry = (
  overrides: Partial<StudioActivityEntry> = {}
): StudioActivityEntry => ({
  id: "activity-1",
  type: "save",
  createdAt: "2026-08-18T10:00:00.000Z",
  objectCount: 3,
  ageMode: "creator",
  environment: "atelier",
  lighting: "daylight",
  sessionDuration: "standard",
  ...overrides,
});

describe("studio activity history", () => {
  it("groups real saves and reflections into a complete daily chart window", () => {
    const points = createActivityChartData(
      [
        entry(),
        entry({
          id: "activity-2",
          type: "reflection",
          createdAt: "2026-08-18T11:00:00.000Z",
        }),
      ],
      new Date("2026-08-18T12:00:00.000Z"),
      3
    );

    expect(points).toHaveLength(3);
    expect(points.at(-1)).toMatchObject({
      date: "2026-08-18",
      saves: 1,
      reflections: 1,
      total: 2,
    });
    expect(points[0].total).toBe(0);
  });

  it("backfills saved worlds from older versions without inventing timestamps", () => {
    const entries = getReportActivityEntries(
      [entry({ sourceId: "existing-artwork" })],
      [
        {
          id: "existing-artwork",
          title: "Existing",
          createdAt: "2026-08-17T09:00:00.000Z",
          objects: [],
        },
        {
          id: "legacy-artwork",
          title: "Legacy",
          createdAt: "2026-08-16T09:00:00.000Z",
          objects: [{ id: "object", type: "cube" } as never],
        },
      ],
      { ageMode: "creator", sessionDuration: "standard" }
    );

    expect(entries.map(item => item.sourceId)).toEqual([
      "existing-artwork",
      "legacy-artwork",
    ]);
    expect(
      entries.find(item => item.sourceId === "legacy-artwork")?.createdAt
    ).toBe("2026-08-16T09:00:00.000Z");
  });

  it("summarizes aggregate counts without exposing artwork content", () => {
    const summary = summarizeActivity([
      entry(),
      entry({
        id: "activity-2",
        type: "reflection",
        createdAt: "2026-08-17T10:00:00.000Z",
        objectCount: 5,
      }),
    ]);

    expect(summary).toEqual({
      totalEvents: 2,
      saveCount: 1,
      reflectionCount: 1,
      activeDays: 2,
      totalObjectsCreated: 3,
      latestActivityAt: "2026-08-18T10:00:00.000Z",
    });
    expect(summary).not.toHaveProperty("title");
    expect(summary).not.toHaveProperty("answer");
  });
});
