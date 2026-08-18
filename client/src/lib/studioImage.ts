/** Playful Atelier export helper: preserve a clean, warm record of the maker's current 3D stage. */
import type { StudioObject } from "@/types/studio";
function getStudioCanvas() {
  return document.querySelector<HTMLCanvasElement>("#creative-art-canvas");
}

function drawScenePoster(objects: StudioObject[], width: number, height: number) {
  const image = document.createElement("canvas");
  image.width = width;
  image.height = height;
  const context = image.getContext("2d");
  if (!context) return null;

  const wash = context.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, "#fffaf1");
  wash.addColorStop(.52, "#f7ecd9");
  wash.addColorStop(1, "#dfeaea");
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(70, 102, 233, .12)";
  context.beginPath();
  context.arc(width * .52, height * .68, width * .42, 0, Math.PI * 2);
  context.fill();

  objects.slice().sort((a, b) => a.position[2] - b.position[2]).forEach((object) => {
    const size = Math.max(24, Math.min(88, 43 * ((object.scale[0] + object.scale[1]) / 2)));
    const x = width * .5 + object.position[0] * width * .085;
    const y = height * .66 - object.position[1] * height * .12 + object.position[2] * height * .028;
    context.save();
    context.translate(x, y);
    context.rotate(object.rotation[2] || object.rotation[1] * .18);
    context.shadowColor = "rgba(41, 49, 70, .2)";
    context.shadowBlur = 9;
    context.shadowOffsetY = 6;
    context.fillStyle = object.color;
    context.strokeStyle = "rgba(255, 250, 239, .9)";
    context.lineWidth = Math.max(2, size * .045);
    if (object.type === "sphere") { context.beginPath(); context.arc(0, 0, size * .5, 0, Math.PI * 2); context.fill(); context.stroke(); }
    if (object.type === "cube") { context.fillRect(-size * .44, -size * .44, size * .88, size * .88); context.strokeRect(-size * .44, -size * .44, size * .88, size * .88); }
    if (object.type === "cone") { context.beginPath(); context.moveTo(0, -size * .58); context.lineTo(size * .54, size * .5); context.lineTo(-size * .54, size * .5); context.closePath(); context.fill(); context.stroke(); }
    if (object.type === "cylinder") { context.beginPath(); context.roundRect(-size * .38, -size * .55, size * .76, size * 1.1, size * .2); context.fill(); context.stroke(); }
    if (object.type === "torus") { context.beginPath(); context.arc(0, 0, size * .44, 0, Math.PI * 2); context.strokeStyle = object.color; context.lineWidth = size * .25; context.stroke(); context.strokeStyle = "rgba(255,250,239,.8)"; context.lineWidth = 2; context.beginPath(); context.arc(0, 0, size * .56, 0, Math.PI * 2); context.stroke(); }
    if (object.material === "neon") { context.shadowColor = object.color; context.shadowBlur = 22; }
    context.restore();
  });
  return image.toDataURL("image/png");
}

export function captureStudioImage(objects: StudioObject[], width = 640, height = 420) {
  const source = getStudioCanvas();
  if (!source) return drawScenePoster(objects, width, height);

  try {
    const image = document.createElement("canvas");
    image.width = width;
    image.height = height;
    const context = image.getContext("2d");
    if (!context) return drawScenePoster(objects, width, height);
    const wash = context.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, "#fffaf1");
    wash.addColorStop(1, "#f2e6cf");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);
    return image.toDataURL("image/png");
  } catch {
    return drawScenePoster(objects, width, height);
  }
}

function imageFilename(title: string) {
  const stem = (title.trim() || "creative-artwork").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase() || "creative-artwork";
  return `${stem}-creative-art-studio.png`;
}

function downloadPng(dataUrl: string, title: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = imageFilename(title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

export function exportStudioImage(title: string, objects: StudioObject[]) {
  const dataUrl = captureStudioImage(objects, 1600, 1060);
  if (!dataUrl) return false;
  return downloadPng(dataUrl, title);
}

/** Export a saved scene from its structured browser-local object data, not the current live canvas. */
export function exportSavedArtworkImage(title: string, objects: StudioObject[]) {
  const dataUrl = drawScenePoster(objects, 1600, 1060);
  if (!dataUrl) return false;
  return downloadPng(dataUrl, title);
}
