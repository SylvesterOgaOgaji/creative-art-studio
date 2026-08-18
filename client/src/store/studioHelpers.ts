import type { StudioObject, Vector3Tuple } from "@/types/studio";

export const makeStudioId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const cloneStudioObject = (object: StudioObject): StudioObject => ({
  ...object,
  position: [...object.position] as Vector3Tuple,
  rotation: [...object.rotation] as Vector3Tuple,
  scale: [...object.scale] as Vector3Tuple,
});
