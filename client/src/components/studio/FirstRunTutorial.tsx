/** Playful Atelier onboarding: three small, animated invitations that teach through doing. */
import { ArrowRight, Hand, Move, Palette, RotateCcw, Sparkles, X } from "lucide-react";
import type { TutorialStep } from "@/types/studio";

const lessons: Record<Exclude<TutorialStep, "welcome" | "done">, { number: string; title: string; copy: string; Icon: typeof Hand }> = {
  add: { number: "1 of 3", title: "Choose your first shape", copy: "Tap any bright shape on the Maker Shelf. It will appear on your stage.", Icon: Hand },
  move: { number: "2 of 3", title: "Give it a little move", copy: "Drag a colourful handle on your chosen shape to move it around.", Icon: Move },
  colour: { number: "3 of 3", title: "Pick its brightest colour", copy: "Tap a pigment dot to make your shape feel like yours.", Icon: Palette },
};

export default function FirstRunTutorial({ step, onStart, onSkip, onReplay }: { step: TutorialStep; onStart: () => void; onSkip: () => void; onReplay: () => void }) {
  if (step === "done") return <button className="tutorial-replay has-tooltip" data-tooltip="Show the first steps again" onClick={onReplay}><RotateCcw aria-hidden="true" />Show me</button>;
  if (step === "welcome") return <div className="tutorial-welcome" role="dialog" aria-modal="true" aria-labelledby="tutorial-welcome-title"><div className="tutorial-welcome-card"><span className="tutorial-note-corner" aria-hidden="true" /><span className="tutorial-spark"><Sparkles aria-hidden="true" /></span><span className="eyebrow">A little studio note</span><h2 id="tutorial-welcome-title">Let’s make your first world.</h2><p>Three tiny moves, then it’s all yours: pick a shape, move it, and give it colour.</p><div className="tutorial-welcome-actions"><button className="tutorial-start" onClick={onStart}>Show me how <ArrowRight aria-hidden="true" /></button><button className="tutorial-skip" onClick={onSkip}>I’ll explore myself</button></div></div></div>;
  const lesson = lessons[step];
  const Icon = lesson.Icon;
  return <aside className={`tutorial-coach tutorial-coach-${step}`} aria-live="polite"><button className="tutorial-dismiss" onClick={onSkip} aria-label="Skip studio tour"><X aria-hidden="true" /></button><div className="tutorial-icon"><Icon aria-hidden="true" /></div><div><span className="tutorial-count">Step {lesson.number}</span><h2>{lesson.title}</h2><p>{lesson.copy}</p></div><span className="tutorial-wiggle" aria-hidden="true">↓</span></aside>;
}
