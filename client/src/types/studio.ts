/**
 * Playful Atelier design reminder: keep the creative engine typed, simple, and ready
 * for future persistence/gallery work without exposing unnecessary complexity today.
 */
export const objectTypes = ["cube", "sphere", "cone", "cylinder", "torus"] as const;

export type StudioObjectType = (typeof objectTypes)[number];
export type StudioMaterial = "matte" | "glossy" | "metallic" | "neon";
export type StudioLighting = "daylight" | "neon";
export type StudioEnvironment = "atelier" | "space" | "underwater";
export type TransformMode = "translate" | "rotate" | "scale";
export type TutorialStep = "welcome" | "add" | "move" | "colour" | "done";
export type StudioTexture = "plain" | "dots" | "stripes" | "checkerboard" | "glitter";
export type StudioSticker = "none" | "star" | "heart" | "smile";
export type StudioAgeMode = "explorer" | "creator" | "designer";
export type ClassroomStarterTheme = "garden" | "space" | "underwater";
export type SessionDuration = "quick" | "standard" | "extended";
export type Vector3Tuple = [number, number, number];

export interface StudioObject {
  id: string;
  name: string;
  type: StudioObjectType;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  color: string;
  material: StudioMaterial;
  texture: StudioTexture;
  sticker: StudioSticker;
}

export interface SavedArtwork {
  id: string;
  title: string;
  createdAt: string;
  objects: StudioObject[];
  lighting?: StudioLighting;
  environment?: StudioEnvironment;
  thumbnailDataUrl?: string;
  isFavorite?: boolean;
  folderId?: string;
  tags?: string[];
}

export interface GalleryFolder {
  id: string;
  name: string;
  createdAt: string;
}

/** A locally chosen, consent-based showcase label for a saved artwork. */
export interface MakerSpotlight {
  artworkId: string;
  makerName: string;
  note?: string;
}

/** A single short, browser-local reflection with no title, name, or scene data attached. */
export interface SessionReflection {
  id: string;
  createdAt: string;
  promptId: string;
  answer: string;
  objectCount: number;
}

export const ageModeDetails: Record<StudioAgeMode, { label: string; ageRange: string; description: string }> = {
  explorer: { label: "Explorer", ageRange: "Ages 3–6", description: "Big, simple choices for curious first makers." },
  creator: { label: "Creator", ageRange: "Ages 7–11", description: "More shapes, materials, light, and playful scene choices." },
  designer: { label: "Designer", ageRange: "Ages 12–16", description: "Fine controls, patterns, groups, and detailed compositions." },
};

export const classroomStarterDetails: Record<ClassroomStarterTheme, { label: string; title: string; brief: string; seedNote: string; shapeCount: number }> = {
  garden: { label: "Future garden", title: "Build a tiny future garden.", brief: "Design one corner of a garden where something good can grow.", seedNote: "A ground, a story tower, a tree crown, and an idea flag are ready to remix.", shapeCount: 4 },
  space: { label: "Friendly space station", title: "Build a friendly space station.", brief: "Design a small station that helps explorers feel safe, curious, and welcome.", seedNote: "A launch pad, orbit friend, signal hoop, and idea comet are ready to remix.", shapeCount: 4 },
  underwater: { label: "Underwater discovery lab", title: "Build an underwater discovery lab.", brief: "Design a bright underwater place where a new discovery can be shared.", seedNote: "A sea floor, bubble home, coral tower, and treasure ring are ready to remix.", shapeCount: 4 },
};

export const sessionDurationDetails: Record<SessionDuration, { label: string; minutes: number; description: string; flow: Array<{ time: string; title: string; description: string }> }> = {
  quick: { label: "Quick spark", minutes: 20, description: "A short creative reset that ends with one clear reflection.", flow: [{ time: "3 min", title: "Notice", description: "Show one shape and ask what it could become." }, { time: "9 min", title: "Build", description: "Open a starter, add one new idea, and give it a purposeful colour." }, { time: "5 min", title: "Shape", description: "Move or stretch one object to make the story clearer." }, { time: "3 min", title: "Reflect", description: "Name one choice to keep or try again." }] },
  standard: { label: "Studio session", minutes: 35, description: "Enough time to build a small world, refine it, and share an idea.", flow: [{ time: "5 min", title: "Notice", description: "Show one shape and ask what it could become." }, { time: "14 min", title: "Build", description: "Open a starter, add three ideas, and give each one a purposeful colour." }, { time: "8 min", title: "Refine", description: "Move, turn, or stretch a shape so the scene tells a clearer story." }, { time: "5 min", title: "Share", description: "Use local gallery previews for a device-side gallery walk." }, { time: "3 min", title: "Reflect", description: "Name one creative choice to keep or change." }] },
  extended: { label: "Full studio", minutes: 45, description: "A complete making cycle with room for experimentation and peer conversation.", flow: [{ time: "5 min", title: "Notice", description: "Show one shape and ask: what could this become?" }, { time: "15 min", title: "Build", description: "Open a starter, add three ideas, and give each one a purposeful colour." }, { time: "10 min", title: "Refine", description: "Move, turn, or stretch a shape so the scene tells a clearer story." }, { time: "10 min", title: "Share", description: "Use local gallery previews for a device-side gallery walk, or download PNGs with consent." }, { time: "5 min", title: "Reflect", description: "Invite each learner to name one creative choice they would keep or change." }] },
};

export const studioColors = [
  { name: "Persimmon", value: "#FF6B4A" },
  { name: "Cobalt", value: "#4666E9" },
  { name: "Sea glass", value: "#4EB69D" },
  { name: "Sunny", value: "#F6C945" },
  { name: "Berry", value: "#C85A91" },
  { name: "Sky", value: "#72BFE8" },
  { name: "Ink", value: "#293146" },
  { name: "Cloud", value: "#F5EFE3" },
] as const;

export const materialDetails: Record<
  StudioMaterial,
  { label: string; description: string; swatch: string }
> = {
  matte: { label: "Matte", description: "Soft & chalky", swatch: "#EDE6D9" },
  glossy: { label: "Glossy", description: "Smooth & bright", swatch: "#BFE2F8" },
  metallic: { label: "Metallic", description: "Shiny & strong", swatch: "#9FA8B8" },
  neon: { label: "Neon", description: "Glows gently", swatch: "#FFEA70" },
};

export const textureDetails: Record<StudioTexture, { label: string; description: string }> = {
  plain: { label: "Plain", description: "Smooth colour" },
  dots: { label: "Dots", description: "Bouncy spots" },
  stripes: { label: "Stripes", description: "Bold bands" },
  checkerboard: { label: "Checks", description: "Playful tiles" },
  glitter: { label: "Glitter", description: "Tiny sparkles" },
};

export const environmentDetails: Record<StudioEnvironment, { label: string; description: string }> = {
  atelier: { label: "Atelier", description: "Warm maker table" },
  space: { label: "Space", description: "Stars & planets" },
  underwater: { label: "Underwater", description: "Bubbly blue world" },
};

export const stickerDetails: Record<StudioSticker, { label: string; mark: string }> = {
  none: { label: "None", mark: "−" },
  star: { label: "Star", mark: "✦" },
  heart: { label: "Heart", mark: "♥" },
  smile: { label: "Smile", mark: "●" },
};
