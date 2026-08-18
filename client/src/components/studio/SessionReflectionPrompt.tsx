/** Playful Atelier design reminder: reflection is a small pinned note after making—private, optional, and never a performance score. */
import {
  CheckCircle2,
  Eraser,
  Lightbulb,
  LockKeyhole,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStudioStore } from "@/store/useStudioStore";
import "@/styles/sessionReflection.css";

const prompts = [
  {
    id: "choice",
    label: "A creative choice",
    question:
      "What is one choice you made that helped your world feel more like yours?",
  },
  {
    id: "surprise",
    label: "A surprise",
    question:
      "What surprised you while you were building or changing your shapes?",
  },
  {
    id: "next",
    label: "A next idea",
    question: "If you had five more minutes, what would you try next?",
  },
];

export default function SessionReflectionPrompt() {
  const objects = useStudioStore(state => state.objects);
  const ageMode = useStudioStore(state => state.ageMode);
  const lastSessionReflection = useStudioStore(
    state => state.lastSessionReflection
  );
  const saveSessionReflection = useStudioStore(
    state => state.saveSessionReflection
  );
  const clearSessionReflection = useStudioStore(
    state => state.clearSessionReflection
  );
  const prompt = useMemo(
    () => prompts[(objects.length + ageMode.length) % prompts.length],
    [ageMode.length, objects.length]
  );
  const [answer, setAnswer] = useState(lastSessionReflection?.answer ?? "");
  const save = () => {
    if (saveSessionReflection(answer, prompt.id))
      toast.success("Your reflection is saved in this browser.");
    else
      toast("Write a few words first, if you would like to save a reflection.");
  };
  const clear = () => {
    clearSessionReflection();
    setAnswer("");
    toast("Your local reflection was cleared.");
  };

  return (
    <section className="session-reflection" aria-labelledby="reflection-title">
      <div className="reflection-stamp">
        <Lightbulb aria-hidden="true" />
        <span>Session pause</span>
      </div>
      <div className="reflection-copy">
        <span className="eyebrow">{prompt.label}</span>
        <h2 id="reflection-title">
          Before you leave the studio, notice your making.
        </h2>
        <p>{prompt.question}</p>
        <div className="reflection-privacy">
          <LockKeyhole aria-hidden="true" />
          Keep this short and avoid names or private details. Your latest
          reflection stays only in this browser.
        </div>
      </div>
      <div className="reflection-note">
        <textarea
          value={answer}
          maxLength={240}
          onChange={event => setAnswer(event.target.value)}
          placeholder="I noticed that…"
          aria-label="Your end-of-session reflection"
        />
        <div className="reflection-actions">
          <span>{answer.trim().length}/240</span>
          <div>
            {lastSessionReflection && (
              <button
                className="reflection-clear"
                type="button"
                onClick={clear}
              >
                <Eraser aria-hidden="true" />
                Clear
              </button>
            )}
            <button className="reflection-save" type="button" onClick={save}>
              <Save aria-hidden="true" />
              Save reflection
            </button>
          </div>
        </div>
        {lastSessionReflection && (
          <p className="reflection-saved">
            <CheckCircle2 aria-hidden="true" />
            Latest reflection saved with {
              lastSessionReflection.objectCount
            }{" "}
            shape{lastSessionReflection.objectCount === 1 ? "" : "s"} on stage.
          </p>
        )}
      </div>
    </section>
  );
}
