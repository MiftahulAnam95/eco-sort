/* ==========================================================================
   EcoSort — Halaman Hasil Permainan
   ========================================================================== */

import { useMemo, useState } from "react";
import { CATEGORY_MAP } from "../data/waste";
import {
  MODES,
  formatDuration,
  levelInfo,
  resultMessage,
  type RoundResult,
} from "../lib/game";
import { useStore } from "../store";
import { Button, Card, EmptyState, LevelMeter, Modal, StatTile } from "../components/ui";
import { Icon } from "../components/icons";
import { CategoryBadge } from "../components/sorting";
import { cn } from "../utils/cn";

const END_TEXT: Record<RoundResult["endReason"], string> = {
  finished: "Ronde selesai",
  timeout: "Waktu habis",
  lives: "Nyawa habis",
  quit: "Ronde dihentikan",
};

interface ResultPageProps {
  result: RoundResult;
  isRecord: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
  onEncyclopedia: () => void;
  onNextMode: () => void;
}

export default function ResultPage({
  result,
  isRecord,
  onPlayAgain,
  onHome,
  onEncyclopedia,
  onNextMode,
}: ResultPageProps) {
  const { progress } = useStore();
  const [reviewOpen, setReviewOpen] = useState(false);
  const config = MODES[result.mode];
  const level = levelInfo(progress.xp);

  const wrongAnswers = useMemo(() => result.answers.filter((answer) => !answer.isCorrect), [result.answers]);
  const levelUp = result.levelAfter > result.levelBefore;

  const endText = END_TEXT[result.endReason];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14">
      {/* --------------------------- HEADER HASIL --------------------------- */}
      <div className="relative overflow-hidden rounded-[24px] border border-primary-dark/25 bg-primary-dark p-6 text-mint sm:p-8">
        <span
          className="dot-grid pointer-events-none absolute inset-0 text-white/15 opacity-40"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-[18px] border-lime/15"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              <Icon name={config.icon} size={13} className="text-lime" />
              {config.name}
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              {endText}
            </span>
            {isRecord && (
              <span className="anim-pop rounded-full bg-lime px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#1c2a1f]">
                Skor terbaik baru!
              </span>
            )}
            {result.perfect && (
              <span className="rounded-full border border-lime/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-lime">
                Ronde sempurna
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-mint/70">Skor akhir</p>
              <p className="font-display text-[56px] font-extrabold leading-none text-white tnum sm:text-[76px]">
                {result.score.toLocaleString("id-ID")}
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mint/85">
                {resultMessage(result)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:w-auto">
              <ScoreBox label="Benar" value={result.correct} tone="good" />
              <ScoreBox label="Salah" value={result.wrong} tone="bad" />
              <ScoreBox label="Akurasi" value={`${result.accuracy}%`} tone="neutral" />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------- RINCIAN --------------------------- */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Streak terbaik"
          value={`${result.bestStreak}×`}
          icon="flame"
          hint="Jawaban benar beruntun"
        />
        <StatTile
          label={result.mode === "time" ? "Waktu terpakai" : "Durasi ronde"}
          value={formatDuration(result.durationMs)}
          icon="timer"
          hint={result.mode === "time" ? `Dari jatah ${formatDuration(config.durationMs)}` : undefined}
        />
        <StatTile label="XP didapat" value={`+${result.xp}`} icon="spark" tone="lime" hint="Tersimpan di browser ini" />
        <StatTile
          label="Soal dijawab"
          value={result.answers.length}
          icon="list"
          hint={`Salah pilih: ${wrongAnswers.length} item`}
          tone="mint"
        />
      </div>

      {levelUp && (
        <div className="anim-pop mt-4 flex flex-wrap items-center gap-3 rounded-[20px] border-2 border-lime bg-lime/25 p-4">
          <span className="grid size-11 place-items-center rounded-[13px] bg-lime text-[#1c2a1f]">
            <Icon name="trophy" size={22} />
          </span>
          <div>
            <p className="font-display text-[19px] font-extrabold text-ink">Naik level!</p>
            <p className="text-[13.5px] text-muted">
              Kamu sekarang <strong className="font-bold text-ink">{level.title}</strong> (level{" "}
              {level.level}). Terus main untuk membuka level berikutnya.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LevelMeter xp={progress.xp} />
        </div>

        {/* Ringkasan jawaban yang perlu dipelajari */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-[18px] text-ink">
            <Icon name="book" size={18} className="text-primary" />
            Perlu dipelajari lagi
          </h2>
          {wrongAnswers.length === 0 ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
              Tidak ada jawaban salah di ronde ini. Coba tingkatkan tantangan lewat Time Challenge!
            </p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {wrongAnswers.slice(0, 3).map((answer) => (
                  <li
                    key={answer.itemId}
                    className="flex items-center gap-2.5 rounded-[13px] border border-line bg-soft/50 px-3 py-2"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {answer.itemEmoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-ink">{answer.itemName}</p>
                      <p className="text-[11.5px] text-muted">
                        Seharusnya: {CATEGORY_MAP[answer.correctCategory].name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {wrongAnswers.length > 3 && (
                <p className="mt-2 text-[12px] text-muted">
                  +{wrongAnswers.length - 3} item lain menanti di daftar lengkap.
                </p>
              )}
            </>
          )}
        </Card>
      </div>

      {/* --------------------------- AKSI --------------------------- */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <Button size="lg" icon="play" onClick={onPlayAgain}>
          Main Lagi
        </Button>
        <Button
          size="lg"
          variant={wrongAnswers.length > 0 ? "outline" : "ghost"}
          icon="search"
          onClick={() => setReviewOpen(true)}
          disabled={result.answers.length === 0}
        >
          Pelajari Kesalahan{wrongAnswers.length > 0 ? ` (${wrongAnswers.length})` : ""}
        </Button>
        <Button size="lg" variant="outline" icon="home" onClick={onHome}>
          Kembali ke Beranda
        </Button>
        <Button size="lg" variant="ghost" icon="arrowRight" onClick={onNextMode}>
          Ganti mode
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button variant="ghost" icon="book" onClick={onEncyclopedia} className="sm:flex-none">
          Buka Ensiklopedia Sampah
        </Button>
        <p className="flex items-center gap-2 text-[12.5px] text-muted">
          <Icon name="info" size={15} className="shrink-0 text-primary" />
          Hasil ini tersimpan di browser perangkat ini dan tidak terkirim ke mana pun.
        </p>
      </div>

      {/* --------------------------- MODAL REVIEW --------------------------- */}
      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Pelajari jawabanmu"
        subtitle={`${wrongAnswers.length} jawaban perlu dilatih dari ${result.answers.length} soal`}
        icon="book"
        size="lg"
        footer={
          <>
            <Button variant="ghost" icon="close" onClick={() => setReviewOpen(false)}>
              Tutup
            </Button>
            <Button icon="play" onClick={onPlayAgain}>
              Coba ronde baru
            </Button>
          </>
        }
      >
        {result.answers.length === 0 ? (
          <EmptyState
            icon="list"
            title="Belum ada jawaban"
            message="Ronde ini berakhir sebelum ada sampah yang berhasil dipilah."
          />
        ) : (
          <ul className="space-y-2.5">
            {result.answers.map((answer, position) => {
              const correctCategory = CATEGORY_MAP[answer.correctCategory];
              const chosenCategory = answer.chosen ? CATEGORY_MAP[answer.chosen] : null;
              return (
                <li
                  key={`${answer.itemId}-${position}`}
                  className={cn(
                    "rounded-[16px] border-2 p-3.5",
                    answer.isCorrect ? "border-correct/25 bg-card" : "border-wrong/30 bg-haz-soft/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-[10px] text-white",
                        answer.isCorrect ? "bg-correct" : "bg-wrong"
                      )}
                    >
                      <Icon name={answer.isCorrect ? "check" : "close"} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg" aria-hidden="true">
                          {answer.itemEmoji}
                        </span>
                        <p className="text-[14.5px] font-bold text-ink">{answer.itemName}</p>
                        <span className="text-[11.5px] text-muted tnum">
                          +{answer.pointsGained} poin
                        </span>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                        Jawabanmu:
                        {chosenCategory ? (
                          <CategoryBadge category={chosenCategory} size="sm" />
                        ) : (
                          <span className="italic">dilewati</span>
                        )}
                        {!answer.isCorrect && (
                          <>
                            <Icon name="arrowRight" size={13} />
                            Seharusnya:
                            <CategoryBadge category={correctCategory} size="sm" />
                          </>
                        )}
                      </p>
                      <p className="mt-2 rounded-[12px] border border-line bg-card p-2.5 text-[13px] leading-relaxed text-ink">
                        {answer.isCorrect ? correctCategory.tagline + ". " : ""}
                        {answer.isCorrect
                          ? CATEGORY_MAP[answer.correctCategory].note
                          : `${correctCategory.name}: ${correctCategory.description}`}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      {/* Catatan akurasi */}
      <p className="mt-6 flex items-start gap-2 rounded-[14px] border border-line bg-card p-3.5 text-[12.5px] leading-relaxed text-muted">
        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-primary" />
        Akurasi dihitung dari jumlah jawaban benar dibagi jumlah soal yang dijawab, lalu dikali 100.
        Klasifikasi di dalam game adalah penyederhanaan untuk belajar; panduan pemilahan di daerahmu
        bisa berbeda.
      </p>
    </div>
  );
}

function ScoreBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "good" | "bad" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border px-3 py-2.5 text-center backdrop-blur-sm",
        tone === "good" && "border-lime/40 bg-lime/15",
        tone === "bad" && "border-wrong/40 bg-wrong/15",
        tone === "neutral" && "border-white/20 bg-white/10"
      )}
    >
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-mint/75">{label}</p>
      <p className="font-display text-[24px] font-extrabold leading-tight text-white tnum sm:text-[28px]">
        {value}
      </p>
    </div>
  );
}


