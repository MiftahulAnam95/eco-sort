/* ==========================================================================
   EcoSort — store.tsx
   --------------------------------------------------------------------------
   Pusat state aplikasi (React Context) yang menghubungkan:
   data LocalStorage  <->  pengaturan  <->  progres  <->  pencapaian  <->  toast
   Semua halaman membaca data dari sini, jadi tidak ada state ganda.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WASTE_ITEMS } from "./data/waste";
import { ACHIEVEMENTS, findNewAchievements, type RoundResult } from "./lib/game";
import { unlockAudio, playSfx, type SfxName } from "./lib/audio";
import {
  CAN_STORE,
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  cloneProgress,
  loadAchievements,
  loadHistory,
  loadProgress,
  loadSettings,
  saveAchievements,
  saveHistory,
  saveProgress,
  saveSettings,
  clearAllData,
  type AchievementStore,
  type Progress,
  type RoundSummary,
  type Settings,
} from "./lib/storage";

export interface Toast {
  id: string;
  title: string;
  message: string;
  tone: "info" | "success" | "danger" | "achievement";
  icon?: string;
}

interface StoreValue {
  ready: boolean;
  storageOk: boolean;
  settings: Settings;
  progress: Progress;
  achievements: AchievementStore;
  history: RoundSummary[];
  toasts: Toast[];
  updateSettings: (patch: Partial<Settings>) => void;
  commitRound: (result: RoundResult) => void;
  recordItemView: (itemId: string) => void;
  resetProgress: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  sfx: (name: SfxName) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<Progress>(() => cloneProgress(DEFAULT_PROGRESS));
  const [achievements, setAchievements] = useState<AchievementStore>({});
  const [history, setHistory] = useState<RoundSummary[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  /* ---------- baca data tersimpan saat pertama kali dimuat ----------
     Data demo/tidak pernah menimpa progres pengguna: bila LocalStorage
     kosong, nilai default dipakai; bila ada, nilai itu yang dipakai. */
  useEffect(() => {
    setSettings(loadSettings());
    setProgress(loadProgress());
    setAchievements(loadAchievements());
    setHistory(loadHistory());
    setReady(true);
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  /* ---------- terapkan pengaturan ke elemen <html> ---------- */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.classList.toggle("no-motion", !settings.animations);
  }, [settings.theme, settings.animations]);

  /* ---------- buka AudioContext setelah interaksi pertama ---------- */
  useEffect(() => {
    const onFirstGesture = () => unlockAudio();
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== id));
    }, 4200);
    timers.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const sfx = useCallback(
    (name: SfxName) => {
      playSfx(name, settings.sound);
    },
    [settings.sound]
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  /* Ref cermin agar perhitungan pencapaian tidak dilakukan di dalam updater state
     (updater bisa dipanggil lebih dari sekali oleh React StrictMode). */
  const progressRef = useRef<Progress>(progress);
  const achievementsRef = useRef<AchievementStore>(achievements);
  progressRef.current = progress;
  achievementsRef.current = achievements;

  /** Simpan progres + periksa pencapaian yang baru terbuka + munculkan notifikasi. */
  const applyProgress = useCallback(
    (updater: (current: Progress) => Progress) => {
      const next = updater(progressRef.current);
      if (next === progressRef.current) return;
      progressRef.current = next;
      setProgress(next);
      saveProgress(next);

      const unlocked = findNewAchievements(next, achievementsRef.current);
      if (unlocked.length === 0) return;

      const stamp = new Date().toISOString();
      const nextAchievements = { ...achievementsRef.current };
      unlocked.forEach((achievement) => {
        nextAchievements[achievement.id] = stamp;
      });
      achievementsRef.current = nextAchievements;
      setAchievements(nextAchievements);
      saveAchievements(nextAchievements);
      playSfx("achievement", settings.sound);

      unlocked.forEach((achievement, index) => {
        const timer = window.setTimeout(() => {
          pushToast({
            title: "Pencapaian terbuka!",
            message: `${achievement.name} — ${achievement.description}`,
            tone: "achievement",
            icon: achievement.icon,
          });
        }, index * 700);
        timers.current.push(timer);
      });
    },
    [pushToast, settings.sound]
  );

  const commitRound = useCallback(
    (result: RoundResult) => {
      const answeredCategories = result.answers.map((answer) => answer.correctCategory);
      applyProgress((current) => ({
        xp: current.xp + result.xp,
        gamesPlayed: current.gamesPlayed + 1,
        totalCorrect: current.totalCorrect + result.correct,
        totalWrong: current.totalWrong + result.wrong,
        bestStreak: Math.max(current.bestStreak, result.bestStreak),
        perfectRounds: current.perfectRounds + (result.perfect ? 1 : 0),
        bestRoundScore: Math.max(current.bestRoundScore, result.score),
        bestTimeCorrect:
          result.mode === "time" ? Math.max(current.bestTimeCorrect, result.correct) : current.bestTimeCorrect,
        bestScore: {
          ...current.bestScore,
          [result.mode]: Math.max(current.bestScore[result.mode] ?? 0, result.score),
        },
        categoriesSeen: Array.from(
          new Set([...current.categoriesSeen, ...answeredCategories])
        ),
        viewedItems: current.viewedItems,
        lastPlayed: new Date().toISOString(),
      }));

      const summary: RoundSummary = {
        id: result.id,
        mode: result.mode,
        score: result.score,
        correct: result.correct,
        wrong: result.wrong,
        accuracy: result.accuracy,
        durationMs: result.durationMs,
        bestStreak: result.bestStreak,
        xp: result.xp,
        perfect: result.perfect,
        date: new Date().toISOString(),
      };
      setHistory((current) => {
        const next = [summary, ...current].slice(0, 12);
        saveHistory(next);
        return next;
      });
    },
    [applyProgress]
  );

  /** Dicatat saat pemain membuka detail item di Ensiklopedia (untuk pencapaian Kutu Buku Hijau). */
  const recordItemView = useCallback(
    (itemId: string) => {
      if (!WASTE_ITEMS.some((item) => item.id === itemId)) return;
      applyProgress((current) =>
        current.viewedItems.includes(itemId)
          ? current
          : { ...current, viewedItems: [...current.viewedItems, itemId].slice(0, WASTE_ITEMS.length) }
      );
    },
    [applyProgress]
  );

  const resetProgress = useCallback(() => {
    clearAllData();
    setProgress(cloneProgress(DEFAULT_PROGRESS));
    setAchievements({});
    setHistory([]);
    saveProgress(cloneProgress(DEFAULT_PROGRESS));
    pushToast({
      title: "Progres direset",
      message: "Semua data permainan di browser ini sudah dihapus.",
      tone: "danger",
    });
  }, [pushToast]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      storageOk: CAN_STORE,
      settings,
      progress,
      achievements,
      history,
      toasts,
      updateSettings,
      commitRound,
      recordItemView,
      resetProgress,
      pushToast,
      dismissToast,
      sfx,
    }),
    [
      ready,
      settings,
      progress,
      achievements,
      history,
      toasts,
      updateSettings,
      commitRound,
      recordItemView,
      resetProgress,
      pushToast,
      dismissToast,
      sfx,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam <StoreProvider>");
  return ctx;
}

export const ACHIEVEMENT_LIST = ACHIEVEMENTS;
