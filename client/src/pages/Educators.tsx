/**
 * Playful Atelier design reminder: educator guidance should feel like a useful
 * field guide beside the workbench—warm, concise, and focused on facilitating play.
 */
import {
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  LaptopMinimal,
  LockKeyhole,
  MousePointer2,
  Printer,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import EducatorSummaryExport from "@/components/EducatorSummaryExport";
import FamilyActivitySheet from "@/components/FamilyActivitySheet";
import SessionDurationPlanner from "@/components/SessionDurationPlanner";
import PublicStudioHeader from "@/components/PublicStudioHeader";
import { sessionDurationDetails } from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";
import "@/styles/publicStudioPages.css";
import "@/styles/educatorPrintCards.css";
import "@/styles/educatorSummaryExport.css";
import "@/styles/familyActivitySheet.css";
import "@/styles/sessionDurationPlanner.css";

const printableCards = [
  {
    number: "01",
    label: "Creative brief",
    title: "Build a tiny future garden",
    copy: "Use four starter shapes to create one place where something good can grow.",
    prompt: "What does your garden need first?",
  },
  {
    number: "02",
    label: "Maker moves",
    title: "Add, move, colour",
    copy: "Add three helpful or surprising shapes. Slide them into a story, then choose colours with purpose.",
    prompt: "Which choice makes your idea clearest?",
  },
  {
    number: "03",
    label: "Conversation card",
    title: "Notice before you fix",
    copy: "Ask a maker what they are trying, then invite them to test one different arrangement.",
    prompt: "What could happen if this shape moved?",
  },
  {
    number: "04",
    label: "Reflection card",
    title: "Share without a score",
    copy: "Let each learner name one choice they would keep and one possibility they would try next time.",
    prompt: "What did you discover while making?",
  },
];

export default function Educators() {
  const sessionDuration = useStudioStore(state => state.sessionDuration);
  const lessonFlow = sessionDurationDetails[sessionDuration].flow;
  return (
    <main className="journal-page educator-page">
      <PublicStudioHeader />
      <section className="educator-hero">
        <div>
          <span className="journal-kicker">
            <BookOpenCheck aria-hidden="true" />A studio companion for educators
          </span>
          <h1>Make room for play, choices, and young designers.</h1>
          <p>
            Creative Art Studio is a browser-local 3D making space for children
            and adolescents. Its shared engine grows from large,
            low-reading-load controls to more detailed creative choices as
            learners gain confidence.
          </p>
          <div className="makers-hero-actions">
            <Link className="journal-primary-action" href="/classroom">
              Open the classroom starters <Route aria-hidden="true" />
            </Link>
            <Link className="journal-secondary-action" href="/makers">
              Meet the makers <HeartHandshake aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="educator-quick-card">
          <LaptopMinimal aria-hidden="true" />
          <h2>Ready with a browser.</h2>
          <p>
            No account, database, payment, or cloud workspace is required for
            the core activity. Saved worlds stay in the browser that made them.
          </p>
          <ul>
            <li>
              <CheckCircle2 aria-hidden="true" />A current desktop or touch
              device browser
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" />A shared screen for
              demonstration, if helpful
            </li>
            <li>
              <CheckCircle2 aria-hidden="true" />A few minutes for learners to
              explore before instructions
            </li>
          </ul>
        </aside>
      </section>
      <SessionDurationPlanner />
      <section className="age-path-section" aria-labelledby="age-path-title">
        <div className="section-heading-journal">
          <span className="eyebrow">
            A shared engine, different entry points
          </span>
          <h2 id="age-path-title">
            Choose a mode that meets learners where they are.
          </h2>
        </div>
        <div className="age-path-grid">
          <article className="age-path-card explorer">
            <Sparkles aria-hidden="true" />
            <span>Explorer · ages 3–6</span>
            <h3>Discovery first</h3>
            <p>
              Use fewer shapes, bright colour choice, and simple movement.
              Narrate action words: slide, choose, make, notice.
            </p>
          </article>
          <article className="age-path-card creator">
            <MousePointer2 aria-hidden="true" />
            <span>Creator · ages 7–11</span>
            <h3>Compose a world</h3>
            <p>
              Layer multiple shapes, materials, lighting, and environments.
              Invite learners to explain how each choice helps their story.
            </p>
          </article>
          <article className="age-path-card designer">
            <UsersRound aria-hidden="true" />
            <span>Designer · ages 12–16</span>
            <h3>Refine with intent</h3>
            <p>
              Use patterns, group selection, precise transforms, folders, tags,
              and PNG export for a more considered composition.
            </p>
          </article>
        </div>
      </section>
      <section
        className="teaching-flow-section"
        aria-labelledby="teaching-flow-title"
      >
        <div className="flow-sticky-note">
          <Clock3 aria-hidden="true" />
          <span>Suggested session</span>
          <h2 id="teaching-flow-title">
            A studio plan that follows your chosen pace.
          </h2>
          <p>
            Choose 20, 35, or 45 minutes above, then use the sequence on the
            right as a flexible guide.
          </p>
        </div>
        <ol className="lesson-flow">
          {lessonFlow.map(({ time, title, description }, index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{time}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="teacher-print-section"
        aria-labelledby="teacher-print-title"
      >
        <div className="teacher-print-heading">
          <div>
            <span className="eyebrow">Offline table pack</span>
            <h2 id="teacher-print-title">
              Four small cards for a big making session.
            </h2>
            <p>
              Use these cards as a quick facilitation prompt at a shared table.
              Choose <b>Print lesson cards</b> to make a clean four-card page or
              save it as a PDF from the browser print dialog.
            </p>
          </div>
          <button
            className="teacher-print-button"
            onClick={() => window.print()}
          >
            <Printer aria-hidden="true" />
            Print lesson cards
          </button>
        </div>
        <div className="teacher-print-card-grid">
          {printableCards.map(card => (
            <article className="teacher-print-card" key={card.number}>
              <span>{card.number}</span>
              <small>{card.label}</small>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              <footer>
                <b>Try asking:</b> “{card.prompt}”
              </footer>
            </article>
          ))}
        </div>
      </section>
      <FamilyActivitySheet />
      <EducatorSummaryExport />
      <section className="educator-safety-section">
        <div>
          <span className="eyebrow">Privacy &amp; child safety</span>
          <h2>Keep the creative experience local and intentional.</h2>
          <p>
            The core studio does not require personal information. Gallery
            worlds, folders, tags, featured maker labels, and settings are
            stored in the current browser only.
          </p>
        </div>
        <div className="safety-points">
          <p>
            <ShieldCheck aria-hidden="true" />
            <span>
              <b>Choose consent-based display names.</b> Meet the Makers only
              features artwork when someone explicitly selects it on that
              browser.
            </span>
          </p>
          <p>
            <LockKeyhole aria-hidden="true" />
            <span>
              <b>Keep sharing supervised.</b> PNG download is available for
              teacher-led or family-approved sharing; the studio has no public
              publishing feature.
            </span>
          </p>
        </div>
      </section>
      <footer className="journal-footer">
        <p>
          Created by Sylvester Oga Ogaji with student developers Simeon Ogaji,
          Samuel Ogaji, Daniel Ogaji, Michael Ogaji, and other learners in the
          training studio.
        </p>
      </footer>
    </main>
  );
}
