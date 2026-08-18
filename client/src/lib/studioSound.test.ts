import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AudioFixture = {
  AudioContext: typeof AudioContext;
  createOscillator: ReturnType<typeof vi.fn>;
  createGain: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
};

function createAudioFixture(
  state: AudioContextState = "running"
): AudioFixture {
  const createGain = vi.fn(() => {
    const gain = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    return { gain, connect: vi.fn(() => ({ connect: vi.fn() })) };
  });
  const createOscillator = vi.fn(() => ({
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn((destination: ReturnType<typeof createGain>) => destination),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  const resume = vi.fn();
  const AudioContext = vi.fn(function () {
    return {
      state,
      currentTime: 3,
      destination: {},
      createOscillator,
      createGain,
      resume,
    };
  }) as unknown as typeof window.AudioContext;
  return { AudioContext, createOscillator, createGain, resume };
}

describe("studio sound", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.restoreAllMocks());

  it("does not initialise Web Audio when a child has opted out of sound", async () => {
    const fixture = createAudioFixture();
    vi.stubGlobal("AudioContext", fixture.AudioContext);
    const { playStudioSound } = await import("./studioSound");

    playStudioSound("pop", false);

    expect(fixture.AudioContext).not.toHaveBeenCalled();
  });

  it("resumes a suspended context and plays the four-note celebration cue", async () => {
    const fixture = createAudioFixture("suspended");
    vi.stubGlobal("AudioContext", fixture.AudioContext);
    const { playStudioSound } = await import("./studioSound");

    playStudioSound("celebrate", true, 2);

    expect(fixture.resume).toHaveBeenCalledOnce();
    expect(fixture.createOscillator).toHaveBeenCalledTimes(4);
    expect(fixture.createGain).toHaveBeenCalledTimes(4);
  });

  it("uses a short two-note colour cue and clamps its volume", async () => {
    const fixture = createAudioFixture();
    vi.stubGlobal("AudioContext", fixture.AudioContext);
    const { playStudioSound } = await import("./studioSound");

    playStudioSound("colour", true, -3);

    expect(fixture.createOscillator).toHaveBeenCalledTimes(2);
    expect(fixture.createGain).toHaveBeenCalledTimes(2);
  });
});
