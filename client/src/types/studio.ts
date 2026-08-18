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
}

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
