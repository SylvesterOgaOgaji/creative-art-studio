import type {
  StudioMaterial,
  StudioObject,
  StudioObjectType,
  Vector3Tuple,
} from "@/types/studio";

export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `studio-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const createObject = (
  type: StudioObjectType,
  count: number
): StudioObject => {
  const column = (count % 3) - 1;
  const row = Math.floor(count / 3);
  return {
    id: makeId(),
    name: `${titleCase(type)} ${count + 1}`,
    type,
    position: [column * 1.35, 0.85, -row * 1.1],
    rotation: [0, count * 0.35, 0],
    scale: [1, 1, 1],
    color: "#FF6B4A",
    material: "matte",
    texture: "plain",
    sticker: "none",
  };
};

export function createSurpriseArrangement(): StudioObject[] {
  const palette = [
    "#FF6B4A",
    "#4666E9",
    "#4EB69D",
    "#F6C945",
    "#C85A91",
    "#72BFE8",
  ];
  const types: StudioObjectType[] = [
    "torus",
    "sphere",
    "cone",
    "cube",
    "cylinder",
    "sphere",
    "torus",
  ];
  const anchors: Vector3Tuple[] = [
    [-1.9, 0.9, 0.3],
    [-0.75, 1.5, -0.4],
    [0.55, 0.75, 0.1],
    [1.85, 1.15, -0.35],
    [0.05, 2.25, -0.9],
    [-1.25, 0.6, -1.25],
    [1.35, 0.55, -1.4],
  ];
  const materials: StudioMaterial[] = [
    "matte",
    "glossy",
    "metallic",
    "neon",
    "matte",
    "glossy",
    "metallic",
  ];
  return types.map((type, index) => {
    const wobble = () => (Math.random() - 0.5) * 0.32;
    const size = 0.72 + Math.random() * 0.72;
    return {
      id: makeId(),
      name: `${titleCase(type)} spark ${index + 1}`,
      type,
      position: [
        anchors[index][0] + wobble(),
        anchors[index][1] + wobble(),
        anchors[index][2] + wobble(),
      ] as Vector3Tuple,
      rotation: [
        Math.random() * 1.1,
        Math.random() * Math.PI,
        Math.random() * 0.8,
      ] as Vector3Tuple,
      scale: [size, size * (0.85 + Math.random() * 0.35), size] as Vector3Tuple,
      color: palette[index % palette.length],
      material: materials[index],
      texture: index % 3 === 0 ? "dots" : index % 3 === 1 ? "stripes" : "plain",
      sticker: index % 3 === 0 ? "star" : "none",
    };
  });
}
