/**
 * Playful Atelier design reminder: the inspector offers direct, friendly cues while
 * allowing the 3D transform gizmo to remain the primary way to shape selected objects.
 */
import { ArrowDownToLine, Copy, Hand, Layers3, Move3D, Rotate3D, Scaling, Trash2 } from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";
import type { TransformMode, Vector3Tuple } from "@/types/studio";

function rounded(value: number) { return Number(value.toFixed(2)); }
function AxisEditor({ label, values, type, onChange }: { label: string; values: Vector3Tuple; type: "position" | "rotation" | "scale"; onChange: (axis: number, value: number) => void }) {
  const displayValues = type === "rotation" ? values.map((value) => rounded((value * 180) / Math.PI)) : values;
  const limits = type === "position" ? { min: -5, max: 5, step: .1 } : type === "rotation" ? { min: -360, max: 360, step: 5 } : { min: .25, max: 3, step: .05 };
  return <div className="axis-editor"><div className="axis-label-row"><span>{label}</span>{type === "rotation" && <small>degrees</small>}</div><div className="axis-fields">{(["X", "Y", "Z"] as const).map((axis, index) => <label key={axis} className={`axis-field axis-${axis.toLowerCase()}`}><span>{axis}</span><input type="number" min={limits.min} max={limits.max} step={limits.step} value={displayValues[index]} onChange={(event) => { const input = Number(event.target.value); if (Number.isFinite(input)) onChange(index, type === "rotation" ? (input * Math.PI) / 180 : input); }} /></label>)}</div></div>;
}

const transformChoices: { mode: TransformMode; label: string; icon: typeof Move3D }[] = [{ mode: "translate", label: "Move", icon: Move3D }, { mode: "rotate", label: "Turn", icon: Rotate3D }, { mode: "scale", label: "Stretch", icon: Scaling }];

function GizmoTools({ transformMode, setTransformMode, groupCount = 1 }: { transformMode: TransformMode; setTransformMode: (mode: TransformMode) => void; groupCount?: number }) {
  return <div className="gizmo-toolbox"><div className="gizmo-heading"><Hand aria-hidden="true" /><span>{groupCount > 1 ? `Grab ${groupCount} shapes` : "Grab handles"}</span></div><div className="transform-mode-row">{transformChoices.map(({ mode, label, icon: Icon }) => <button key={mode} type="button" className={`transform-mode-button ${transformMode === mode ? "is-active" : ""}`} onClick={() => setTransformMode(mode)} aria-pressed={transformMode === mode} title={`${label} ${groupCount > 1 ? "all chosen shapes" : "this shape"}`}><Icon aria-hidden="true" />{label}</button>)}</div><p>{groupCount > 1 ? "Drag once to shape everything you picked together." : "Drag the coloured handles on the stage."}</p></div>;
}

export default function PropertiesPanel() {
  const objects = useStudioStore((state) => state.objects);
  const selectedObjectId = useStudioStore((state) => state.selectedObjectId);
  const selectedObjectIds = useStudioStore((state) => state.selectedObjectIds);
  const selectedIds = selectedObjectIds.length ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
  const selectedObjects = objects.filter((object) => selectedIds.includes(object.id));
  const selectedObject = selectedObjects.find((object) => object.id === selectedObjectId) ?? selectedObjects[0];
  const updateObject = useStudioStore((state) => state.updateObject);
  const deleteSelectedObject = useStudioStore((state) => state.deleteSelectedObject);
  const duplicateSelectedObjects = useStudioStore((state) => state.duplicateSelectedObjects);
  const transformMode = useStudioStore((state) => state.transformMode);
  const setTransformMode = useStudioStore((state) => state.setTransformMode);

  if (!selectedObject) return <aside className="properties-panel panel-surface" aria-label="Properties panel"><div className="panel-heading"><span className="eyebrow">Inspector</span><h2>Pick a shape</h2><p>Tap a shape on your stage to move, turn, stretch, or tuck it away.</p></div><div className="inspector-empty-art" aria-hidden="true"><span className="empty-orbit orbit-one" /><span className="empty-orbit orbit-two" /><span className="empty-core" /></div><div className="selection-tip"><span>Maker tip</span><p>Turn on <strong>Pick many</strong>, then tap shapes to move them together.</p></div></aside>;

  const isGroup = selectedObjects.length > 1;
  const updateVector = (field: "position" | "rotation" | "scale", axis: number, value: number) => { const next = [...selectedObject[field]] as Vector3Tuple; next[axis] = field === "scale" ? Math.min(3, Math.max(.25, value)) : value; updateObject(selectedObject.id, { [field]: next }); };
  if (isGroup) return <aside className="properties-panel panel-surface" aria-label="Properties panel"><div className="inspector-topline"><div><span className="eyebrow">Group inspector</span><h2>{selectedObjects.length} shapes together</h2></div><span className="selected-indicator"><span /> group</span></div><div className="object-summary group-summary"><Layers3 aria-hidden="true" /><span>These shapes will move, turn, and stretch as one.</span></div><GizmoTools transformMode={transformMode} setTransformMode={setTransformMode} groupCount={selectedObjects.length} /><button className="duplicate-object-button" onClick={duplicateSelectedObjects} title="Make copies of all chosen shapes"><Copy aria-hidden="true" />Copy this group</button><button className="delete-object-button" onClick={deleteSelectedObject}><Trash2 aria-hidden="true" />Remove this group</button><div className="keyboard-note"><ArrowDownToLine aria-hidden="true" /> Press Delete / Backspace to remove</div></aside>;
  return <aside className="properties-panel panel-surface" aria-label="Properties panel"><div className="inspector-topline"><div><span className="eyebrow">Inspector</span><h2>{selectedObject.name}</h2></div><span className="selected-indicator" aria-label="An object is selected"><span /> chosen</span></div><div className="object-summary"><span className="object-colour-dot" style={{ backgroundColor: selectedObject.color }} /><span>{selectedObject.material} {selectedObject.type}</span></div><GizmoTools transformMode={transformMode} setTransformMode={setTransformMode} /><div className="transform-stack"><div className="transform-heading"><Move3D aria-hidden="true" /><span>Fine move</span></div><AxisEditor label="Position" values={selectedObject.position} type="position" onChange={(axis, value) => updateVector("position", axis, value)} /><div className="transform-heading"><Rotate3D aria-hidden="true" /><span>Fine turn</span></div><AxisEditor label="Rotation" values={selectedObject.rotation} type="rotation" onChange={(axis, value) => updateVector("rotation", axis, value)} /><div className="transform-heading"><Scaling aria-hidden="true" /><span>Fine stretch</span></div><AxisEditor label="Size" values={selectedObject.scale} type="scale" onChange={(axis, value) => updateVector("scale", axis, value)} /></div><button className="duplicate-object-button" onClick={duplicateSelectedObjects} title="Make a copy of this shape"><Copy aria-hidden="true" />Make a copy</button><button className="delete-object-button" onClick={deleteSelectedObject}><Trash2 aria-hidden="true" />Remove this shape</button><div className="keyboard-note"><ArrowDownToLine aria-hidden="true" /> Press Delete / Backspace to remove</div></aside>;
}
