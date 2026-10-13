/* ==========================================================================
   EcoSort — game.ts (Anggota 1: Game Logic)
   --------------------------------------------------------------------------
   Berisi SEMUA aturan permainan dalam satu tempat supaya mudah dijelaskan
   saat presentasi: konfigurasi mode, pengacakan soal, skor, streak, XP,
   level, akurasi, dan syarat pencapaian.
   ========================================================================== */

import { WASTE_ITEMS, type CategoryId, type WasteItem } from "../data/waste";
import type { Progress } from "./storage";

export type GameMode = "classic" | "time" | "learn";

/* ---------------- 1. KONFIGURASI MODE ---------------- */

export interface ModeConfig {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  icon: "target" | "timer" | "book";
  questions: number; // jumlah soal per ronde (0 = tidak dibatasi jumlah soal)
  durationMs: number; // 0 = tanpa batas waktu
  lives: number; // 0 = tanpa nyawa
  rules: string[];
  accent: string; // kelas warna Tailwind
}

export const MODES: Record<GameMode, ModeConfig> = {
  classic: {
    id: "classic",
    name: "Classic Mode",
    tagline: "10 soal, tanpa waktu",
    description:
      "Mode utama untuk belajar. Sepuluh sampah muncul satu per satu, pilih tempat yang tepat, dan lihat penjelasannya langsung.",
    icon: "target",
    questions: 10,
    durationMs: 0,
    lives: 0,
    rules: [
      "10 pertanyaan per ronde, soal tidak diulang",
      "Benar +100 poin, streak memberi bonus",
      "Feedback muncul setelah setiap jawaban",
    ],
    accent: "primary",
  },
  time: {
    id: "time",
    name: "Time Challenge",
    tagline: "60 detik, 3 nyawa",
    description:
      "Uji kecepatan dan ketelitian. Pilah sebanyak mungkin sampah sebelum waktu habis atau nyawa terkuras.",
    icon: "timer",
    questions: 0,
    durationMs: 60_000,
    lives: 3,
    rules: [
      "Waktu 60 detik, dihitung mundur akurat walau tab berpindah",
      "Benar langsung lanjut; salah membekukan waktu sebentar agar penjelasan terbaca",
      "Salah = kehilangan 1 nyawa, 3 nyawa habis = ronde selesai",
      "Aturan skor & bonus streak sama dengan Classic",
    ],
    accent: "warn",
  },
  learn: {
    id: "learn",
    name: "Learning Mode",
    tagline: "Santai, tanpa tekanan",
    description:
      "Baca nama dan ciri sampah, pilih kategori, lalu baca penjelasan lengkap. Salah tidak mengurangi skor maupun nyawa.",
    icon: "book",
    questions: 10,
    durationMs: 0,
    lives: 0,
    rules: [
      "Tidak ada timer dan tidak ada nyawa",
      "Penjelasan kategori & alasan jawaban selalu ditampilkan",
      "Kamu memutuskan sendiri kapan lanjut ke soal berikutnya",
    ],
    accent: "rec",
  },
};

export const MODE_LIST: ModeConfig[] = [MODES.classic, MODES.time, MODES.learn];

/* ---------------- 2. ATURAN SKOR ---------------- */

export const SCORE_CORRECT = 100; // jawaban benar
export const STREAK_BONUS = 25; // bonus per jawaban benar beruntun
export const STREAK_BONUS_FROM = 3; // mulai berlaku pada jawaban benar ke-3

/**
 * Menghitung poin satu jawaban.
 * streakBefore = jumlah benar beruntun SEBELUM jawaban ini.
 * Benar  -> 100 (+25 bila streak setelah menjawab sudah >= 3)
 * Salah  -> 0 dan streak direset di pemanggil
 */
export function pointsForAnswer(isCorrect: boolean, streakBefore: number): number {
  if (!isCorrect) return 0;
  const streakAfter = streakBefore + 1;
  return SCORE_CORRECT + (streakAfter >= STREAK_BONUS_FROM ? STREAK_BONUS : 0);
}

/* ---------------- 3. XP & LEVEL ---------------- */

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextTitle: string | null;
  nextMinXp: number | null;
  into: number; // XP yang sudah dikumpulkan di level ini
  span: number; // rentang XP level ini
  pct: number; // 0..100 progres menuju level berikutnya
  remaining: number;
}

