/* ==========================================================================
   EcoSort — Halaman Permainan (Anggota 1 + Anggota 2)
   --------------------------------------------------------------------------
   Alur: tampilkan sampah -> pemain memilih kategori -> validasi -> kunci
   tombol sebentar -> tampilkan feedback -> tombol "Lanjut" -> soal berikut.
   Timer Time Challenge memakai TIMESTAMP (bukan sekadar menghitung interval)
   supaya tetap akurat ketika tab browser berpindah ke latar belakang.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, type CategoryId, type WasteItem } from "../data/waste";
import {
  MODES,
  buildDeck,
  buildRoundResult,
  createDeckStream,
  formatClock,
  pointsForAnswer,
  type AnswerRecord,
  type GameMode,
  type RoundEndReason,
  type RoundResult,
} from "../lib/game";
import { useStore } from "../store";
import { Button, Modal, ProgressBar } from "../components/ui";
import { Icon } from "../components/icons";
import { CategoryBadge, TrashBin, WasteCard } from "../components/sorting";
import { cn } from "../utils/cn";

interface PlayPageProps {
  mode: GameMode;
  onFinish: (result: RoundResult) => void;
  onExit: () => void;
  onRestart: () => void;
}

/* Petunjuk ringan yang tidak membocorkan jawaban secara langsung */
const HINTS: Record<CategoryId, string> = {
  organik: "Barang ini berasal dari makhluk hidup dan bisa terurai di alam.",
  daurulang: "Barang ini bersih, kering, dan masih punya nilai di bank sampah.",
  residu: "Barang ini kotor, tercampur, atau berlapis sehingga sulit dipisahkan.",
  b3: "Barang ini mengandung bahan berbahaya atau komponen elektronik.",
};

