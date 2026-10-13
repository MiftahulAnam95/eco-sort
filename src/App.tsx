/* ==========================================================================
   EcoSort — App.tsx (kerangka aplikasi / navigasi)
   --------------------------------------------------------------------------
   Navigasi memakai hash (#/main, #/hasil, ...) sehingga tombol kembali
   browser berfungsi dan halaman tidak perlu dimuat ulang saat berpindah menu.
   Semua halaman dibungkus StoreProvider agar membaca data dari satu sumber.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { StoreProvider, useStore } from "./store";
import LandingPage from "./pages/LandingPage";
import ModesPage from "./pages/ModesPage";
import PlayPage from "./pages/PlayPage";
import ResultPage from "./pages/ResultPage";
import EncyclopediaPage from "./pages/EncyclopediaPage";
import AchievementsPage from "./pages/AchievementsPage";
import SettingsPage from "./pages/SettingsPage";
import { ToastHost } from "./components/ui";
import { Icon, type IconName } from "./components/icons";
import { levelInfo, type GameMode, type RoundResult } from "./lib/game";
import { CATEGORIES, type CategoryId } from "./data/waste";
import { cn } from "./utils/cn";

type View = "home" | "modes" | "play" | "result" | "encyclopedia" | "achievements" | "settings";

const HASH_BY_VIEW: Record<View, string> = {
  home: "#/",
  modes: "#/main",
  play: "#/bermain",
  result: "#/hasil",
  encyclopedia: "#/ensiklopedia",
  achievements: "#/pencapaian",
  settings: "#/pengaturan",
};

const VIEW_BY_SEGMENT: Record<string, View> = {
  "": "home",
  main: "modes",
  mainkan: "modes",
  bermain: "play",
  hasil: "result",
  ensiklopedia: "encyclopedia",
  pencapaian: "achievements",
  pengaturan: "settings",
};

const NAV_ITEMS: { view: View; label: string; icon: IconName }[] = [
  { view: "home", label: "Beranda", icon: "home" },
  { view: "modes", label: "Main", icon: "play" },
  { view: "encyclopedia", label: "Ensiklopedia", icon: "book" },
  { view: "achievements", label: "Pencapaian", icon: "trophy" },
  { view: "settings", label: "Pengaturan", icon: "gear" },
];

function parseHash(hash: string): { view: View; param: string | undefined } {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  const first = parts[0] ?? "";
  return { view: VIEW_BY_SEGMENT[first] ?? "home", param: parts[1] };
}

const isCategoryId = (value?: string): value is CategoryId =>
  Boolean(value) && CATEGORIES.some((category) => category.id === value);

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { settings, progress, toasts, dismissToast, commitRound, pushToast, ready } = useStore();
  const [hash, setHash] = useState<string>(() =>
    typeof window === "undefined" ? "#/" : window.location.hash || "#/"
  );
  const [mode, setMode] = useState<GameMode | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [round, setRound] = useState<{ result: RoundResult; isRecord: boolean } | null>(null);
  const [encyclopediaCategory, setEncyclopediaCategory] = useState<CategoryId | null>(null);
  const welcomed = useRef(false);

  /* ---------------- sinkronisasi hash <-> tampilan ---------------- */
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) window.history.replaceState(null, "", "#/");
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { view, param } = parseHash(hash);

  const navigate = useCallback((next: View, nextParam?: string) => {
    const target = HASH_BY_VIEW[next] + (nextParam ? `/${nextParam}` : "");
    if (window.location.hash === target) setHash(target);
    else window.location.hash = target;
  }, []);

  /* Gulir ke atas setiap berpindah halaman */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: settings.animations ? "smooth" : "auto" });
  }, [view, settings.animations]);

  /* Sapa pemain baru sekali per sesi */
  useEffect(() => {
    if (!ready || welcomed.current || progress.gamesPlayed > 0) return;
    welcomed.current = true;
    const id = window.setTimeout(() => {
      pushToast({
        title: "Selamat datang di EcoSort",
        message: "Coba demo pemilahan di beranda, atau langsung main satu ronde (±2 menit).",
        tone: "info",
      });
    }, 900);
    return () => window.clearTimeout(id);
  }, [progress.gamesPlayed, pushToast, ready]);

  /* ---------------- penjaga rute ---------------- */
  useEffect(() => {
    if (view === "play" && !mode) navigate("modes");
    if (view === "result" && !round) navigate("home");
    if (view === "encyclopedia" && isCategoryId(param)) setEncyclopediaCategory(param);
    if (view === "encyclopedia" && !param) setEncyclopediaCategory(null);
  }, [mode, navigate, param, round, view]);

  /* ---------------- aksi permainan ---------------- */
  const startMode = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      setAttempt((value) => value + 1);
      navigate("play");
    },
    [navigate]
  );

  const handleFinish = useCallback(
    (result: RoundResult) => {
      // Dibandingkan SEBELUM progres diperbarui agar label "rekor baru" akurat
      const previousBest = progress.bestScore[result.mode] ?? 0;
      const isRecord = result.score > previousBest && result.answers.length > 0;
      commitRound(result);
      setRound({ result, isRecord });
      navigate("result");
    },
    [commitRound, navigate, progress.bestScore]
  );

  const playAgain = useCallback(() => {
    if (!mode) return;
    setAttempt((value) => value + 1);
    navigate("play");
  }, [mode, navigate]);

  const focusMode = view === "play";
  const level = levelInfo(progress.xp);

  return (
    <div className="min-h-screen">
      <AmbientBackground animations={settings.animations} />
      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <a
        href="#konten"
        className="sr-only left-4 top-4 z-[70] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed"
      >
        Lewati ke konten utama
      </a>

      {/* ======================= NAVIGASI DESKTOP ======================= */}
      {!focusMode && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-line bg-card/80 px-4 py-5 backdrop-blur-md lg:flex">
          <Logo />

          <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi utama">
            {NAV_ITEMS.map((entry) => {
              const active = view === entry.view || (entry.view === "modes" && view === "result");
              return (
                <button
                  key={entry.view}
                  type="button"
                  onClick={() => navigate(entry.view)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[14.5px] font-semibold transition-all duration-200",
                    active
                      ? "bg-primary text-white shadow-[0_10px_22px_-14px_var(--c-primary)]"
                      : "text-muted hover:bg-soft hover:text-ink"
                  )}
                >
                  <Icon name={entry.icon} size={19} />
                  {entry.label}
                  {active && <span className="ml-auto size-1.5 rounded-full bg-lime" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-[16px] border border-line bg-soft/70 p-3.5">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-[10px] bg-lime font-display text-[13px] font-extrabold text-[#1c2a1f] tnum">
                  {level.level}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-ink">{level.title}</p>
                  <p className="text-[11px] text-muted tnum">{progress.xp.toLocaleString("id-ID")} XP</p>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${level.pct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted">
                {level.nextTitle ? `${level.remaining} XP lagi ke ${level.nextTitle}` : "Level tertinggi tercapai"}
              </p>
            </div>
            <p className="px-1 text-[10.5px] leading-relaxed text-muted">
              Progres tersimpan lokal di browser ini · tanpa server
            </p>
          </div>
        </aside>
      )}

      {/* ======================= NAVIGASI MOBILE ======================= */}
      {!focusMode && (
        <header className="sticky top-0 z-40 border-b border-line bg-card/85 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
            <Logo compact />
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("achievements")}
                className="hidden items-center gap-1.5 rounded-full border border-line bg-soft px-3 py-1.5 text-[12px] font-bold text-ink sm:inline-flex"
              >
                <Icon name="trophy" size={14} className="text-primary" />
                Lv {level.level} · {progress.xp.toLocaleString("id-ID")} XP
              </button>
              <button
                type="button"
                onClick={() => navigate("settings")}
                aria-label="Buka pengaturan"
                className="grid size-10 place-items-center rounded-[12px] border border-line bg-soft text-muted transition-colors hover:text-ink"
              >
                <Icon name="gear" size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {!focusMode && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          aria-label="Navigasi utama"
        >
          <ul className="mx-auto grid w-full max-w-md grid-cols-5">
            {NAV_ITEMS.map((entry) => {
              const active = view === entry.view || (entry.view === "modes" && view === "result");
              return (
                <li key={entry.view}>
                  <button
                    type="button"
                    onClick={() => navigate(entry.view)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full flex-col items-center gap-1 px-0 py-2.5 text-[10px] font-bold leading-tight transition-colors",
                      active ? "text-primary" : "text-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-[12px] transition-colors",
                        active ? "bg-mint" : "bg-transparent"
                      )}
                    >
                      <Icon name={entry.icon} size={19} />
                    </span>
                    <span className="max-w-full truncate">{entry.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* ======================= KONTEN ======================= */}
      <main
        id="konten"
        className={cn(!focusMode && "lg:pl-[236px]")}
      >
        {view === "home" && (
          <LandingPage
            onPlay={() => navigate("modes")}
            onModes={() => navigate("modes")}
            onAchievements={() => navigate("achievements")}
            onEncyclopedia={(category) => navigate("encyclopedia", category)}
          />
        )}

        {view === "modes" && (
          <ModesPage onSelect={startMode} onBack={() => navigate("home")} />
        )}

        {view === "play" && mode && (
          <PlayPage
            key={`${mode}-${attempt}`}
            mode={mode}
            onFinish={handleFinish}
            onExit={() => navigate("modes")}
            onRestart={() => setAttempt((value) => value + 1)}
          />
        )}

        {view === "result" && round && (
          <ResultPage
            result={round.result}
            isRecord={round.isRecord}
            onPlayAgain={playAgain}
            onHome={() => navigate("home")}
            onEncyclopedia={() => navigate("encyclopedia")}
            onNextMode={() => navigate("modes")}
          />
        )}

        {view === "encyclopedia" && (
          <EncyclopediaPage initialCategory={encyclopediaCategory} onPlay={() => navigate("modes")} />
        )}

        {view === "achievements" && <AchievementsPage onPlay={() => navigate("modes")} />}

        {view === "settings" && <SettingsPage onPlay={() => navigate("modes")} />}

        {!focusMode && <SiteFooter />}
      </main>
    </div>
  );
}

/* ==========================================================================
   Logo & footer
   ========================================================================== */

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid size-10 shrink-0 place-items-center rounded-[13px] bg-primary-dark text-white shadow-soft">
        <Icon name="leaf" size={20} className="text-lime" />
        <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-lime text-[9px] font-black text-[#1c2a1f]">
          ♻
        </span>
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[19px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          Eco<span className="text-primary">Sort</span>
        </span>
        {!compact && (
          <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Smart Waste Sorting
          </span>
        )}
      </span>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:pb-8">
      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[15px] font-extrabold text-ink">
            EcoSort — <span className="text-primary">Sort It Right, Keep Earth Bright!</span>
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Proyek UAS Sistem Informasi · Kelompok 3 · Aplikasi web statis tanpa backend. Progres
            tersimpan di LocalStorage browser perangkat ini dan tidak tersinkronisasi antarperangkat.
          </p>
        </div>
        <p className="max-w-xs text-[11.5px] leading-relaxed text-muted">
          Klasifikasi sampah di game ini adalah penyederhanaan untuk pembelajaran. Ikuti panduan
          pemilahan dan fasilitas pengelolaan sampah di daerahmu.
        </p>
      </div>
    </footer>
  );
}

/* ==========================================================================
   Latar belakang berlapis: titik halus, cincin geometris, dan serpihan sampah
   yang melayang pelan (dinonaktifkan bila animasi dimatikan).
   ========================================================================== */

const FLOATERS = [
  { emoji: "🍌", top: "14%", left: "6%", size: "text-3xl", dur: "9s" },
  { emoji: "🧴", top: "62%", left: "3%", size: "text-2xl", dur: "11s" },
  { emoji: "📦", top: "32%", left: "92%", size: "text-3xl", dur: "10s" },
  { emoji: "🔋", top: "76%", left: "88%", size: "text-2xl", dur: "12s" },
  { emoji: "🍂", top: "86%", left: "22%", size: "text-2xl", dur: "13s" },
  { emoji: "🥫", top: "8%", left: "62%", size: "text-2xl", dur: "10.5s" },
];

function AmbientBackground({ animations }: { animations: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-canvas" />
      <div className="dot-grid absolute inset-0 text-line opacity-70" />
      <div className="line-grid absolute right-0 top-0 h-[280px] w-[46%] text-lime opacity-[0.16]" />

      {/* Cincin geometris di pojok kanan bawah */}
      <div className="absolute -bottom-40 -right-32 size-[520px] rounded-full border border-line" />
      <div className="absolute -bottom-24 -right-16 size-[360px] rounded-full border border-line" />
      <div className="absolute -bottom-8 right-0 size-[200px] rounded-full border border-primary/15" />

      {/* Serpihan sampah melayang */}
      {animations && (
        <div className="absolute inset-0 hidden xl:block">
          {FLOATERS.map((floater) => (
            <span
              key={floater.emoji}
              className={cn("anim-float absolute opacity-[0.16]", floater.size)}
              style={{
                top: floater.top,
                left: floater.left,
                ["--dur" as string]: floater.dur,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {floater.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
