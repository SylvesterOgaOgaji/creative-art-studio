import type {
  ClassroomStarterTheme,
  StudioEnvironment,
  StudioLighting,
  StudioObject,
} from "@/types/studio";
import { makeStudioId } from "./studioHelpers";

type ClassroomStarter = {
  title: string;
  lighting: StudioLighting;
  environment: StudioEnvironment;
  objects: StudioObject[];
};

/** Pre-built, browser-local scenes stay separate from editing state so themes can grow safely. */
export function getClassroomStarter(
  theme: ClassroomStarterTheme
): ClassroomStarter {
  const starters: Record<ClassroomStarterTheme, ClassroomStarter> = {
    garden: {
      title: "Our tiny future garden",
      lighting: "daylight",
      environment: "atelier",
      objects: [
        {
          id: makeStudioId(),
          name: "Garden ground",
          type: "cube",
          position: [0, 0.22, 0],
          rotation: [0, 0.08, 0],
          scale: [1.9, 0.34, 1.5],
          color: "#4EB69D",
          material: "matte",
          texture: "dots",
          sticker: "none",
        },
        {
          id: makeStudioId(),
          name: "Story tower",
          type: "cylinder",
          position: [-0.76, 1.02, 0.16],
          rotation: [0, 0.18, 0],
          scale: [0.42, 0.8, 0.42],
          color: "#4666E9",
          material: "glossy",
          texture: "plain",
          sticker: "star",
        },
        {
          id: makeStudioId(),
          name: "Tree crown",
          type: "sphere",
          position: [0.64, 1.5, -0.08],
          rotation: [0, 0.25, 0],
          scale: [0.76, 0.76, 0.76],
          color: "#F6C945",
          material: "matte",
          texture: "checkerboard",
          sticker: "smile",
        },
        {
          id: makeStudioId(),
          name: "Idea flag",
          type: "cone",
          position: [0.08, 1.08, 0.7],
          rotation: [0.2, 0.55, 0],
          scale: [0.5, 0.68, 0.5],
          color: "#FF6B4A",
          material: "neon",
          texture: "glitter",
          sticker: "heart",
        },
      ],
    },
    space: {
      title: "Our friendly space station",
      lighting: "neon",
      environment: "space",
      objects: [
        {
          id: makeStudioId(),
          name: "Launch pad",
          type: "cylinder",
          position: [0, 0.24, 0],
          rotation: [0, 0.1, 0],
          scale: [1.55, 0.34, 1.55],
          color: "#4666E9",
          material: "metallic",
          texture: "checkerboard",
          sticker: "none",
        },
        {
          id: makeStudioId(),
          name: "Orbit friend",
          type: "sphere",
          position: [-0.82, 1.16, 0.08],
          rotation: [0, 0.2, 0],
          scale: [0.65, 0.65, 0.65],
          color: "#F6C945",
          material: "glossy",
          texture: "plain",
          sticker: "smile",
        },
        {
          id: makeStudioId(),
          name: "Signal hoop",
          type: "torus",
          position: [0.68, 1.3, -0.2],
          rotation: [0.45, 0.2, 0.24],
          scale: [0.75, 0.75, 0.75],
          color: "#C85A91",
          material: "neon",
          texture: "glitter",
          sticker: "star",
        },
        {
          id: makeStudioId(),
          name: "Idea comet",
          type: "cone",
          position: [0.04, 1.68, 0.58],
          rotation: [0.55, 0.15, 0.38],
          scale: [0.48, 0.78, 0.48],
          color: "#72BFE8",
          material: "metallic",
          texture: "stripes",
          sticker: "heart",
        },
      ],
    },
    underwater: {
      title: "Our underwater discovery lab",
      lighting: "daylight",
      environment: "underwater",
      objects: [
        {
          id: makeStudioId(),
          name: "Sea floor",
          type: "cube",
          position: [0, 0.2, 0],
          rotation: [0, -0.1, 0],
          scale: [1.95, 0.3, 1.55],
          color: "#4EB69D",
          material: "matte",
          texture: "dots",
          sticker: "none",
        },
        {
          id: makeStudioId(),
          name: "Bubble home",
          type: "sphere",
          position: [-0.67, 1.12, 0.15],
          rotation: [0, 0.25, 0],
          scale: [0.7, 0.7, 0.7],
          color: "#72BFE8",
          material: "glossy",
          texture: "glitter",
          sticker: "smile",
        },
        {
          id: makeStudioId(),
          name: "Coral tower",
          type: "cone",
          position: [0.66, 1.06, -0.14],
          rotation: [0, -0.24, 0],
          scale: [0.62, 0.85, 0.62],
          color: "#FF6B4A",
          material: "matte",
          texture: "stripes",
          sticker: "heart",
        },
        {
          id: makeStudioId(),
          name: "Treasure ring",
          type: "torus",
          position: [0.1, 1.62, 0.58],
          rotation: [0.44, 0.1, -0.12],
          scale: [0.63, 0.63, 0.63],
          color: "#F6C945",
          material: "metallic",
          texture: "checkerboard",
          sticker: "star",
        },
      ],
    },
  };
  return starters[theme];
}