export default function PlayPage({ mode, onFinish, onExit, onRestart }: PlayPageProps) {
  const config = MODES[mode];
  const isTime = mode === "time";
  const isLearn = mode === "learn";
  const { sfx, progress } = useStore();

  /* ---------------- sumber soal ---------------- */
  const streamRef = useRef<ReturnType<typeof createDeckStream> | null>(null);
  if (!streamRef.current) streamRef.current = createDeckStream();
  const [deck] = useState<WasteItem[]>(() => (isTime ? [] : buildDeck(config.questions)));
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const [item, setItem] = useState<WasteItem>(() => (isTime ? streamRef.current!.next() : deck[0]));

  /* ---------------- status ronde ---------------- */
  const [phase, setPhase] = useState<"asking" | "feedback">("asking");
  const [status, setStatus] = useState<"running" | "paused" | "over">("running");
  const [chosen, setChosen] = useState<CategoryId | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(config.lives);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [frozen, setFrozen] = useState(false); // timer dibekukan saat membaca penjelasan (Time Challenge)
  const [float, setFloat] = useState<{ text: string; tone: "correct" | "wrong" } | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState(isTime ? config.durationMs : 0);

  /* ---------------- ref untuk logika (menghindari state basi di timer) ---------------- */
  const answersRef = useRef<AnswerRecord[]>([]);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const livesRef = useRef(config.lives);
  const remainingRef = useRef(config.durationMs);
  const finishedRef = useRef(false);
  const frozenRef = useRef(false);
  const freezeStartRef = useRef<number | null>(null);
  const questionStartRef = useRef(Date.now());
  const startRef = useRef(Date.now());
  const pausedTotalRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);
  const deadlineRef = useRef(isTime ? Date.now() + config.durationMs : 0);

  /* ---------------- selesaikan ronde ---------------- */
  const finish = useCallback(
    (reason: RoundEndReason) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus("over");
      if (pauseStartRef.current !== null) {
        pausedTotalRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      if (freezeStartRef.current !== null) {
        pausedTotalRef.current += Date.now() - freezeStartRef.current;
        freezeStartRef.current = null;
      }
      const durationMs = Date.now() - startRef.current - pausedTotalRef.current;
      const result = buildRoundResult({
        mode,
        answers: answersRef.current,
        score: scoreRef.current,
        bestStreak: bestStreakRef.current,
        durationMs,
        xpBefore: progress.xp,
        endReason: reason,
      });
      sfx("finish");
      onFinish(result);
    },
    [mode, onFinish, progress.xp, sfx]
  );

  /* ---------------- lanjut ke soal berikutnya ---------------- */
  const advance = useCallback(() => {
    if (finishedRef.current) return;
    setChosen(null);
    setPhase("asking");
    setHintOpen(false);
    questionStartRef.current = Date.now();
    if (isTime) {
      // Cairkan kembali timer bila sempat dibekukan untuk membaca penjelasan
      if (frozenRef.current) {
        frozenRef.current = false;
        setFrozen(false);
        if (freezeStartRef.current !== null) {
          pausedTotalRef.current += Date.now() - freezeStartRef.current;
          freezeStartRef.current = null;
        }
        deadlineRef.current = Date.now() + remainingRef.current;
      }
      setItem(streamRef.current!.next());
      return;
    }
    const nextIndex = indexRef.current + 1;
    if (nextIndex >= deck.length) {
      finish("finished");
      return;
    }
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    setItem(deck[nextIndex]);
  }, [deck, finish, isTime]);

  /* ---------------- pemain memilih tempat sampah ---------------- */
  const handleChoose = useCallback(
    (categoryId: CategoryId) => {
      if (phase !== "asking" || status !== "running") return;

      const correct = categoryId === item.category;
      const gained = pointsForAnswer(correct, streakRef.current);
      const record: AnswerRecord = {
        itemId: item.id,
        itemName: item.name,
        itemEmoji: item.emoji,
        chosen: categoryId,
        correctCategory: item.category,
        isCorrect: correct,
        pointsGained: gained,
        timeSpentMs: Date.now() - questionStartRef.current,
      };

      answersRef.current = [...answersRef.current, record];
      setAnswers(answersRef.current);
      setChosen(categoryId);
      setPhase("feedback");
      setFloat({ text: correct ? `+${gained}` : "+0", tone: correct ? "correct" : "wrong" });
      window.setTimeout(() => setFloat(null), 950);

      if (correct) {
        scoreRef.current += gained;
        streakRef.current += 1;
        bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
        setScore(scoreRef.current);
        setStreak(streakRef.current);
        setBestStreak(bestStreakRef.current);
        sfx("correct");
      } else {
        streakRef.current = 0;
        setStreak(0);
        sfx("wrong");
        // Learning Mode: salah TIDAK mengurangi skor maupun nyawa
        if (config.lives > 0) {
          livesRef.current = Math.max(0, livesRef.current - 1);
          setLives(livesRef.current);
        }
        // Time Challenge: waktu dibekukan agar penjelasan salah sempat dibaca
        if (isTime) {
          remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
          frozenRef.current = true;
          freezeStartRef.current = Date.now();
          setFrozen(true);
        }
      }
    },
    [config.lives, isTime, item, phase, sfx, status]
  );

  /* ---------------- timer Time Challenge (akurat walau tab di latar) ---------------- */
  useEffect(() => {
    if (!isTime || status !== "running" || frozen) return;
    const tick = () => {
      const rem = Math.max(0, deadlineRef.current - Date.now());
      remainingRef.current = rem;
      setRemainingMs(rem);
      if (rem <= 0) finish("timeout");
    };
    tick();
    const interval = window.setInterval(tick, 100);
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [finish, frozen, isTime, status]);

  /* ---------------- Time Challenge: jawaban benar langsung lanjut (tanpa membekukan waktu) -------- */
  useEffect(() => {
    if (!isTime || phase !== "feedback" || status !== "running" || frozen) return;
    const id = window.setTimeout(() => {
      if (livesRef.current <= 0) finish("lives");
      else advance();
    }, 750);
    return () => window.clearTimeout(id);
  }, [advance, finish, frozen, isTime, phase, status]);

  /* ---------------- jeda / lanjut ---------------- */
  const pause = useCallback(() => {
    if (status !== "running") return;
    setStatus("paused");
    setPauseOpen(true);
    if (isTime) {
      if (frozenRef.current) {
        // Waktu sudah dibekukan untuk membaca penjelasan: hentikan penghitung jeda saja,
        // jangan menghitung ulang dari deadline (nilainya sudah tidak berlaku).
        if (freezeStartRef.current !== null) {
          pausedTotalRef.current += Date.now() - freezeStartRef.current;
          freezeStartRef.current = null;
        }
      } else {
        remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
      }
      pauseStartRef.current = Date.now();
    }
    sfx("click");
  }, [isTime, sfx, status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    if (pauseStartRef.current !== null) {
      pausedTotalRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    if (isTime && !frozenRef.current) deadlineRef.current = Date.now() + remainingRef.current;
    setPauseOpen(false);
    setStatus("running");
    sfx("click");
  }, [isTime, sfx, status]);

  /* ---------------- pintasan keyboard ---------------- */
  const modalOpen = pauseOpen || exitOpen;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (modalOpen) return; // biar dialog yang menangani
        event.preventDefault();
        if (status === "running") pause();
        else if (status === "paused") resume();
        return;
      }
      if (modalOpen || status !== "running") return;
      if (phase === "feedback") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (isTime && livesRef.current <= 0) finish("lives");
          else advance();
        }
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= 4) {
        const category = CATEGORIES[digit - 1];
        if (category) handleChoose(category.id);
      }
      if (event.key.toLowerCase() === "h" && !isTime) setHintOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finish, handleChoose, isTime, modalOpen, pause, phase, resume, status]);

  /* ---------------- turunan tampilan ---------------- */
  const totalQuestions = isTime ? 0 : deck.length;
  const progressPct = isTime
    ? (remainingMs / config.durationMs) * 100
    : ((index + (phase === "feedback" ? 1 : 0)) / Math.max(1, totalQuestions)) * 100;
  const timeLow = isTime && remainingMs <= 10_000;
  const correctCategory = CATEGORY_MAP[item.category];
  const isCorrect = chosen !== null && chosen === item.category;
  const binsLocked = phase === "feedback" || status !== "running";
  const lastPoints = answers.length > 0 ? answers[answers.length - 1].pointsGained : 0;
  /* Time Challenge: jawaban benar memakai banner ringkas agar tempo tetap cepat,
     jawaban salah memakai panel penuh dengan timer dibekukan supaya bisa dibaca. */
  const showCompact = isTime && isCorrect;
  const livesOut = isTime && lives <= 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-24 pt-4 sm:px-6 sm:pt-6">
      {/* --------------------------- HUD ATAS --------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExitOpen(true)}
          aria-label="Keluar dari ronde"
          className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-line bg-card text-muted transition-colors hover:border-wrong/40 hover:text-wrong"
        >
          <Icon name="arrowLeft" size={18} />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-[12px] border border-line bg-card px-3 py-2 text-[13px] font-bold text-ink">
          <Icon name={config.icon} size={15} className="text-primary" />
          {config.name}
        </span>

        {!isTime && (
          <span className="rounded-[12px] border border-line bg-card px-3 py-2 text-[13px] font-bold text-muted tnum">
            Soal {Math.min(index + 1, totalQuestions)}/{totalQuestions}
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isTime && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[12px] border px-3 py-2 font-display text-[15px] font-extrabold tnum transition-colors",
                timeLow
                  ? "border-wrong/45 bg-haz-soft text-wrong anim-blink"
                  : "border-line bg-card text-ink"
              )}
              aria-live="off"
            >
              <Icon name="timer" size={16} />
              {formatClock(remainingMs)}
              <span className="sr-only">sisa waktu</span>
            </span>
          )}

          {isTime && frozen && (
            <span className="inline-flex items-center gap-1 rounded-[12px] border border-warn/40 bg-warn/12 px-2.5 py-2 text-[11.5px] font-bold text-warn">
              <Icon name="pause" size={13} />
              Waktu berhenti
            </span>
          )}

          {isTime && (
            <span
              className="inline-flex items-center gap-1 rounded-[12px] border border-line bg-card px-3 py-2"
              aria-label={`Nyawa tersisa ${lives} dari ${config.lives}`}
            >
              {Array.from({ length: config.lives }).map((_, i) => (
                <Icon
                  key={i}
                  name="heart"
                  size={15}
                  className={i < lives ? "text-wrong" : "text-line"}
                />
              ))}
            </span>
          )}

          <span className="relative inline-flex items-center gap-1.5 rounded-[12px] border border-primary/25 bg-mint px-3 py-2 text-[15px] font-extrabold text-primary-dark tnum">
            <Icon name="spark" size={15} />
            {score.toLocaleString("id-ID")}
            {float && (
              <span
                key={float.text}
                className={cn(
                  "anim-fade-up pointer-events-none absolute -top-6 right-1 rounded-full px-2 py-0.5 text-[12px] font-extrabold text-white",
                  float.tone === "correct" ? "bg-correct" : "bg-wrong"
                )}
              >
                {float.text}
              </span>
            )}
          </span>

          {streak >= 2 && (
            <span className="inline-flex items-center gap-1 rounded-[12px] border border-warn/40 bg-warn/12 px-3 py-2 text-[13px] font-extrabold text-warn tnum anim-pop">
              <Icon name="flame" size={15} />
              {streak}
            </span>
          )}

          <button
            type="button"
            onClick={pause}
            disabled={status !== "running"}
            aria-label="Jeda permainan"
            className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-line bg-card text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            <Icon name="pause" size={17} />
          </button>
        </div>
      </div>

      {/* --------------------------- PROGRESS --------------------------- */}
      <ProgressBar
        className="mt-3 h-2"
        value={progressPct}
        tone={isTime ? (timeLow ? "wrong" : "warn") : "primary"}
        striped={isTime}
        label={isTime ? "Sisa waktu" : "Progres ronde"}
      />

      {/* Deret titik hasil jawaban (Classic & Learning) */}
      {!isTime && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-hidden="true">
          {deck.map((entry, i) => {
            const record = answers[i];
            return (
              <span
                key={entry.id}
                className={cn(
                  "h-1.5 w-5 rounded-full transition-colors",
                  record ? (record.isCorrect ? "bg-correct" : "bg-wrong") : i === index ? "bg-primary" : "bg-line"
                )}
              />
            );
          })}
        </div>
      )}

      {/* --------------------------- KARTU SAMPAH --------------------------- */}
      <div key={item.id} className="anim-drop mt-4">
        <WasteCard item={item} state={chosen ? (isCorrect ? "correct" : "wrong") : "idle"} />
      </div>

      {/* Petunjuk (Classic & Learning) */}
      {!isTime && phase === "asking" && (
        <div className="mt-3 flex flex-col items-center gap-2">
          {hintOpen ? (
            <p className="anim-fade-up rounded-[14px] border border-warn/35 bg-warn/10 px-4 py-2.5 text-center text-[13.5px] font-medium text-ink">
              <Icon name="info" size={15} className="mr-1.5 inline text-warn" />
              {HINTS[item.category]}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setHintOpen(true);
                sfx("pop");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 py-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Icon name="info" size={14} />
              Butuh petunjuk? (tekan H)
            </button>
          )}
        </div>
      )}

      {/* --------------------------- TEMPAT SAMPAH --------------------------- */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {CATEGORIES.map((category) => {
          let state: "idle" | "correct" | "wrong" | "reveal" | "muted" = "idle";
          if (chosen) {
            if (category.id === item.category) state = isCorrect ? "correct" : "reveal";
            else if (category.id === chosen) state = "wrong";
            else state = "muted";
          }
          return (
            <TrashBin
              key={category.id}
              category={category}
              state={state}
              disabled={binsLocked}
              onSelect={() => handleChoose(category.id)}
            />
          );
        })}
      </div>

      {/* --------------------------- FEEDBACK --------------------------- */}
      {/* Banner ringkas: jawaban benar di Time Challenge (tempo tetap cepat) */}
      {phase === "feedback" && chosen && showCompact && (
        <div
          role="status"
          aria-live="polite"
          className="anim-fade-up mt-4 flex items-center gap-3 rounded-[16px] border-2 border-correct/40 bg-mint px-4 py-3"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-correct text-white">
            <Icon name="check" size={18} />
          </span>
          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-primary-dark">
            Tepat! {correctCategory.name} · <span className="tnum">+{lastPoints}</span>
            {streak >= 3 && <span className="ml-1 tnum">· streak {streak}</span>}
          </p>
          <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-wide text-muted">
            lanjut…
          </span>
        </div>
      )}

      {/* Panel penuh: Classic, Learning, dan jawaban salah di Time Challenge */}
      {phase === "feedback" && chosen && !showCompact && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "anim-fade-up mt-4 rounded-[20px] border-2 p-4 sm:p-5",
            isCorrect ? "border-correct/40 bg-mint" : "border-wrong/45 bg-haz-soft/70"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-[12px] text-white",
                isCorrect ? "bg-correct" : "bg-wrong"
              )}
            >
              <Icon name={isCorrect ? "check" : "close"} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-display text-[20px] font-extrabold leading-tight sm:text-[22px]",
                  isCorrect ? "text-primary-dark" : "text-wrong"
                )}
              >
                {isCorrect ? "Tepat sekali!" : "Belum tepat"}
                {isCorrect && streak >= 3 && (
                  <span className="ml-2 rounded-full bg-lime px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-[#1c2a1f]">
                    streak {streak} · bonus +25
                  </span>
                )}
              </p>

              <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
                {!isCorrect && (
                  <>
                    <strong className="font-bold">{item.name}</strong> seharusnya masuk{" "}
                    <CategoryBadge category={correctCategory} size="sm" />.{" "}
                  </>
                )}
                {isCorrect ? item.reason : item.wrongHint}
              </p>

              {/* Penjelasan lebih lengkap di Learning Mode */}
              {isLearn && (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  <InfoBlock icon="info" title="Tentang kategori" text={correctCategory.description} />
                  <InfoBlock icon="spark" title="Fakta" text={item.fact} />
                  <InfoBlock icon="check" title="Cara penanganan" text={item.handling} />
                </div>
              )}

              {!isLearn && !isCorrect && (
                <p className="mt-2.5 flex items-start gap-2 rounded-[12px] border border-line bg-card/70 p-2.5 text-[13px] leading-relaxed text-muted">
                  <Icon name="info" size={15} className="mt-0.5 shrink-0 text-primary" />
                  {item.fact}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] font-semibold text-muted tnum">
              {livesOut
                ? "Nyawa habis — ronde Time Challenge selesai."
                : isTime
                  ? "Timer berhenti sebentar supaya penjelasan ini bisa dibaca."
                  : `Poin ronde ini: ${score.toLocaleString("id-ID")} · streak terbaik: ${bestStreak}`}
            </p>
            <Button
              icon={livesOut ? "trophy" : isTime ? "timer" : "arrowRight"}
              onClick={() => {
                if (livesOut) finish("lives");
                else advance();
              }}
            >
              {livesOut ? "Lihat hasil" : !isTime && index + 1 >= totalQuestions ? "Lihat hasil" : "Lanjut"}
            </Button>
          </div>
        </div>
      )}

      {/* Learning Mode: keterangan kategori sebelum menjawab */}
      {isLearn && phase === "asking" && (
        <p className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-line bg-card p-3.5 text-[13px] leading-relaxed text-muted">
          <Icon name="book" size={16} className="mt-0.5 shrink-0 text-rec" />
          <span>
            Mode belajar: tidak ada timer dan tidak ada nyawa. Salah menjawab tidak mengurangi skor —
            justru di situ penjelasannya muncul. Tekan tombol lanjut kapan pun kamu siap.
          </span>
        </p>
      )}

      {/* --------------------------- DIALOG JEDA --------------------------- */}
      <Modal
        open={pauseOpen}
        onClose={resume}
        title="Permainan dijeda"
        subtitle={isTime ? "Timer berhenti sampai kamu lanjut lagi." : "Santai, progres ronde ini tetap tersimpan."}
        icon="pause"
        size="sm"
        footer={
          <>
            <Button variant="ghost" icon="reset" onClick={onRestart}>
              Ulangi ronde
            </Button>
            <Button
              variant="outline"
              icon="arrowLeft"
              onClick={() => {
                setPauseOpen(false);
                setExitOpen(true);
              }}
            >
              Keluar
            </Button>
            <Button icon="play" onClick={resume}>
              Lanjut main
            </Button>
          </>
        }
      >
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniStat label="Skor" value={score.toLocaleString("id-ID")} />
          <MiniStat label="Benar" value={`${answers.filter((a) => a.isCorrect).length}`} />
          <MiniStat label={isTime ? "Sisa waktu" : "Streak"} value={isTime ? formatClock(remainingMs) : `${bestStreak}`} />
        </div>
      </Modal>

      {/* --------------------------- DIALOG KELUAR --------------------------- */}
      <Modal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        title="Keluar dari ronde?"
        subtitle="Progres ronde ini tidak akan disimpan sebagai hasil."
        icon="info"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setExitOpen(false)}>
              Tetap main
            </Button>
            <Button
              variant="danger"
              icon="arrowLeft"
              onClick={() => {
                finishedRef.current = true; // cegah ronde tercatat dua kali
                setExitOpen(false);
                onExit();
              }}
            >
              Ya, keluar
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-muted">
          Kamu sudah menjawab {answers.length} soal dengan skor {score.toLocaleString("id-ID")}. Kalau
          keluar sekarang, hasil itu tidak masuk ke riwayat maupun pencapaian.
        </p>
      </Modal>
    </div>
  );
}

function InfoBlock({ icon, title, text }: { icon: "info" | "spark" | "check"; title: string; text: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        <Icon name={icon} size={13} className="text-primary" />
        {title}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-soft/60 p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-display text-[20px] font-extrabold text-ink tnum">{value}</p>
    </div>
  );
}
