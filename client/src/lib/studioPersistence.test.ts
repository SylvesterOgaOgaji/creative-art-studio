import { describe, expect, it } from "vitest";
import { parsePersistedStudioState } from "./studioPersistence";

describe("parsePersistedStudioState", () => {
  it("keeps earlier saved objects compatible by defaulting later texture fields", () => {
    const result = parsePersistedStudioState({
      objects: [
        {
          id: "cube-1",
          name: "Cube 1",
          type: "cube",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: "#FF6B4A",
          material: "matte",
        },
      ],
    });

    expect(result.objects?.[0]).toMatchObject({
      texture: "plain",
      sticker: "none",
    });
  });

  it("rejects a payload when a nested shape no longer matches the creative model", () => {
    const result = parsePersistedStudioState({
      objects: [
        {
          id: "cube-1",
          name: "Cube 1",
          type: "cube",
          position: [0, "bad", 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: "#FF6B4A",
          material: "matte",
        },
      ],
    });

    expect(result).toEqual({});
  });
});
