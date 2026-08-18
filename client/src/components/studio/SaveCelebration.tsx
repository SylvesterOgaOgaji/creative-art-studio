/** Playful Atelier celebration: pure CSS confetti, intentionally brief and reduced-motion safe. */
import { useEffect } from "react";

const pieces = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${5 + ((index * 13) % 91)}%`,
  color: ["#FF6B4A", "#4666E9", "#4EB69D", "#F6C945", "#C85A91"][index % 5],
  delay: `${(index % 7) * 55}ms`,
  rotate: `${(index * 47) % 360}deg`,
}));

export default function SaveCelebration({
  active,
  onDone,
}: {
  active: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [active, onDone]);
  if (!active) return null;
  return (
    <div
      className="save-celebration"
      role="status"
      aria-live="polite"
      aria-label="Artwork saved. A colourful celebration appears."
    >
      <div className="celebration-message">Saved! Your world is growing.</div>
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
