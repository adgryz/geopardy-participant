// Sound effects and music of the game.
//
// Everything is synthesised with the Web Audio API – there are no audio files
// to download, so sounds are instant and work offline.
//
// This file is shared 1:1 between geopardy-host and geopardy-participant.

import { useEffect, useState } from "react";

export type SoundName =
  | "tap"
  | "join"
  | "start"
  | "select"
  | "open"
  | "go"
  | "buzz"
  | "correct"
  | "wrong"
  | "noAnswer"
  | "falseStart"
  | "bet"
  | "sent"
  | "reveal"
  | "tick"
  | "tickUrgent"
  | "timeUp"
  | "fanfare"
  | "lose";

export type MusicName = "betting" | "thinking";

const MUTED_KEY = "geopardy.sound.muted";
const SFX_VOLUME = 0.9;
const MUSIC_VOLUME = 0.5;

// ---------------------------------------------------------------------------
// Audio context – browsers allow sound only after the user touched the page,
// so the context is created on the first interaction.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

const loadMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
};
let muted = loadMuted();
const mutedListeners = new Set<(muted: boolean) => void>();

const isRunning = () => !!ctx && ctx.state === "running";

const unlock = () => {
  if (!ctx) {
    const AudioContextClass: typeof AudioContext | undefined =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    ctx = new AudioContextClass();

    // The compressor keeps overlapping sounds from clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.connect(ctx.destination);
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(compressor);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = SFX_VOLUME;
    sfxBus.connect(master);

    const length = ctx.sampleRate;
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    ctx.onstatechange = syncMusic;
  }
  if (ctx.state !== "running") {
    ctx.resume().catch(() => {});
  }
  syncMusic();
};

if (typeof window !== "undefined") {
  ["pointerdown", "keydown", "touchend"].forEach((eventName) =>
    window.addEventListener(eventName, unlock, { capture: true, passive: true })
  );
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ctx) {
      ctx.resume().catch(() => {});
    }
  });
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

type ToneOptions = {
  freq: number;
  // seconds from "now"
  at?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  attack?: number;
  // absolute start time – used by the music scheduler
  time?: number;
};

const tone = (
  dest: AudioNode,
  { freq, at = 0, dur, type = "sine", gain = 0.2, slideTo, attack = 0.005, time }: ToneOptions
) => {
  if (!ctx) return;
  const start = time ?? ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  }
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.linearRampToValueAtTime(gain, start + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  oscillator.connect(envelope);
  envelope.connect(dest);
  oscillator.start(start);
  oscillator.stop(start + dur + 0.05);
};

// Bell / music-box like note: fundamental with two quiet overtones
const bell = (
  dest: AudioNode,
  options: Omit<ToneOptions, "type" | "slideTo">
) => {
  const gain = options.gain ?? 0.2;
  tone(dest, { ...options, gain });
  tone(dest, { ...options, freq: options.freq * 2, gain: gain * 0.35, dur: options.dur * 0.7 });
  tone(dest, { ...options, freq: options.freq * 3.01, gain: gain * 0.12, dur: options.dur * 0.4 });
};

