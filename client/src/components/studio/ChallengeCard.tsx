/** Playful Atelier design reminder: prompts should feel like a loose card from a maker's idea jar, never an assignment. */
import { Check, Lightbulb, Medal, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { playStudioSound } from "@/lib/studioSound";

export const challenges = [
  {
    title: "Build a robot",
    detail: "Try a cube body, round eyes, and a twisty torus antenna.",
    tint: "robot",
  },
  {
    title: "Make a rainbow creature",
    detail:
      "Pick three shapes, then give every one a different bright pigment.",
    tint: "creature",
  },
  {
    title: "Grow a tiny jungle",
    detail: "Stack cones, spheres, and a little surprise hiding in the leaves.",
    tint: "jungle",
  },
  {
    title: "Invent a space snack",
    detail: "What shape would a moon cookie or comet cupcake be?",
    tint: "space",
  },
  {
    title: "Create a cozy treehouse",
    detail: "Use a cylinder trunk, a cube room, and a torus swing.",
    tint: "treehouse",
  },
] as const;

export default function ChallengeCard() {
  const challengeIndex = useStudioStore(state => state.challengeIndex);
  const nextChallenge = useStudioStore(state => state.nextChallenge);
  const completedChallengeIds = useStudioStore(
    state => state.completedChallengeIds
  );
  const completeChallenge = useStudioStore(state => state.completeChallenge);
  const soundEnabled = useStudioStore(state => state.soundEnabled);
  const soundVolume = useStudioStore(state => state.soundVolume);
  const [isHidden, setIsHidden] = useState(false);
  const [earnedId, setEarnedId] = useState<number | null>(null);
  const challenge = challenges[challengeIndex % challenges.length];
  const challengeId = challengeIndex % challenges.length;
  const isComplete = completedChallengeIds.includes(challengeId);
  const handleComplete = () => {
    completeChallenge(challengeId);
    setEarnedId(challengeId);
    playStudioSound("celebrate", soundEnabled, soundVolume);
    window.setTimeout(() => setEarnedId(null), 1400);
  };

  if (isHidden)
    return (
      <button
        className="challenge-peek has-tooltip"
        data-tooltip="Open a tiny idea card"
        onClick={() => setIsHidden(false)}
      >
        <Lightbulb aria-hidden="true" />
        Need an idea?
      </button>
    );

  return (
    <>
      <aside
        className={`challenge-card challenge-${challenge.tint} ${earnedId === challengeId ? "is-earned" : ""}`}
        aria-label="Creative challenge"
      >
        <div className="challenge-icon">
          <Lightbulb aria-hidden="true" />
        </div>
        <div>
          <span className="eyebrow">Tiny challenge</span>
          <h2>{challenge.title}</h2>
          <p>{challenge.detail}</p>
          <button
            className={`challenge-complete ${isComplete ? "is-complete" : ""}`}
            onClick={handleComplete}
            disabled={isComplete}
          >
            {isComplete ? (
              <>
                <Check aria-hidden="true" />
                Badge earned
              </>
            ) : (
              <>
                <Medal aria-hidden="true" />I made it!
              </>
            )}
          </button>
        </div>
        <div className="challenge-actions">
          <button
            className="challenge-refresh has-tooltip"
            data-tooltip="Pick another idea"
            onClick={nextChallenge}
            aria-label="Show another creative challenge"
          >
            <RefreshCw aria-hidden="true" />
          </button>
          <button
            className="challenge-dismiss has-tooltip"
            data-tooltip="Hide challenge"
            onClick={() => setIsHidden(true)}
            aria-label="Hide this creative challenge"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      </aside>
      <section className="badge-shelf" aria-label="Completed challenge badges">
        <div>
          <Medal aria-hidden="true" />
          <span>
            <b>Badge shelf</b>
            <small>
              {completedChallengeIds.length} of {challenges.length} ideas
              celebrated
            </small>
          </span>
        </div>
        <div className="badge-row">
          {challenges.map((item, index) => (
            <span
              key={item.title}
              className={`challenge-badge ${completedChallengeIds.includes(index) ? "is-earned" : ""}`}
              title={
                completedChallengeIds.includes(index)
                  ? `${item.title} badge earned`
                  : `${item.title} badge waiting`
              }
            >
              <span aria-hidden="true">
                {completedChallengeIds.includes(index) ? "✦" : "○"}
              </span>
              <small>{index + 1}</small>
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
