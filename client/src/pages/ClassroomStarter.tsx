/**
 * Playful Atelier design reminder: start a class with a clear invitation and a
 * tactile seed scene, preserving the current work until an educator confirms the switch.
 */
import { ArrowRight, CheckCircle2, CircleDotDashed, Leaf, Lightbulb, MousePointer2, PencilRuler, Rocket, RotateCcw, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import PublicStudioHeader from "@/components/PublicStudioHeader";
import { useStudioStore } from "@/store/useStudioStore";
import { classroomStarterDetails, type ClassroomStarterTheme } from "@/types/studio";
import { sessionDurationDetails } from "@/types/studio";
import "@/styles/publicStudioPages.css";
import "@/styles/classroomThemeCards.css";

const starterSteps = [
  ["Notice", "Look at the four starter shapes. What could they become in this new place?"],
  ["Add", "Add three new shapes for something the place needs: a helper, a machine, a bridge, or a surprise."],
  ["Shape", "Move and change colours until each object helps tell the story."],
  ["Name", "Give the world a title, save it on this browser, and describe one creative choice."],
];

export default function ClassroomStarter() {
  const [, setLocation] = useLocation();
  const loadClassroomStarter = useStudioStore((state) => state.loadClassroomStarter);
  const objects = useStudioStore((state) => state.objects);
  const sessionDuration = useStudioStore((state) => state.sessionDuration);
  const [confirming, setConfirming] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ClassroomStarterTheme>("garden");
  const starter = classroomStarterDetails[selectedTheme];
  const sessionPlan = sessionDurationDetails[sessionDuration];
  const starterIcons = { garden: Leaf, space: Rocket, underwater: Waves };
  const start = () => { loadClassroomStarter(selectedTheme); setLocation("/"); };
  return <main className="journal-page classroom-page"><PublicStudioHeader /><section className="classroom-hero"><div><span className="journal-kicker"><Sparkles aria-hidden="true" />Classroom project templates</span><h1>{starter.title}</h1><p>{starter.brief} Start with a few shapes, then turn them into a place that tells your group’s story.</p><div className="starter-chips"><span><CircleDotDashed aria-hidden="true" />{starter.shapeCount} starter shapes</span><span><PencilRuler aria-hidden="true" />{sessionPlan.minutes} minutes</span><span><ShieldCheck aria-hidden="true" />Browser-local</span></div></div><aside className={`starter-seed-card theme-${selectedTheme}`}><span className="seed-sun" aria-hidden="true" /><span className="seed-ground" aria-hidden="true" /><span className="seed-tree" aria-hidden="true" /><span className="seed-tower" aria-hidden="true" /><span className="seed-flower" aria-hidden="true" /><p>{starter.seedNote}</p></aside></section><section className="starter-theme-section" aria-labelledby="starter-theme-title"><div className="section-heading-journal"><span className="eyebrow">Choose a seed scene</span><h2 id="starter-theme-title">Three places to begin, countless ways to remix.</h2></div><div className="starter-theme-grid">{(Object.keys(classroomStarterDetails) as ClassroomStarterTheme[]).map((theme) => { const detail = classroomStarterDetails[theme]; const Icon = starterIcons[theme]; return <button key={theme} className={`starter-theme-card theme-${theme} ${selectedTheme === theme ? "is-selected" : ""}`} onClick={() => { setSelectedTheme(theme); setConfirming(false); }} aria-pressed={selectedTheme === theme}><Icon aria-hidden="true" /><span>{detail.label}</span><b>{detail.title.replace("Build a ", "")}</b><small>{detail.brief}</small></button>; })}</div></section><section className="starter-brief"><div className="starter-prompt-note"><Lightbulb aria-hidden="true" /><div><span className="eyebrow">The brief</span><h2>{starter.brief}</h2><p>You might make a playground for helpers, a shared library, a surprise machine, a resting place, or a secret corner for ideas.</p></div></div><ol className="starter-steps">{starterSteps.map(([title, description], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></section><section className="starter-launch"><div><span className="eyebrow">Ready when you are</span><h2>Open a fresh {starter.label.toLowerCase()} seed.</h2><p>{objects.length ? "Opening the template replaces the shapes currently on this stage. Save your current world first if you want to keep it." : "The template opens directly on the art stage, ready for a group to remix."}</p></div>{confirming ? <div className="starter-confirm"><p><b>Replace this stage with the {starter.label.toLowerCase()} starter?</b> Your saved worlds stay safe in My worlds.</p><div><button className="journal-secondary-button" onClick={() => setConfirming(false)}><RotateCcw aria-hidden="true" />Keep current stage</button><button className="journal-primary-button" onClick={start}>Open this starter <ArrowRight aria-hidden="true" /></button></div></div> : <button className="journal-primary-button" onClick={() => objects.length ? setConfirming(true) : start()}><MousePointer2 aria-hidden="true" />Open this starter</button>}</section><section className="starter-teacher-note"><CheckCircle2 aria-hidden="true" /><p><b>Facilitator tip:</b> {sessionPlan.label} gives your group a {sessionPlan.minutes}-minute rhythm. This starter is an invitation, not a model answer.</p><Link href="/educators">Adjust session pace <ArrowRight aria-hidden="true" /></Link></section><footer className="journal-footer"><p>Created by Sylvester Oga Ogaji with student developers Simeon Ogaji, Samuel Ogaji, Daniel Ogaji, Michael Ogaji, and other learners in the training studio.</p></footer></main>;
}
