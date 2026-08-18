import { z } from "zod";

const identifierSchema = z.string().trim().min(1).max(160);
const shortTextSchema = z.string().max(240);
const vectorSchema = z.tuple([
  z.number().finite(),
  z.number().finite(),
  z.number().finite(),
]);
const objectSchema = z.object({
  id: identifierSchema,
  name: shortTextSchema,
  type: z.enum(["cube", "sphere", "cone", "cylinder", "torus"]),
  position: vectorSchema,
  rotation: vectorSchema,
  scale: vectorSchema,
  color: z.string().min(1).max(32),
  material: z.enum(["matte", "glossy", "metallic", "neon"]),
  // Defaults keep saved worlds from earlier studio releases loadable.
  texture: z
    .enum(["plain", "dots", "stripes", "checkerboard", "glitter"])
    .default("plain"),
  sticker: z.enum(["none", "star", "heart", "smile"]).default("none"),
});

const savedArtworkSchema = z.object({
  id: identifierSchema,
  title: shortTextSchema,
  createdAt: z.string().datetime(),
  objects: z.array(objectSchema).max(150),
  lighting: z.enum(["daylight", "neon"]).optional(),
  environment: z.enum(["atelier", "space", "underwater"]).optional(),
  thumbnailDataUrl: z.string().max(5_000_000).optional(),
  isFavorite: z.boolean().optional(),
  folderId: identifierSchema.optional(),
  tags: z.array(shortTextSchema).max(20).optional(),
});

export const persistedStudioStateSchema = z.object({
  artworkTitle: shortTextSchema.optional(),
  objects: z.array(objectSchema).max(150).optional(),
  lighting: z.enum(["daylight", "neon"]).optional(),
  environment: z.enum(["atelier", "space", "underwater"]).optional(),
  ageMode: z.enum(["explorer", "creator", "designer"]).optional(),
  savedArtworks: z.array(savedArtworkSchema).max(100).optional(),
  galleryFolders: z
    .array(
      z.object({
        id: identifierSchema,
        name: shortTextSchema,
        createdAt: z.string().datetime(),
      })
    )
    .max(50)
    .optional(),
  makerSpotlights: z
    .array(
      z.object({
        artworkId: identifierSchema,
        makerName: shortTextSchema,
        note: z.string().max(400).optional(),
      })
    )
    .max(100)
    .optional(),
  tutorialStep: z.enum(["welcome", "add", "move", "colour", "done"]).optional(),
  soundEnabled: z.boolean().optional(),
  soundVolume: z.number().finite().min(0).max(1).optional(),
  challengeIndex: z.number().int().min(0).max(10_000).optional(),
  completedChallengeIds: z.array(z.number().int().min(0)).max(500).optional(),
  sessionDuration: z.enum(["quick", "standard", "extended"]).optional(),
  lastSessionReflection: z
    .object({
      id: identifierSchema,
      createdAt: z.string().datetime(),
      promptId: identifierSchema,
      answer: z.string().max(240),
      objectCount: z.number().int().min(0).max(10_000),
    })
    .nullable()
    .optional(),
});

export type PersistedStudioState = z.output<typeof persistedStudioStateSchema>;

/**
 * Treat browser storage as an untrusted boundary.  Invalid or stale payloads
 * are ignored as a whole so the studio falls back to its safe initial state.
 */
export function parsePersistedStudioState(
  value: unknown
): PersistedStudioState {
  const result = persistedStudioStateSchema.safeParse(value);
  return result.success ? result.data : {};
}
