/* ==========================================================================
   EcoSort — audio.ts
   --------------------------------------------------------------------------
   Efek suara dibuat dengan Web Audio API (tanpa file audio eksternal), jadi
   tidak ada aset yang bisa hilang dan ukurannya nol byte.
   Suara HANYA berbunyi setelah ada interaksi pengguna (tidak ada autoplay)
   dan website tetap berfungsi normal bila suara dimatikan/tidak tersedia.
   ========================================================================== */

export type SfxName = "click" | "correct" | "wrong" | "achievement" | "start" | "finish" | "pop";

let audioCtx: AudioContext | null = null;
let unlockTried = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Dipanggil sekali saat pengguna pertama kali berinteraksi dengan halaman. */
export function unlockAudio(): void {
  if (unlockTried) return;
  unlockTried = true;
  getContext();
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

function tone(ctx: AudioContext, options: ToneOptions): void {
  const { freq, duration, type = "sine", gain = 0.08, delay = 0, slideTo } = options;
  const startAt = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, startAt + duration);
  amp.gain.setValueAtTime(0.0001, startAt);
  amp.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.03);
}

const RECIPES: Record<SfxName, ToneOptions[]> = {
  click: [{ freq: 520, duration: 0.06, type: "triangle", gain: 0.05 }],
  pop: [{ freq: 700, duration: 0.07, type: "sine", gain: 0.05, slideTo: 940 }],
  correct: [
    { freq: 587.33, duration: 0.12, type: "triangle", gain: 0.07 },
    { freq: 880, duration: 0.16, type: "triangle", gain: 0.06, delay: 0.09 },
  ],
  wrong: [
    { freq: 220, duration: 0.18, type: "sawtooth", gain: 0.045, slideTo: 150 },
    { freq: 160, duration: 0.2, type: "square", gain: 0.03, delay: 0.06 },
  ],
  achievement: [
    { freq: 659.25, duration: 0.12, type: "triangle", gain: 0.06 },
    { freq: 783.99, duration: 0.12, type: "triangle", gain: 0.06, delay: 0.1 },
    { freq: 987.77, duration: 0.2, type: "triangle", gain: 0.06, delay: 0.2 },
  ],
  start: [
    { freq: 392, duration: 0.1, type: "sine", gain: 0.06 },
    { freq: 587.33, duration: 0.14, type: "sine", gain: 0.06, delay: 0.09 },
  ],
  finish: [
    { freq: 523.25, duration: 0.16, type: "triangle", gain: 0.06 },
    { freq: 659.25, duration: 0.16, type: "triangle", gain: 0.06, delay: 0.12 },
    { freq: 783.99, duration: 0.26, type: "triangle", gain: 0.06, delay: 0.24 },
  ],
};

/** Memutar satu efek suara. Bila enabled=false atau browser tidak mendukung, diam saja. */
export function playSfx(name: SfxName, enabled = true): void {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    RECIPES[name].forEach((options) => tone(ctx, options));
  } catch {
    /* suara tidak boleh menghentikan permainan */
  }
}
