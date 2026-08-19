/**
 * Playful Atelier design reminder: use a field-journal composition that credits real
 * collaborators and keeps children’s artwork opt-in, browser-local, and unpublicized by default.
 */
import {
  ArrowRight,
  BookOpenCheck,
  ExternalLink,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "wouter";
import PublicStudioHeader from "@/components/PublicStudioHeader";
import { useStudioStore } from "@/store/useStudioStore";
import "@/styles/publicStudioPages.css";

const developerRoster = [
  "Simeon Ogaji",
  "Samuel Ogaji",
  "Daniel Ogaji",
  "Michael Ogaji",
];

export default function Makers() {
  const savedArtworks = useStudioStore(state => state.savedArtworks);
  const makerSpotlights = useStudioStore(state => state.makerSpotlights);
  const spotlights = makerSpotlights.flatMap(spotlight => {
    const artwork = savedArtworks.find(
      entry => entry.id === spotlight.artworkId
    );
    return artwork ? [{ ...spotlight, artwork }] : [];
  });

  return (
    <main className="journal-page makers-page">
      <PublicStudioHeader />
      <section className="makers-hero">
        <div className="makers-intro">
          <span className="journal-kicker">
            <Sparkles aria-hidden="true" />
            People behind the tiny worlds
          </span>
          <h1>Meet the makers who turn curious ideas into places to play.</h1>
          <p>
            Creative Art Studio is being shaped as a training-studio
            collaboration: an approachable 3D space where young people can
            build, experiment, and see their ideas take form.
          </p>
          <div className="makers-hero-actions">
            <Link href="/classroom" className="journal-primary-action">
              Try a starter project <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/educators" className="journal-secondary-action">
              Teaching notes <BookOpenCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="maker-profile-card">
          <span className="profile-paperclip" aria-hidden="true" />
          <span className="eyebrow">Creative lead</span>
          <h2>Sylvester Oga Ogaji</h2>
          <p>
            Founder &amp; Executive Director at JV ImpactVR Initiative and
            doctoral researcher in Artificial Intelligence and Digital Media
            Innovation.
          </p>
          <div className="profile-topic-list">
            <span>AI</span>
            <span>Extended reality</span>
            <span>Digital transformation</span>
          </div>
          <p className="source-note">
            His work connects immersive technology, practical learning, and
            social impact.{" "}
            <a
              href="https://www.linkedin.com/in/sylvesterogaogaji/"
              target="_blank"
              rel="noreferrer"
            >
              Profile source <ExternalLink aria-hidden="true" />
            </a>
            <sup>[1]</sup>
          </p>
          <a
            className="profile-link"
            href="https://sites.google.com/view/jv-impactvr-initiative-ltdgte/home"
            target="_blank"
            rel="noreferrer"
          >
            About JV ImpactVR Initiative <ExternalLink aria-hidden="true" />
          </a>
          <sup>[2]</sup>
        </aside>
        <div
          className="journal-maker-artifact artifact-makers"
          aria-hidden="true"
        >
          <i className="artifact-paper artifact-paper-back" />
          <i className="artifact-paper artifact-paper-front" />
          <span className="artifact-pigment pigment-cobalt" />
          <span className="artifact-pigment pigment-seaglass" />
          <span className="artifact-pigment pigment-yellow" />
        </div>
      </section>
      <section
        className="makers-roster-section"
        aria-labelledby="developer-roster-title"
      >
        <div className="section-heading-journal">
          <span className="eyebrow">Developer circle</span>
          <h2 id="developer-roster-title">Learning by building together.</h2>
          <p>
            These student developers are acknowledged for helping to shape the
            studio as part of the training journey.
          </p>
        </div>
        <div className="maker-roster-grid">
          {developerRoster.map((name, index) => (
            <article className={`maker-name-card card-${index + 1}`} key={name}>
              <span aria-hidden="true">
                {name
                  .split(" ")
                  .map(part => part[0])
                  .join("")}
              </span>
              <div>
                <h3>{name}</h3>
                <p>Student developer</p>
              </div>
            </article>
          ))}
          <article className="maker-name-card learners-card">
            <UsersRound aria-hidden="true" />
            <div>
              <h3>Other learners</h3>
              <p>Exploring, sketching, testing, and improving together.</p>
            </div>
          </article>
        </div>
      </section>
      <section className="makers-showcase" aria-labelledby="showcase-title">
        <div className="showcase-heading">
          <div>
            <span className="eyebrow">Studio shelf</span>
            <h2 id="showcase-title">Featured local worlds</h2>
            <p>
              Saved art appears here only when a teacher or maker deliberately
              chooses <b>Feature in Makers</b> from this browser’s gallery.
            </p>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
        {spotlights.length ? (
          <div className="spotlight-grid">
            {spotlights.map(({ artwork, makerName, note }) => (
              <article className="spotlight-card" key={artwork.id}>
                {artwork.thumbnailDataUrl ? (
                  <img
                    src={artwork.thumbnailDataUrl}
                    alt={`A saved artwork named ${artwork.title} by ${makerName}`}
                  />
                ) : (
                  <div className="spotlight-shape-preview" aria-hidden="true">
                    {artwork.objects.slice(0, 5).map((object, index) => (
                      <span
                        key={object.id}
                        style={{
                          backgroundColor: object.color,
                          transform: `translate(${index * 18 - 34}px, ${(index % 2) * 16 - 8}px) rotate(${index * 18}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div>
                  <span className="spotlight-maker">
                    <Sparkles aria-hidden="true" />
                    Made by {makerName}
                  </span>
                  <h3>{artwork.title}</h3>
                  {note && <p>{note}</p>}
                  <small>
                    {artwork.objects.length} shapes · stored locally
                  </small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="showcase-empty">
            <Lightbulb aria-hidden="true" />
            <div>
              <h3>The shelf is waiting for a first world.</h3>
              <p>
                Make and save a world, then open <b>My worlds</b> and add a
                chosen display name to feature it here. Nothing is uploaded or
                shared automatically.
              </p>
            </div>
          </div>
        )}
      </section>
      <section className="makers-closing-note">
        <HeartHandshake aria-hidden="true" />
        <div>
          <h2>
            Creativity grows when people can see that building is a team sport.
          </h2>
          <p>
            Every experiment matters: a first cube, a surprising colour choice,
            a careful test, or a question that makes the next version better.
          </p>
        </div>
      </section>
      <footer className="journal-footer">
        <p>
          Created by Sylvester Oga Ogaji with student developers Simeon Ogaji,
          Samuel Ogaji, Daniel Ogaji, Michael Ogaji, and other learners in the
          training studio.
        </p>
        <p className="journal-references">
          [1]{" "}
          <a
            href="https://www.linkedin.com/in/sylvesterogaogaji/"
            target="_blank"
            rel="noreferrer"
          >
            Public professional profile
          </a>{" "}
          · [2]{" "}
          <a
            href="https://sites.google.com/view/jv-impactvr-initiative-ltdgte/home"
            target="_blank"
            rel="noreferrer"
          >
            JV ImpactVR Initiative
          </a>
        </p>
      </footer>
    </main>
  );
}
