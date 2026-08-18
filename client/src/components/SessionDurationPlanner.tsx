/** Playful Atelier design reminder: session pacing should feel like a teacher’s clipped field note, not a dense timetable. */
import { Clock3, TimerReset } from "lucide-react";
import { sessionDurationDetails, type SessionDuration } from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";

export default function SessionDurationPlanner() {
  const sessionDuration = useStudioStore(state => state.sessionDuration);
  const setSessionDuration = useStudioStore(state => state.setSessionDuration);
  const plan = sessionDurationDetails[sessionDuration];
  return (
    <section
      className="session-duration-section"
      aria-labelledby="session-duration-title"
    >
      <div className="session-duration-note">
        <Clock3 aria-hidden="true" />
        <div>
          <span className="eyebrow">Choose the pace</span>
          <h2 id="session-duration-title">Make the session fit the day.</h2>
          <p>{plan.description}</p>
        </div>
      </div>
      <div
        className="session-duration-options"
        role="group"
        aria-label="Choose session duration"
      >
        {(Object.keys(sessionDurationDetails) as SessionDuration[]).map(
          duration => {
            const detail = sessionDurationDetails[duration];
            return (
              <button
                key={duration}
                className={sessionDuration === duration ? "is-selected" : ""}
                onClick={() => setSessionDuration(duration)}
                aria-pressed={sessionDuration === duration}
              >
                <b>{detail.minutes} min</b>
                <span>{detail.label}</span>
              </button>
            );
          }
        )}
      </div>
      <div className="session-duration-summary">
        <TimerReset aria-hidden="true" />
        <p>
          <b>{plan.minutes}-minute plan:</b>{" "}
          {plan.flow.map(step => `${step.time} ${step.title}`).join(" · ")}
        </p>
      </div>
    </section>
  );
}
