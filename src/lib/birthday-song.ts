/**
 * Every card song is synthesised live with the Web Audio API, so no audio file is
 * shipped or downloaded. Playback must start from a user gesture (the "tap to open"
 * press), which is also what browsers require for autoplay.
 *
 *  - birthday : "Happy Birthday" as a music box
 *  - christmas: "Jingle Bells" with glockenspiel bells and sleigh-bell ticks
 *  - vesak    : an original slow singing-bowl melody over a soft drone
 *  - valentine: an original music-box waltz
 * (All melodies are public domain or original.)
 */
import type { OccasionId } from "./occasions";

type Note = [midi: number, beats: number]; // midi 0 is a rest
type Partials = [ratio: number, gain: number, decay: number][];

type Song = {
  beat: number;
  melody: Note[];
  bass: [atBeat: number, midi: number][];
  lead: Partials;
  leadVel: number;
  leadAttack: number;
  low: Partials;
  lowVel: number;
  lowAttack: number;
  jingle?: boolean;
  /** Seconds of silence before the loop restarts. */
  gap: number;
  wet: number;
  volume: number;
};

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

const BOX: Partials = [[1, 1, 1.9], [2.01, 0.42, 1.1], [4.1, 0.16, 0.55]];
const SOFT: Partials = [[1, 1, 2.2], [2, 0.18, 1.2]];
const BELL: Partials = [[1, 1, 1.7], [2.76, 0.3, 0.9], [5.4, 0.12, 0.45]];
const BOWL: Partials = [[1, 1, 6], [1.007, 0.6, 6], [2.71, 0.4, 4], [5.15, 0.16, 2.5], [8.3, 0.06, 1.5]];
const DRONE: Partials = [[1, 1, 11], [2, 0.3, 9]];

const SONGS: Record<OccasionId, Song> = {
  birthday: {
    beat: 60 / 92,
    melody: [
      [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
      [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
      [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
      [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
    ],
    bass: [48, 43, 43, 48, 48, 41, 41, 48].map((m, bar) => [bar * 3, m] as [number, number]),
    lead: BOX, leadVel: 0.32, leadAttack: 0.006,
    low: SOFT, lowVel: 0.2, lowAttack: 0.006,
    gap: 1.6, wet: 0.34, volume: 0.62,
  },
  christmas: {
    beat: 0.5,
    melody: [
      [76, 1], [76, 1], [76, 2], [76, 1], [76, 1], [76, 2], [76, 1], [79, 1], [72, 1.5], [74, 0.5], [76, 4],
      [77, 1], [77, 1], [77, 1.5], [77, 0.5], [77, 1], [76, 1], [76, 1], [76, 0.5], [76, 0.5],
      [76, 1], [74, 1], [74, 1], [76, 1], [74, 2], [79, 2],
    ],
    bass: [[0, 48], [4, 48], [8, 48], [12, 48], [16, 53], [20, 48], [24, 55], [28, 55]],
    lead: BELL, leadVel: 0.3, leadAttack: 0.005,
    low: SOFT, lowVel: 0.22, lowAttack: 0.006,
    jingle: true,
    gap: 1.4, wet: 0.3, volume: 0.62,
  },
  vesak: {
    beat: 1.1,
    melody: [
      [69, 2], [74, 2], [71, 1], [69, 1], [67, 2],
      [64, 2], [67, 2], [69, 1], [67, 1], [62, 2],
      [67, 2], [69, 2], [74, 2], [71, 1], [69, 1],
      [67, 2], [64, 2], [62, 4],
    ],
    bass: [[0, 38], [8, 45], [16, 43], [24, 38]],
    lead: BOWL, leadVel: 0.26, leadAttack: 0.03,
    low: DRONE, lowVel: 0.13, lowAttack: 3,
    gap: 3, wet: 0.5, volume: 0.6,
  },
  valentine: {
    beat: 0.62,
    melody: [
      [76, 1], [79, 1], [84, 1], [83, 1.5], [81, 0.5], [79, 1],
      [77, 1], [81, 1], [86, 1], [84, 3],
      [76, 1], [79, 1], [84, 1], [86, 1.5], [84, 0.5], [83, 1],
      [81, 1], [77, 1], [79, 1], [84, 3],
    ],
    bass: [[0, 48], [3, 43], [6, 41], [9, 48], [12, 48], [15, 43], [18, 41], [21, 48]],
    lead: BOX, leadVel: 0.3, leadAttack: 0.006,
    low: SOFT, lowVel: 0.2, lowAttack: 0.006,
    gap: 1.8, wet: 0.4, volume: 0.6,
  },
};

export type BirthdayPlayer = {
  start: () => void;
  setMuted: (muted: boolean) => void;
  stop: () => void;
};

export function createOccasionPlayer(occasion: OccasionId = "birthday"): BirthdayPlayer {
  const song = SONGS[occasion];
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0.0001;

  // A small generated room reverb so the notes bloom a little.
  const convolver = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 2.4);
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  convolver.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = song.wet;

  master.connect(ctx.destination);
  master.connect(convolver);
  convolver.connect(wet);
  wet.connect(ctx.destination);

  function tone(f: number, at: number, partials: Partials, vel: number, attack: number) {
    for (const [ratio, gain, decay] of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f * ratio;
      const end = at + Math.max(decay, attack + 0.05);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(vel * gain, at + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(end + 0.05);
    }
  }

  // Short filtered noise tick: a sleigh bell.
  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
  {
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function jingle(at: number, vel: number) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
    src.connect(hp).connect(g).connect(master);
    src.start(at);
    src.stop(at + 0.1);
  }

  const totalBeats = song.melody.reduce((sum, [, b]) => sum + b, 0);

  function scheduleSong(at: number): number {
    let t = at;
    for (const [midi, beats] of song.melody) {
      if (midi > 0) tone(freq(midi), t, song.lead, song.leadVel, song.leadAttack);
      t += beats * song.beat;
    }
    for (const [beat, midi] of song.bass) tone(freq(midi), at + beat * song.beat, song.low, song.lowVel, song.lowAttack);
    if (song.jingle) {
      for (let b = 0; b < totalBeats; b += 0.5) jingle(at + b * song.beat, b % 1 === 0 ? 0.07 : 0.035);
    }
    return at + totalBeats * song.beat;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  function loop(at: number) {
    if (stopped) return;
    const end = scheduleSong(at);
    const nextAt = end + song.gap;
    timer = setTimeout(() => loop(nextAt), Math.max(0, (end - ctx.currentTime - 0.5) * 1000));
  }

  return {
    start() {
      void ctx.resume();
      master.gain.setTargetAtTime(song.volume, ctx.currentTime, 0.6);
      loop(ctx.currentTime + 0.2);
    },
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0.0001 : song.volume, ctx.currentTime, 0.12);
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      setTimeout(() => void ctx.close(), 800);
    },
  };
}

/** Kept for older imports. */
export const createBirthdayPlayer = () => createOccasionPlayer("birthday");