const noise = (
  dest: AudioNode,
  {
    at = 0,
    dur,
    gain = 0.2,
    freq = 1000,
    q = 1,
    time,
  }: { at?: number; dur: number; gain?: number; freq?: number; q?: number; time?: number }
) => {
  if (!ctx || !noiseBuffer) return;
  const start = time ?? ctx.currentTime + at;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(gain, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(dest);
  source.start(start);
  source.stop(start + dur + 0.05);
};

// Note name -> frequency, e.g. "A4" = 440
const SEMITONES: Record<string, number> = {
  C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4,
  "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2,
};
const n = (note: string) => {
  const octave = Number(note.slice(-1));
  return 440 * Math.pow(2, (SEMITONES[note.slice(0, -1)] + (octave - 4) * 12) / 12);
};

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

const SOUNDS: Record<SoundName, (dest: AudioNode) => void> = {
  tap: (d) => tone(d, { freq: 880, dur: 0.06, gain: 0.12 }),

  // new player in the lobby
  join: (d) => {
    tone(d, { freq: 420, slideTo: 880, dur: 0.12, gain: 0.2 });
    bell(d, { freq: n("E6"), at: 0.1, dur: 0.35, gain: 0.1 });
  },

  // game / tournament starts
  start: (d) =>
    ["G4", "C5", "E5", "G5", "C6"].forEach((note, index) =>
      bell(d, { freq: n(note), at: index * 0.09, dur: index === 4 ? 0.9 : 0.3, gain: 0.16 })
    ),

  // question picked from the board
  select: (d) => {
    noise(d, { dur: 0.25, gain: 0.08, freq: 2500, q: 0.7 });
    ["C5", "G5", "E6"].forEach((note, index) =>
      bell(d, { freq: n(note), at: index * 0.06, dur: 0.35, gain: 0.13 })
    );
  },

  // buzzers are open
  open: (d) => {
    bell(d, { freq: n("E5"), dur: 0.5, gain: 0.18 });
    bell(d, { freq: n("B5"), at: 0.12, dur: 0.8, gain: 0.18 });
  },

  // the same moment on a phone – short, so it doesn't cover the host
  go: (d) => bell(d, { freq: n("B5"), dur: 0.25, gain: 0.14 }),

  // somebody buzzed in
  buzz: (d) => {
    [0, 0.11].forEach((at) => {
      tone(d, { freq: 740, at, dur: 0.09, type: "square", gain: 0.11 });
      tone(d, { freq: 1480, at, dur: 0.09, type: "triangle", gain: 0.1 });
    });
  },

  correct: (d) =>
    ["C5", "E5", "G5", "C6"].forEach((note, index) =>
      bell(d, { freq: n(note), at: index * 0.08, dur: index === 3 ? 1 : 0.4, gain: 0.2 })
    ),

  wrong: (d) => {
    tone(d, { freq: 155, slideTo: 105, dur: 0.55, type: "sawtooth", gain: 0.16 });
    tone(d, { freq: 164, slideTo: 111, dur: 0.55, type: "square", gain: 0.07 });
  },

  noAnswer: (d) => {
    tone(d, { freq: n("G4"), dur: 0.22, type: "triangle", gain: 0.2 });
    tone(d, { freq: n("C4"), at: 0.18, dur: 0.45, type: "triangle", gain: 0.2 });
  },

  falseStart: (d) => {
    [0, 0.14].forEach((at) =>
      tone(d, { freq: 185, at, dur: 0.11, type: "square", gain: 0.13 })
    );
  },

  // a bet arrived
  bet: (d) => {
    tone(d, { freq: 1320, dur: 0.07, gain: 0.12 });
    tone(d, { freq: 1760, at: 0.06, dur: 0.12, gain: 0.12 });
  },

  // own bet / answer was sent
  sent: (d) => {
    bell(d, { freq: n("G5"), dur: 0.2, gain: 0.13 });
    bell(d, { freq: n("C6"), at: 0.09, dur: 0.4, gain: 0.13 });
  },

  // hidden answer uncovered
  reveal: (d) => {
    noise(d, { dur: 0.3, gain: 0.1, freq: 1800, q: 0.6 });
    tone(d, { freq: 300, slideTo: 720, dur: 0.18, type: "triangle", gain: 0.16 });
    bell(d, { freq: n("A5"), at: 0.16, dur: 0.6, gain: 0.14 });
  },

  tick: (d) => {
    noise(d, { dur: 0.03, gain: 0.25, freq: 3200, q: 3 });
    tone(d, { freq: 1000, dur: 0.04, type: "triangle", gain: 0.1 });
  },
  tickUrgent: (d) => {
    noise(d, { dur: 0.03, gain: 0.3, freq: 4200, q: 3 });
    tone(d, { freq: 1500, dur: 0.06, type: "triangle", gain: 0.16 });
  },

  // gong
  timeUp: (d) => {
    noise(d, { dur: 0.5, gain: 0.12, freq: 500, q: 0.5 });
    [98, 147.5, 196, 247, 294.5].forEach((freq, index) =>
      tone(d, { freq, dur: 2.2 - index * 0.25, gain: 0.2 - index * 0.03, attack: 0.01 })
    );
  },

  fanfare: (d) => {
    const chord = (notes: string[], at: number, dur: number) =>
      notes.forEach((note) => {
        tone(d, { freq: n(note), at, dur, type: "triangle", gain: 0.13 });
        tone(d, { freq: n(note), at, dur, type: "square", gain: 0.035 });
      });
    chord(["C4", "G4", "C5"], 0, 0.16);
    chord(["C4", "G4", "C5"], 0.18, 0.16);
    chord(["C4", "G4", "C5"], 0.36, 0.16);
    chord(["E4", "C5", "E5"], 0.54, 0.34);
    chord(["D4", "B4", "D5"], 0.9, 0.16);
    chord(["G4", "E5", "G5", "C6"], 1.08, 1.6);
    ["C6", "E6", "G6", "C7"].forEach((note, index) =>
      bell(d, { freq: n(note), at: 1.2 + index * 0.1, dur: 1.2, gain: 0.07 })
    );
  },

  lose: (d) =>
    ["A#3", "A3", "G#3", "G3"].forEach((note, index) => {
      const isLast = index === 3;
      tone(d, {
        freq: n(note),
        slideTo: isLast ? n(note) * 0.9 : undefined,
        at: index * 0.36,
        dur: isLast ? 1 : 0.34,
        type: "sawtooth",
        gain: 0.1,
        attack: 0.03,
      });
      tone(d, { freq: n(note) / 2, at: index * 0.36, dur: isLast ? 1 : 0.34, type: "triangle", gain: 0.12 });
    }),
};

const lastPlayedAt: Partial<Record<SoundName, number>> = {};

export const playSound = (name: SoundName) => {
  // Without a running context the sound would be queued and played much
  // later – after the next click – so it is skipped instead.
  if (muted || !isRunning() || !sfxBus) return;
  // The same sound requested twice at once (e.g. effects run twice by React
  // in development) is played only once.
  const now = performance.now();
  if (now - (lastPlayedAt[name] ?? -Infinity) < 80) return;
  lastPlayedAt[name] = now;
  SOUNDS[name](sfxBus);
};

// ---------------------------------------------------------------------------
// Music – short loops scheduled a moment ahead of the playback
// ---------------------------------------------------------------------------

type Track = {
  stepDuration: number;
  steps: number;
  playStep: (step: number, time: number, dest: AudioNode) => void;
};

// Calm music box – players are thinking about their bets
const BETTING_CHORDS = [
  { bass: "C3", notes: ["E4", "G4", "C5", "E5"] },
  { bass: "A2", notes: ["E4", "A4", "C5", "E5"] },
  { bass: "F2", notes: ["F4", "A4", "C5", "F5"] },
  { bass: "G2", notes: ["D4", "G4", "B4", "D5"] },
];
const BETTING_PATTERN = [0, 2, 1, 3, 2, 1, 3, 2];

// Ticking, a bit tense loop – the clock of the final question is running
const THINKING_CHORDS = [
  { bass: "A2", notes: ["A4", "C5", "E5"] },
  { bass: "F2", notes: ["A4", "C5", "F5"] },
  { bass: "D3", notes: ["A4", "D5", "F5"] },
  { bass: "E2", notes: ["G#4", "B4", "E5"] },
];
const THINKING_PATTERN = [0, 1, 2, 1, 0, 2, 1, 2];
const THINKING_LEAD: Record<number, string> = {
  32: "E6", 35: "D6", 36: "C6", 40: "C6", 43: "A5", 44: "F5",
  48: "D6", 51: "F6", 52: "D6", 56: "E6", 59: "B5", 62: "G#5",
};

const TRACKS: Record<MusicName, Track> = {
  betting: {
    stepDuration: 0.34,
    steps: 32,
    playStep: (step, time, dest) => {
      const chord = BETTING_CHORDS[Math.floor(step / 8) % 4];
      const position = step % 8;
      if (position === 0) {
        tone(dest, { freq: n(chord.bass), time, dur: 2.6, type: "triangle", gain: 0.2, attack: 0.04 });
        chord.notes.slice(0, 3).forEach((note) =>
          tone(dest, { freq: n(note) / 2, time, dur: 2.7, gain: 0.05, attack: 0.5 })
        );
      }
      bell(dest, {
        freq: n(chord.notes[BETTING_PATTERN[position]]),
        time,
        dur: 0.9,
        gain: position % 2 ? 0.07 : 0.1,
      });
    },
  },
  thinking: {
    stepDuration: 0.25,
    steps: 64,
    playStep: (step, time, dest) => {
      const chord = THINKING_CHORDS[Math.floor(step / 8) % 4];
      const position = step % 8;
      // tick-tock on every beat
      if (position % 2 === 0) {
        const isTock = position % 4 === 2;
        noise(dest, { time, dur: 0.03, gain: 0.16, freq: isTock ? 2000 : 2900, q: 4 });
        tone(dest, { freq: isTock ? 620 : 830, time, dur: 0.04, type: "triangle", gain: 0.07 });
      }
      if (position === 0 || position === 3 || position === 6) {
        tone(dest, {
          freq: n(chord.bass) * (position === 6 ? 1.5 : 1),
          time,
          dur: 0.4,
          type: "triangle",
          gain: 0.26,
        });
      }
      // plucked arpeggio
      tone(dest, {
        freq: n(chord.notes[THINKING_PATTERN[position]]),
        time,
        dur: 0.22,
        type: "triangle",
        gain: 0.1,
      });
      const lead = THINKING_LEAD[step];
      if (lead) {
        bell(dest, { freq: n(lead), time, dur: 0.7, gain: 0.07 });
      }
    },
  },
};

const SCHEDULE_AHEAD = 0.25;
const FADE_OUT = 0.5;

let wantedMusic: MusicName | null = null;
let playing: {
  name: MusicName;
  bus: GainNode;
  intervalId: ReturnType<typeof setInterval>;
} | null = null;

const stopPlaying = () => {
  if (!playing || !ctx) return;
  const { bus, intervalId } = playing;
  playing = null;
  clearInterval(intervalId);
  const now = ctx.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setValueAtTime(bus.gain.value, now);
  bus.gain.linearRampToValueAtTime(0, now + FADE_OUT);
  setTimeout(() => bus.disconnect(), (FADE_OUT + 0.1) * 1000);
};

const startPlaying = (name: MusicName) => {
  if (!ctx || !master) return;
  const audio = ctx;
  const track = TRACKS[name];
  const bus = audio.createGain();
  bus.gain.setValueAtTime(0, audio.currentTime);
  bus.gain.linearRampToValueAtTime(MUSIC_VOLUME, audio.currentTime + 0.3);
  bus.connect(master);

  let step = 0;
  let nextStepTime = audio.currentTime + 0.08;
  const schedule = () => {
    // The tab was in the background – don't play the missed part at once
    if (nextStepTime < audio.currentTime) {
      nextStepTime = audio.currentTime + 0.05;
    }
    while (nextStepTime < audio.currentTime + SCHEDULE_AHEAD) {
      track.playStep(step, nextStepTime, bus);
      step = (step + 1) % track.steps;
      nextStepTime += track.stepDuration;
    }
  };
  schedule();
  playing = { name, bus, intervalId: setInterval(schedule, 60) };
};

function syncMusic() {
  const target = isRunning() ? wantedMusic : null;
  if (playing?.name === target || (!playing && !target)) return;
  stopPlaying();
  if (target) startPlaying(target);
}

/** Starts a looped track (or stops the music with `null`). */
export const setMusic = (name: MusicName | null) => {
  wantedMusic = name;
  syncMusic();
};

// ---------------------------------------------------------------------------
// Mute
// ---------------------------------------------------------------------------

export const isSoundMuted = () => muted;

export const setSoundMuted = (newMuted: boolean) => {
  muted = newMuted;
  try {
    localStorage.setItem(MUTED_KEY, newMuted ? "1" : "0");
  } catch {}
  if (ctx && master) {
    master.gain.setTargetAtTime(newMuted ? 0 : 1, ctx.currentTime, 0.02);
  }
  mutedListeners.forEach((listener) => listener(newMuted));
};

// ---------------------------------------------------------------------------
// React helpers
// ---------------------------------------------------------------------------

export const useSoundMuted = () => {
  const [value, setValue] = useState(muted);
  useEffect(() => {
    setValue(muted);
    mutedListeners.add(setValue);
    return () => {
      mutedListeners.delete(setValue);
    };
  }, []);
  return value;
};

/** Plays the track for as long as the component shows it. */
export const useMusic = (name: MusicName | null) => {
  useEffect(() => {
    setMusic(name);
    return () => setMusic(null);
  }, [name]);
};

// Only for debugging in the browser console
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__geopardySound = {
    playSound,
    setMusic,
    state: () => ({
      context: ctx?.state ?? null,
      muted,
      wantedMusic,
      playingMusic: playing?.name ?? null,
    }),
  };
}
