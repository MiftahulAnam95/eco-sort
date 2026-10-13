/* ==========================================================================
   EcoSort — Pilih Mode Permainan
   ========================================================================== */

import { LEVELS, MODES, SCORE_CORRECT, STREAK_BONUS, STREAK_BONUS_FROM, type GameMode } from "../lib/game";
import { useStore } from "../store";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/icons";
import { TrashBin } from "../components/sorting";
import { CATEGORIES } from "../data/waste";
import { cn } from "../utils/cn";

export default function ModesPage({
  onSelect,
  onBack,
}: {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}) {
  const { progress, sfx } = useStore();

  const start = (mode: GameMode) => {
    sfx("start");
    onSelect(mode);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-[13px] font-semibold text-muted transition-colors hover:border-primary/40 hover:text-ink"
      >
        <Icon name="arrowLeft" size={16} />
        Kembali ke beranda
      </button>

      <header className="mt-5 max-w-2xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          Pilih mode
        </span>
        <h1 className="mt-2 text-[34px] leading-[1.02] text-ink sm:text-[44px]">
          Mau main yang mana hari ini?
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
          Ketiga mode memakai aturan skor yang sama supaya mudah dipahami. Bedanya hanya pada tekanan
          waktu dan jumlah penjelasan yang ditampilkan.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Mode utama dibuat lebih besar agar hierarkinya jelas */}
        <ModeCard
          mode="classic"
          featured
          bestScore={progress.bestScore.classic}
          onStart={() => start("classic")}
        />
        <div className="grid gap-4">
          <ModeCard mode="time" bestScore={progress.bestScore.time} onStart={() => start("time")} />
          <ModeCard mode="learn" bestScore={progress.bestScore.learn} onStart={() => start("learn")} />
        </div>
      </div>

      {/* Aturan skor + level */}
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name="target" size={19} className="text-primary" />
            Aturan skor &amp; streak
          </h2>
          <ul className="mt-4 space-y-3">
            {[
              {
                icon: "check" as const,
                title: `Jawaban benar: +${SCORE_CORRECT} poin`,
                text: "Berlaku sama di Classic Mode dan Time Challenge.",
              },
              {
                icon: "flame" as const,
                title: `Bonus streak: +${STREAK_BONUS} poin`,
                text: `Ditambahkan pada setiap jawaban benar beruntun mulai dari jawaban ke-${STREAK_BONUS_FROM}.`,
              },
              {
                icon: "close" as const,
                title: "Jawaban salah: 0 poin",
                text: "Streak kembali ke nol. Di Time Challenge, salah juga mengurangi satu nyawa.",
              },
              {
                icon: "sprout" as const,
                title: "XP dari hasil ronde",
                text: "Classic/Time: benar × 20 + bonus streak × 5 + 50 bila sempurna. Learning: benar × 10.",
              },
            ].map((rule) => (
              <li key={rule.title} className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-[10px] border",
                    rule.icon === "close"
                      ? "border-wrong/30 bg-haz-soft text-wrong"
                      : "border-line bg-soft text-primary"
                  )}
                >
                  <Icon name={rule.icon} size={16} />
                </span>
                <div>
                  <p className="text-[14.5px] font-bold text-ink">{rule.title}</p>
                  <p className="text-[13px] leading-relaxed text-muted">{rule.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name="trophy" size={19} className="text-primary" />
            Tingkatan pemain
          </h2>
          <ul className="mt-4 space-y-2">
            {LEVELS.map((lvl) => {
              const reached = progress.xp >= lvl.minXp;
              return (
                <li
                  key={lvl.level}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] border px-3 py-2.5 transition-colors",
                    reached ? "border-primary/25 bg-mint/60" : "border-line bg-soft/50"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-[10px] font-display text-[13px] font-extrabold tnum",
                      reached ? "bg-primary text-white" : "bg-card text-muted"
                    )}
                  >
                    {lvl.level}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-ink">{lvl.title}</p>
                    <p className="text-[11.5px] text-muted tnum">mulai {lvl.minXp.toLocaleString("id-ID")} XP</p>
                  </div>
                  {reached && <Icon name="check" size={16} className="ml-auto shrink-0 text-primary" />}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-[14px] border border-line bg-card p-3.5 text-[12.5px] leading-relaxed text-muted">
        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-primary" />
        Pintasan keyboard saat bermain: angka <strong className="font-bold text-ink">1–4</strong> untuk
        memilih tempat sampah, <strong className="font-bold text-ink">Enter</strong> untuk lanjut, dan{" "}
        <strong className="font-bold text-ink">Esc</strong> untuk menjeda.
      </p>
    </div>
  );
}

function ModeCard({
  mode,
  bestScore,
  onStart,
  featured = false,
}: {
  mode: GameMode;
  bestScore: number;
  onStart: () => void;
  featured?: boolean;
}) {
  const config = MODES[mode];
  const isTime = mode === "time";
  const isLearn = mode === "learn";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        featured && "lg:flex-row lg:items-stretch lg:gap-6 lg:p-0"
      )}
    >
      <div className={cn("flex-1 p-5 sm:p-6", featured && "lg:p-7")}>
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid place-items-center rounded-[14px] border",
              featured ? "size-14 bg-primary text-white border-transparent" : "size-11 bg-mint text-primary-dark border-primary/15"
            )}
          >
            <Icon name={config.icon} size={featured ? 26 : 21} />
          </span>
          {featured && (
            <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1c2a1f]">
              Paling populer
            </span>
          )}
        </div>

        <h3 className={cn("mt-4 text-ink", featured ? "text-[26px] sm:text-[30px]" : "text-[20px]")}>
          {config.name}
        </h3>
        <p className="mt-1 text-[12.5px] font-bold uppercase tracking-[0.12em] text-primary">
          {config.tagline}
        </p>
        <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{config.description}</p>

        <ul className="mt-4 space-y-1.5">
          {config.rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2 text-[13px] text-ink">
              <Icon name="check" size={15} className="mt-0.5 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button icon="play" size={featured ? "lg" : "md"} onClick={onStart}>
            Main {config.name.replace(" Mode", "")}
          </Button>
          <span className="rounded-full border border-line bg-soft px-3 py-1.5 text-[12px] font-semibold text-muted tnum">
            Skor terbaik: <strong className="font-bold text-ink">{bestScore.toLocaleString("id-ID")}</strong>
          </span>
        </div>
      </div>

      {/* Ilustrasi kecil di kartu utama */}
      {featured && (
        <div className="relative hidden shrink-0 border-t border-line bg-soft/60 p-5 lg:block lg:w-[240px] lg:border-l lg:border-t-0">
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map((category, index) => (
              <div key={category.id} className={cn(index % 2 === 1 && "translate-y-3")}>
                <TrashBin category={category} compact state="idle" />
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
            4 tempat · nama + ikon + warna
          </p>
        </div>
      )}

      {isTime && (
        <span className="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11.5px] font-bold text-warn sm:inline-flex">
          <Icon name="heart" size={13} />3 nyawa
        </span>
      )}
      {isLearn && (
        <span className="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full border border-rec/35 bg-rec-soft px-2.5 py-1 text-[11.5px] font-bold text-rec sm:inline-flex">
          <Icon name="book" size={13} />
          Tanpa waktu
        </span>
      )}
    </article>
  );
}