export const LEVELS: { level: number; title: string; minXp: number; blurb: string }[] = [
  { level: 1, title: "Pemula Hijau", minXp: 0, blurb: "Baru mulai mengenal jenis sampah." },
  { level: 2, title: "Eco Explorer", minXp: 250, blurb: "Sudah paham empat kategori dasar." },
  { level: 3, title: "Eco Ranger", minXp: 700, blurb: "Jarang tertukar antara residu dan daur ulang." },
  { level: 4, title: "Eco Hero", minXp: 1400, blurb: "Cepat, teliti, dan konsisten." },
  { level: 5, title: "Eco Legend", minXp: 2400, blurb: "Jago pilah sampah sejati. Ajari temanmu!" },
];

export function levelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (safeXp >= LEVELS[i].minXp) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = next ? safeXp - current.minXp : span;
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextTitle: next ? next.title : null,
    nextMinXp: next ? next.minXp : null,
    into,
    span,
    pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100,
    remaining: next ? Math.max(0, next.minXp - safeXp) : 0,
  };
}

/**
 * XP didapat HANYA dari hasil ronde yang tersimpan, bukan dari berpindah halaman.
 * Classic/Time : benar x 20, bonus streak (bila >= 3) x 5, sempurna +50
 * Learning     : benar x 10 (mode santai, XP lebih kecil)
 */
export function xpForRound(
  mode: GameMode,
  correct: number,
  perfect: boolean,
  bestStreak: number
): number {
  if (mode === "learn") return correct * 10;
  const base = correct * 20;
  const streakBonus = bestStreak >= STREAK_BONUS_FROM ? bestStreak * 5 : 0;
  const perfectBonus = perfect ? 50 : 0;
  return base + streakBonus + perfectBonus;
}

/* ---------------- 4. AKURASI ---------------- */

/** Akurasi = benar / dijawab x 100. Aman dari pembagian dengan nol. */
export function computeAccuracy(correct: number, answered: number): number {
  if (!answered || answered <= 0) return 0;
  return Math.round((correct / answered) * 100);
}

/* ---------------- 5. PENGACAKAN SOAL ---------------- */

