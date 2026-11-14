/**
 * "Happy Birthday" played as a music box, synthesised live with the Web Audio API.
 * No audio file is shipped or downloaded. Must be started from a user gesture
 * (the "tap to open" press), which is also what browsers require for autoplay.
 */

type Note = [midi: number, beats: number];

// Four lines, two bars of 3/4 each.
const MELODY: Note[] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
];

// One soft root note at the start of each bar.
const BASS = [48, 43, 43, 48, 48, 41, 41, 48];

const BEAT = 60 / 92;
const VOLUME = 0.62;
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export type BirthdayPlayer = {
  start: () => void;
  setMuted: (muted: boolean) => void;
  stop: () => void;
};

export function createBirthdayPlayer(): BirthdayPlayer {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0.0001;

  // A small generated room reverb so the plinks bloom a little.
  const convolver = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 2.4);
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  convolver.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.34;

  master.connect(ctx.destination);
  master.connect(convolver);
  convolver.connect(wet);
  wet.connect(ctx.destination);

  function tone(f: number, at: number, partials: [ratio: number, gain: number, decay: number][], vel: number) {
    for (const [ratio, gain, decay] of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f * ratio;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(vel * gain, at + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(at + decay + 0.05);
    }
  }

  const BOX: [number, number, number][] = [[1, 1, 1.9], [2.01, 0.42, 1.1], [4.1, 0.16, 0.55]];
  const SOFT: [number, number, number][] = [[1, 1, 2.2], [2, 0.18, 1.2]];

  function scheduleSong(at: number): number {
    let t = at;
    for (const [midi, beats] of MELODY) {
      tone(freq(midi), t, BOX, 0.32);
      t += beats * BEAT;
    }
    BASS.forEach((m, bar) => tone(freq(m), at + bar * 3 * BEAT, SOFT, 0.2));
    return t;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  function loop(at: number) {
    if (stopped) return;
    const end = scheduleSong(at);
    const nextAt = end + 1.6;
    timer = setTimeout(() => loop(nextAt), Math.max(0, (end - ctx.currentTime - 0.5) * 1000));
  }

  return {
    start() {
      void ctx.resume();
      master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
      loop(ctx.currentTime + 0.2);
    },
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0.0001 : VOLUME, ctx.currentTime, 0.12);
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      setTimeout(() => void ctx.close(), 800);
    },
  };
}
