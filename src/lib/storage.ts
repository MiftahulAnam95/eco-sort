/* ==========================================================================
   EcoSort — storage.ts (Anggota 3: Penyimpanan & Data)
   --------------------------------------------------------------------------
   Semua progres disimpan di LocalStorage browser perangkat ini.
   Fungsi baca/tulis dibungkus try-catch agar website tetap jalan walaupun
   LocalStorage diblokir, penuh, atau isinya rusak.

   Key yang dipakai (konsisten, tidak diubah-ubah):
     ecosort_settings      -> preferensi pengguna (suara, animasi, tema)
     ecosort_progress      -> XP, total main, benar/salah, streak, dll.
     ecosort_achievements  -> daftar pencapaian yang sudah terbuka
     ecosort_history       -> ringkasan ronde terakhir
   ========================================================================== */

import type { CategoryId } from "../data/waste";
import type { GameMode } from "./game";

export const STORAGE_KEYS = {
  settings: "ecosort_settings",
  progress: "ecosort_progress",
  achievements: "ecosort_achievements",
  history: "ecosort_history",
} as const;

export type ThemeName = "light" | "dim";

export interface Settings {
  sound: boolean;
  animations: boolean;
  theme: ThemeName;
}

export interface Progress {
  xp: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  perfectRounds: number;
  bestRoundScore: number;
  bestTimeCorrect: number;
  bestScore: Record<GameMode, number>;
  categoriesSeen: CategoryId[];
  viewedItems: string[];
  lastPlayed: string | null;
}

export interface RoundSummary {
  id: string;
  mode: GameMode;
  score: number;
  correct: number;
  wrong: number;
  accuracy: number;
  durationMs: number;
  bestStreak: number;
  xp: number;
  perfect: boolean;
  date: string;
}

/** id pencapaian -> waktu terbuka (ISO string) */
export type AchievementStore = Record<string, string>;

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  animations: true,
  theme: "light",
};

export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  perfectRounds: 0,
  bestRoundScore: 0,
  bestTimeCorrect: 0,
  bestScore: { classic: 0, time: 0, learn: 0 },
  categoriesSeen: [],
  viewedItems: [],
  lastPlayed: null,
};

/* ---------------- utilitas dasar ---------------- */

function storageAvailable(): boolean {
  try {
    const probe = "__ecosort_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const CAN_STORE = typeof window !== "undefined" && storageAvailable();

function readJSON<T>(key: string): T | null {
  if (!CAN_STORE) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Data rusak / bukan JSON -> dianggap kosong agar aplikasi tidak crash
    return null;
  }
}

function writeJSON(key: string, value: unknown): boolean {
  if (!CAN_STORE) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;

const asBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

/* ---------------- settings ---------------- */

export function loadSettings(): Settings {
  const raw = readJSON<Partial<Settings>>(STORAGE_KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return {
    sound: asBoolean(raw.sound, DEFAULT_SETTINGS.sound),
    animations: asBoolean(raw.animations, DEFAULT_SETTINGS.animations),
    theme: raw.theme === "dim" || raw.theme === "light" ? raw.theme : DEFAULT_SETTINGS.theme,
  };
}

export function saveSettings(settings: Settings): void {
  writeJSON(STORAGE_KEYS.settings, settings);
}

/* ---------------- progress ---------------- */

export function loadProgress(): Progress {
  const raw = readJSON<Partial<Progress>>(STORAGE_KEYS.progress);
  if (!raw) return structuredCloneSafe(DEFAULT_PROGRESS);

  const bestScoreRaw = (raw.bestScore ?? {}) as Partial<Record<GameMode, number>>;
  return {
    xp: asNumber(raw.xp),
    gamesPlayed: asNumber(raw.gamesPlayed),
    totalCorrect: asNumber(raw.totalCorrect),
    totalWrong: asNumber(raw.totalWrong),
    bestStreak: asNumber(raw.bestStreak),
    perfectRounds: asNumber(raw.perfectRounds),
    bestRoundScore: asNumber(raw.bestRoundScore),
    bestTimeCorrect: asNumber(raw.bestTimeCorrect),
    bestScore: {
      classic: asNumber(bestScoreRaw.classic),
      time: asNumber(bestScoreRaw.time),
      learn: asNumber(bestScoreRaw.learn),
    },
    categoriesSeen: (asStringArray(raw.categoriesSeen) as CategoryId[]).filter((cat) =>
      ["organik", "daurulang", "residu", "b3"].includes(cat)
    ),
    viewedItems: asStringArray(raw.viewedItems),
    lastPlayed: typeof raw.lastPlayed === "string" ? raw.lastPlayed : null,
  };
}

export function saveProgress(progress: Progress): void {
  writeJSON(STORAGE_KEYS.progress, progress);
}

/* ---------------- achievements ---------------- */

const VALID_CATEGORY_IDS = ["organik", "daurulang", "residu", "b3"];

export function loadAchievements(): AchievementStore {
  const raw = readJSON<AchievementStore>(STORAGE_KEYS.achievements);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const clean: AchievementStore = {};
  Object.entries(raw).forEach(([id, at]) => {
    if (typeof id === "string" && typeof at === "string") clean[id] = at;
  });
  return clean;
}

export function saveAchievements(store: AchievementStore): void {
  writeJSON(STORAGE_KEYS.achievements, store);
}

/* ---------------- history ---------------- */

const MAX_HISTORY = 12;

export function loadHistory(): RoundSummary[] {
  const raw = readJSON<RoundSummary[]>(STORAGE_KEYS.history);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry && typeof entry === "object" && typeof entry.id === "string")
    .map((entry) => ({
      id: entry.id,
      mode: (["classic", "time", "learn"] as GameMode[]).includes(entry.mode) ? entry.mode : "classic",
      score: asNumber(entry.score),
      correct: asNumber(entry.correct),
      wrong: asNumber(entry.wrong),
      accuracy: asNumber(entry.accuracy),
      durationMs: asNumber(entry.durationMs),
      bestStreak: asNumber(entry.bestStreak),
      xp: asNumber(entry.xp),
      perfect: entry.perfect === true,
      date: typeof entry.date === "string" ? entry.date : new Date().toISOString(),
    }))
    .slice(0, MAX_HISTORY);
}

export function saveHistory(history: RoundSummary[]): void {
  writeJSON(STORAGE_KEYS.history, history.slice(0, MAX_HISTORY));
}

export function clearAllData(): void {
  if (!CAN_STORE) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* abaikan bila gagal */
    }
  });
}

/* ---------------- helper kecil ---------------- */

function structuredCloneSafe(value: Progress): Progress {
  return JSON.parse(JSON.stringify(value)) as Progress;
}

export function cloneProgress(value: Progress): Progress {
  return structuredCloneSafe(value);
}

export const CATEGORY_IDS = VALID_CATEGORY_IDS as CategoryId[];
