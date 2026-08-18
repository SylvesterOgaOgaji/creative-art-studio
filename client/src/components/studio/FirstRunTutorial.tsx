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
  if (step === "welcome") return <button className="tutorial-welcome-trigger has-tooltip" data-tooltip="A quick three-step guide: add, move, colour" onClick={onStart} aria-label="Show a three-step guide to making a first world"><Sparkles aria-hidden="true" /><span><b>First steps</b><small>add · move · colour</small></span><ArrowRight aria-hidden="true" /></button>;
  const lesson = lessons[step];
  const Icon = lesson.Icon;
  return <aside className={`tutorial-coach tutorial-coach-${step}`} aria-live="polite"><button className="tutorial-dismiss" onClick={onSkip} aria-label="Skip studio tour"><X aria-hidden="true" /></button><div className="tutorial-icon"><Icon aria-hidden="true" /></div><div><span className="tutorial-count">Step {lesson.number}</span><h2>{lesson.title}</h2><p>{lesson.copy}</p></div><span className="tutorial-wiggle" aria-hidden="true">↓</span></aside>;
}