export function shuffle<T>(list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Menyusun daftar soal: urutan DIACAK, tetapi pasangan sampah-kategori
 * jawaban yang benar TIDAK pernah diubah. Tidak ada pengulangan item
 * selama jumlah item mencukupi.
 */
export function buildDeck(count: number): WasteItem[] {
  const pool = shuffle(WASTE_ITEMS);
  if (count <= pool.length) return pool.slice(0, count);
  // Bila diminta lebih banyak dari jumlah item, ulang pool tanpa pengulangan bersebelahan
  const deck: WasteItem[] = [];
  let guard = 0;
  while (deck.length < count && guard < 50) {
    const batch = shuffle(WASTE_ITEMS);
    batch.forEach((item) => {
      if (deck.length >= count) return;
      const last = deck[deck.length - 1];
      if (last && last.id === item.id) return;
      deck.push(item);
    });
    guard += 1;
  }
  return deck;
}

/** Sumber soal tak terbatas untuk Time Challenge (tanpa pengulangan bersebelahan). */
export function createDeckStream() {
  let queue: WasteItem[] = shuffle(WASTE_ITEMS);
  let lastId: string | null = null;
  return {
    next(): WasteItem {
      if (queue.length === 0) queue = shuffle(WASTE_ITEMS);
      let item = queue.shift() as WasteItem;
      if (lastId && item.id === lastId) {
        if (queue.length === 0) queue = shuffle(WASTE_ITEMS);
        const swapWith = queue.shift() as WasteItem;
        queue.push(item);
        item = swapWith;
      }
      lastId = item.id;
      return item;
    },
  };
}

/* ---------------- 6. REKAMAN RONDE ---------------- */

export interface AnswerRecord {
  itemId: string;
  itemName: string;
  itemEmoji: string;
  chosen: CategoryId | null; // null = dilewati pemain (Learning Mode)
  correctCategory: CategoryId;
  isCorrect: boolean;
  pointsGained: number;
  timeSpentMs: number;
}

export type RoundEndReason = "finished" | "timeout" | "lives" | "quit";

export interface RoundResult {
  id: string;
  mode: GameMode;
  answers: AnswerRecord[];
  score: number;
  correct: number;
  wrong: number;
  accuracy: number;
  bestStreak: number;
  durationMs: number;
  xp: number;
  perfect: boolean;
  levelBefore: number;
  levelAfter: number;
  endReason: RoundEndReason;
}

/** Menggabungkan rekaman jawaban menjadi hasil ronde yang siap disimpan. */
export function buildRoundResult(params: {
  mode: GameMode;
  answers: AnswerRecord[];
  score: number;
  bestStreak: number;
  durationMs: number;
  xpBefore: number;
  endReason: RoundEndReason;
}): RoundResult {
  const answered = params.answers.length;
  const correct = params.answers.filter((a) => a.isCorrect).length;
  const wrong = answered - correct;
  const totalNeeded = MODES[params.mode].questions;
  const perfect =
    params.mode !== "learn" && answered > 0 && wrong === 0 && (totalNeeded === 0 || answered >= totalNeeded);
  const xp = xpForRound(params.mode, correct, perfect, params.bestStreak);
  return {
    id: `round_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    mode: params.mode,
    answers: params.answers,
    score: params.score,
    correct,
    wrong,
    accuracy: computeAccuracy(correct, answered),
    bestStreak: params.bestStreak,
    durationMs: Math.max(0, Math.round(params.durationMs)),
    xp,
    perfect,
    levelBefore: levelInfo(params.xpBefore).level,
    levelAfter: levelInfo(params.xpBefore + xp).level,
    endReason: params.endReason,
  };
}

/** Pesan hasil yang ramah, tidak menggurui. */
export function resultMessage(result: RoundResult): string {
  if (result.correct === 0) {
    return "Langkah kecilmu berarti. Coba lagi dan tingkatkan skormu!";
  }
  if (result.accuracy >= 90) return "Mantap! Kamu semakin jago memilah sampah.";
  if (result.accuracy >= 70) return "Hampir sempurna! Yuk, pelajari kembali beberapa kategori.";
  if (result.accuracy >= 50) return "Bagus, sudah mulai terasa polanya. Satu ronde lagi pasti lebih rapi.";
  return "Tidak apa-apa salah, justru dari situ kita belajar. Coba sekali lagi, ya!";
}

/* ---------------- 7. PENCAPAIAN ---------------- */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "flag" | "sprout" | "target" | "flame" | "compass" | "calendar" | "bolt" | "book" | "trophy";
  goal: number;
  valueOf: (progress: Progress) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_sort",
    name: "First Sort",
    description: "Menyelesaikan permainan pertama.",
    icon: "flag",
    goal: 1,
    valueOf: (p) => p.gamesPlayed,
  },
  {
    id: "eco_beginner",
    name: "Eco Beginner",
    description: "Menjawab 5 pertanyaan dengan benar.",
    icon: "sprout",
    goal: 5,
    valueOf: (p) => p.totalCorrect,
  },
  {
    id: "perfect_round",
    name: "Perfect Round",
    description: "Menyelesaikan satu ronde penuh tanpa kesalahan.",
    icon: "target",
    goal: 1,
    valueOf: (p) => p.perfectRounds,
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Menjawab 5 soal benar berturut-turut.",
    icon: "flame",
    goal: 5,
    valueOf: (p) => p.bestStreak,
  },
  {
    id: "eco_explorer",
    name: "Eco Explorer",
    description: "Mencoba soal dari seluruh kategori (organik, daur ulang, residu, B3).",
    icon: "compass",
    goal: 4,
    valueOf: (p) => p.categoriesSeen.length,
  },
  {
    id: "consistent_learner",
    name: "Consistent Learner",
    description: "Menyelesaikan 5 ronde permainan.",
    icon: "calendar",
    goal: 5,
    valueOf: (p) => p.gamesPlayed,
  },
  {
    id: "speed_sorter",
    name: "Speed Sorter",
    description: "Menjawab 15 sampah dengan benar dalam satu ronde Time Challenge.",
    icon: "bolt",
    goal: 15,
    valueOf: (p) => p.bestTimeCorrect,
  },
  {
    id: "bookworm",
    name: "Kutu Buku Hijau",
    description: "Mempelajari 10 item di Ensiklopedia Sampah.",
    icon: "book",
    goal: 10,
    valueOf: (p) => p.viewedItems.length,
  },
  {
    id: "point_hoarder",
    name: "Poin Penuh",
    description: "Mencetak skor 1.200 atau lebih dalam satu ronde.",
    icon: "trophy",
    goal: 1200,
    valueOf: (p) => p.bestRoundScore,
  },
];

/**
 * Memeriksa pencapaian yang baru terbuka.
 * Pencapaian HANYA terbuka bila syarat datanya terpenuhi, tidak pernah
 * dibuka hanya karena pemain melihat halaman pencapaian.
 */
export function findNewAchievements(
  progress: Progress,
  alreadyUnlocked: Record<string, string>
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !alreadyUnlocked[achievement.id] && achievement.valueOf(progress) >= achievement.goal
  );
}

/* ---------------- 8. FORMAT WAKTU ---------------- */

export function formatClock(ms: number): string {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const safe = Math.max(0, Math.round(ms / 1000));
  if (safe < 60) return `${safe} detik`;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes} menit ${seconds} detik`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
