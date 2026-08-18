/**
 * Playful Atelier design reminder: start a class with a clear invitation and a
 * tactile seed scene, preserving the current work until an educator confirms the switch.
 */
import { ArrowRight, CheckCircle2, CircleDotDashed, Lightbulb, MousePointer2, PencilRuler, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import PublicStudioHeader from "@/components/PublicStudioHeader";
import { useStudioStore } from "@/store/useStudioStore";
import "@/styles/publicStudioPages.css";

const starterSteps = [
  ["Notice", "Look at the four starter shapes. What could they become in a future garden?"],
  ["Add", "Add three new shapes for something the garden needs: a creature, a machine, a bridge, or a surprise."],
  ["Shape", "Move and change colours until each object helps tell the story."],
  ["Name", "Give the world a title, save it on this browser, and describe one creative choice."],
];

export default function ClassroomStarter() {
  const [, setLocation] = useLocation();
  const loadClassroomStarter = useStudioStore((state) => state.loadClassroomStarter);
  const objects = useStudioStore((state) => state.objects);
  const [confirming, setConfirming] = useState(false);
  const start = () => { loadClassroomStarter(); setLocation("/"); };
  return <main className="journal-page classroom-page"><PublicStudioHeader /><section className="classroom-hero"><div><span className="journal-kicker"><Sparkles aria-hidden="true" />Classroom project template</span><h1>Build a tiny future garden.</h1><p>What would a kind, playful, or surprising garden need? Start with a few shapes, then turn them into a place that tells your group’s story.</p><div className="starter-chips"><span><CircleDotDashed aria-hidden="true" />4 starter shapes</span><span><PencilRuler aria-hidden="true" />45 minutes</span><span><ShieldCheck aria-hidden="true" />Browser-local</span></div></div><aside className="starter-seed-card"><span className="seed-sun" aria-hidden="true" /><span className="seed-ground" aria-hidden="true" /><span className="seed-tree" aria-hidden="true" /><span className="seed-tower" aria-hidden="true" /><span className="seed-flower" aria-hidden="true" /><p>Your starter scene includes a ground, a tower, a tree crown, and an idea flag. Everything is ready to remix.</p></aside></section><section className="starter-brief"><div className="starter-prompt-note"><Lightbulb aria-hidden="true" /><div><span className="eyebrow">The brief</span><h2>Design one corner of the garden where something good can grow.</h2><p>You might make a playground for robots, a seed library, a rainbow compost machine, a resting tree, or a secret place for ideas.</p></div></div><ol className="starter-steps">{starterSteps.map(([title, description], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></section><section className="starter-launch"><div><span className="eyebrow">Ready when you are</span><h2>Open a fresh garden seed.</h2><p>{objects.length ? "Opening the template replaces the shapes currently on this stage. Save your current world first if you want to keep it." : "The template opens directly on the art stage, ready for a group to remix."}</p></div>{confirming ? <div className="starter-confirm"><p><b>Replace this stage with the garden starter?</b> Your saved worlds stay safe in My worlds.</p><div><button className="journal-secondary-button" onClick={() => setConfirming(false)}><RotateCcw aria-hidden="true" />Keep current stage</button><button className="journal-primary-button" onClick={start}>Open garden starter <ArrowRight aria-hidden="true" /></button></div></div> : <button className="journal-primary-button" onClick={() => objects.length ? setConfirming(true) : start()}><MousePointer2 aria-hidden="true" />Open garden starter</button>}</section><section className="starter-teacher-note"><CheckCircle2 aria-hidden="true" /><p><b>Facilitator tip:</b> This starter is an invitation, not a model answer. Let every group decide what their garden needs and use questions instead of corrections.</p><Link href="/educators">View teacher guidance <ArrowRight aria-hidden="true" /></Link></section><footer className="journal-footer"><p>Created by Sylvester Oga Ogaji with student developers Simeon Ogaji, Samuel Ogaji, Daniel Ogaji, Michael Ogaji, and other learners in the training studio.</p></footer></main>;
}
