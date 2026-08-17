/** Playful Atelier sound helper: short opt-in Web Audio cues, entirely generated in the browser. */
export type StudioSoundEffect = "pop" | "colour" | "texture" | "celebrate" | "toggle";

let audioContext: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function note(context: AudioContext, frequency: number, start: number, duration: number, gainAmount: number, type: OscillatorType = "sine") {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainAmount, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

export function playStudioSound(effect: StudioSoundEffect, enabled: boolean) {
  if (!enabled) return;
  const context = getContext();
  if (!context) return;
  const start = context.currentTime + 0.01;
  if (effect === "celebrate") {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => note(context, frequency, start + index * 0.09, 0.24, 0.055, "triangle"));
    return;
  }
  if (effect === "colour") { note(context, 523.25, start, 0.11, 0.038, "sine"); note(context, 783.99, start + 0.055, 0.13, 0.032, "sine"); return; }
  if (effect === "texture") { note(context, 392, start, 0.09, 0.032, "triangle"); note(context, 587.33, start + 0.045, 0.11, 0.028, "triangle"); return; }
  if (effect === "toggle") { note(context, 659.25, start, 0.12, 0.036, "sine"); return; }
  note(context, 440, start, 0.12, 0.034, "triangle");
}
