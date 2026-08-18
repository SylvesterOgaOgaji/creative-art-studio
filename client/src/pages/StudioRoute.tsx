/**
 * Playful Atelier design reminder: load the full maker table only when a child
 * enters the studio, so lighter public routes stay welcoming and responsive.
 */
import SessionReflectionPrompt from "@/components/studio/SessionReflectionPrompt";
import Home from "./Home";

export default function StudioRoute() {
  return (
    <>
      <Home />
      <SessionReflectionPrompt />
    </>
  );
}
