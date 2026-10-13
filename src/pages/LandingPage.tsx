/* ==========================================================================
   EcoSort — Landing Page
   Bukan hero generik: sisi kanan halaman ini adalah mini-game pemilahan yang
   benar-benar bisa dimainkan langsung, agar pengunjung memahami mekaniknya
   dalam 5 detik pertama.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  COUNT_BY_CATEGORY,
  ITEM_COUNT,
  WASTE_ITEMS,
  type CategoryId,
} from "../data/waste";
import { MODE_LIST, formatDate, levelInfo } from "../lib/game";
import { useStore } from "../store";
import { Button, Card, EmptyState, Eyebrow, LevelMeter, Reveal, StatTile } from "../components/ui";
import { Icon } from "../components/icons";
import { CategoryBadge, TrashBin, WasteCard } from "../components/sorting";
import { cn } from "../utils/cn";

interface LandingProps {
  onPlay: () => void;
  onEncyclopedia: (category?: CategoryId) => void;
  onModes: () => void;
  onAchievements: () => void;
}

export default function LandingPage({ onPlay, onEncyclopedia, onModes, onAchievements }: LandingProps) {
  const { progress, achievements, history } = useStore();
  const level = levelInfo(progress.xp);
  const hasPlayed = progress.gamesPlayed > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="anim-fade-up lg:col-span-7">
          <Eyebrow icon="sprout">Proyek UAS · Sistem Informasi · Kelompok 3</Eyebrow>

          <h1 className="mt-4 text-[40px] leading-[0.95] text-ink sm:text-[58px] lg:text-[64px]">
            Jadi Jago
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Pilah Sampah!</span>
              <span
                className="absolute inset-x-0 bottom-1 z-0 h-4 rounded-full bg-lime sm:h-5"
                aria-hidden="true"
              />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-muted sm:text-[17.5px]">
            Kenali jenis sampah, pilih tempat yang tepat, dan kumpulkan poin sambil belajar menjaga
            lingkungan. Mainnya sebentar, ngertinya kebawa terus.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-mint px-4 py-2">
            <Icon name="spark" size={16} className="text-primary-dark" />
            <span className="font-display text-[14px] font-extrabold tracking-[-0.01em] text-primary-dark">
              “Sort It Right, Keep Earth Bright!”
            </span>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" icon="play" onClick={onModes}>
              Mulai Bermain
            </Button>
            <Button size="lg" variant="outline" icon="book" onClick={() => onEncyclopedia()}>
              Pelajari Jenis Sampah
            </Button>
          </div>

          <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
            {[
              { icon: "bin" as const, value: ITEM_COUNT, label: "item sampah" },
              { icon: "list" as const, value: CATEGORIES.length, label: "kategori pemilahan" },
              { icon: "target" as const, value: MODE_LIST.length, label: "mode permainan" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon name={stat.icon} size={17} className="text-primary" />
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-[14px] font-semibold text-ink tnum">
                  {stat.value} <span className="font-medium text-muted">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Demo sorter yang bisa langsung dimainkan */}
        <div className="anim-fade-up lg:col-span-5" style={{ animationDelay: "120ms" }}>
          <SorterDemo />
        </div>
      </section>

      {/* ---------------------------- MARQUEE ---------------------------- */}
      <div className="relative mt-12 overflow-hidden rounded-[18px] border border-primary-dark/25 bg-primary-dark py-3">
        <div className="anim-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
              {CATEGORIES.map((category) => (
                <span
                  key={`${copy}-${category.id}`}
                  className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-mint"
                >
                  <Icon name={category.icon} size={16} className="text-lime" />
                  {category.name}
                  <span className="text-lime">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------- CARA BERMAIN -------------------------- */}
      <section className="mt-14">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Cara bermain
          </span>
          <h2 className="mt-2 text-[28px] text-ink sm:text-[34px]">
            Tiga langkah, langsung paham polanya
          </h2>
        </div>

        <Reveal delay={80}>
        <ol className="relative mt-8 grid gap-5 md:grid-cols-3">
          <span
            className="absolute left-6 right-6 top-[46px] hidden border-t-2 border-dashed border-line md:block"
            aria-hidden="true"
          />
          {[
            {
              n: "01",
              icon: "search" as const,
              title: "Belajar memilah sampah",
              text: "Setiap ronde menampilkan satu sampah lengkap dengan ciri dan konteksnya. Perhatikan baik-baik sebelum memilih.",
              offset: "md:mt-0",
            },
            {
              n: "02",
              icon: "timer" as const,
              title: "Tantang kecepatan & ketelitian",
              text: "Pilih satu dari empat tempat sampah. Mode Classic untuk belajar, Time Challenge untuk adu cepat, Learning Mode untuk santai.",
              offset: "md:mt-6",
            },
            {
              n: "03",
              icon: "trophy" as const,
              title: "Kumpulkan poin & pencapaian",
              text: "Jawaban benar menambah skor dan XP. Streak memberi bonus, dan sembilan pencapaian menanti untuk dibuka.",
              offset: "md:mt-12",
            },
          ].map((step) => (
            <li
              key={step.n}
              className={cn(
                "relative rounded-[20px] border border-line bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                step.offset
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-[13px] bg-mint text-primary-dark">
                  <Icon name={step.icon} size={21} />
                </span>
                <span className="font-display text-[26px] font-extrabold leading-none text-line">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-4 text-[19px] text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        </Reveal>
      </section>

      {/* ------------------------- PROGRES LOKAL ------------------------- */}
      <section className="mt-14">
        <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Progres kamu
            </span>
            <h2 className="mt-2 text-[28px] text-ink sm:text-[34px]">
              {hasPlayed ? "Perjalananmu sejauh ini" : "Mulai dari nol, itu sudah langkah bagus"}
            </h2>
            <p className="mt-2 text-[14.5px] text-muted">
              Data di bawah adalah progres lokal kamu sendiri yang tersimpan di browser perangkat ini —
              bukan statistik pengguna lain.
            </p>
          </div>
          {hasPlayed && (
            <Button variant="outline" icon="trophy" onClick={onAchievements}>
              Lihat pencapaian
            </Button>
          )}
        </div>
        </Reveal>

        {hasPlayed ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              <StatTile
                label="Skor terbaik"
                value={Math.max(
                  progress.bestScore.classic,
                  progress.bestScore.time,
                  progress.bestScore.learn
                ).toLocaleString("id-ID")}
                icon="trophy"
                hint={`Classic ${progress.bestScore.classic} · Time ${progress.bestScore.time}`}
                tone="lime"
              />
              <StatTile
                label="Total ronde"
                value={progress.gamesPlayed}
                icon="calendar"
                hint={progress.lastPlayed ? `Terakhir main ${formatDate(progress.lastPlayed)}` : undefined}
              />
              <StatTile
                label="Jawaban benar"
                value={progress.totalCorrect}
                icon="check"
                tone="mint"
                hint={`Akurasi keseluruhan ${overallAccuracy(progress.totalCorrect, progress.totalWrong)}%`}
              />
              <StatTile
                label="Pencapaian terbuka"
                value={`${Object.keys(achievements).length}/9`}
                icon="flag"
                hint={`Streak terbaik ${progress.bestStreak} jawaban beruntun`}
              />
              <div className="sm:col-span-2">
                <LevelMeter xp={progress.xp} />
              </div>
            </div>

            <Card className="p-5 lg:col-span-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[17px] text-ink">Riwayat ronde</h3>
                <Icon name="list" size={17} className="text-muted" />
              </div>
              {history.length === 0 ? (
                <p className="mt-3 text-[13.5px] text-muted">
                  Belum ada ronde tersimpan. Selesaikan satu ronde untuk melihat riwayat di sini.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {history.slice(0, 5).map((round) => (
                    <li
                      key={round.id}
                      className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-soft/60 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-ink">
                          {MODE_LIST.find((mode) => mode.id === round.mode)?.name ?? round.mode}
                        </p>
                        <p className="text-[11.5px] text-muted tnum">
                          {formatDate(round.date)} · {round.correct}B / {round.wrong}S ·{" "}
                          {round.accuracy}%
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-[17px] font-extrabold text-primary tnum">
                        {round.score.toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Button className="mt-4" variant="soft" icon="play" block onClick={onPlay}>
                Main ronde baru
              </Button>
            </Card>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <EmptyState
                icon="sprout"
                title="Belum ada progres tersimpan"
                message="Mainkan satu ronde Classic (sekitar 2 menit) dan skor, XP, serta pencapaianmu akan tersimpan otomatis di browser ini."
                action={
                  <Button icon="play" size="lg" onClick={onModes}>
                    Main ronde pertama
                  </Button>
                }
              />
            </div>
            <div className="lg:col-span-4">
              <LevelMeter xp={0} />
              <p className="mt-3 flex items-start gap-2 rounded-[14px] border border-line bg-card p-3 text-[12.5px] leading-relaxed text-muted">
                <Icon name="info" size={16} className="mt-0.5 shrink-0 text-primary" />
                Naik level dari <strong className="font-semibold text-ink">{level.title}</strong> ke{" "}
                {level.nextTitle} hanya butuh {level.remaining || 250} XP dari hasil permainan.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* --------------------------- KATEGORI --------------------------- */}
      <section className="mt-14">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Empat tempat, empat cara pikir
          </span>
          <h2 className="mt-2 text-[28px] text-ink sm:text-[34px]">
            Kenali kategorinya sebelum memilih
          </h2>
        </div>

        <Reveal delay={60}>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onEncyclopedia(category.id)}
              className="group flex items-start gap-4 rounded-[20px] border border-line bg-card p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span
                className="grid size-12 shrink-0 place-items-center rounded-[14px]"
                style={{ backgroundColor: `var(--cat-${CATEGORY_VAR[category.id]}-soft)`, color: `var(--cat-${CATEGORY_VAR[category.id]})` }}
              >
                <Icon name={category.icon} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[18px] font-extrabold text-ink">{category.name}</span>
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-bold text-muted tnum">
                    {COUNT_BY_CATEGORY[category.id]} item
                  </span>
                </span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">
                  {category.description}
                </span>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-bold text-primary transition-transform duration-200 group-hover:translate-x-1">
                  Lihat item kategori ini
                  <Icon name="arrowRight" size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
        </Reveal>

        <p className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-warn/35 bg-warn/10 p-4 text-[13px] leading-relaxed text-ink">
          <Icon name="info" size={17} className="mt-0.5 shrink-0 text-warn" />
          <span>
            <strong className="font-bold">Catatan edukasi:</strong> klasifikasi di dalam game adalah
            penyederhanaan untuk pembelajaran. Penerimaan suatu barang untuk didaur ulang bisa berbeda
            menurut fasilitas dan kebijakan pengelolaan sampah di daerahmu — selalu ikuti panduan
            pemilahan setempat.
          </span>
        </p>
      </section>
    </div>
  );
}

const CATEGORY_VAR: Record<CategoryId, string> = {
  organik: "org",
  daurulang: "rec",
  residu: "res",
  b3: "haz",
};

function overallAccuracy(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/* ==========================================================================
   Mini-game di hero: pemilahan cepat tanpa skor resmi.
   ========================================================================== */

const DEMO_POOL = WASTE_ITEMS.filter((item) => item.difficulty <= 2);

function SorterDemo() {
  const { sfx } = useStore();
  const [item, setItem] = useState(() => DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)]);
  const [chosen, setChosen] = useState<CategoryId | null>(null);
  const [locked, setLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [tried, setTried] = useState(0);
  const timer = useRef<number | null>(null);

  const isCorrect = chosen !== null && chosen === item.category;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const nextItem = useCallback(() => {
    const pool = DEMO_POOL.filter((entry) => entry.id !== item.id);
    setItem(pool[Math.floor(Math.random() * pool.length)]);
    setChosen(null);
    setLocked(false);
  }, [item.id]);

  const handleChoose = (categoryId: CategoryId) => {
    if (locked) return;
    setLocked(true);
    setChosen(categoryId);
    setTried((value) => value + 1);
    const correct = categoryId === item.category;
    sfx(correct ? "correct" : "wrong");
    setCombo((value) => (correct ? value + 1 : 0));
    clearTimer();
    timer.current = window.setTimeout(nextItem, 1500);
  };

  return (
    <Card className="relative overflow-hidden p-4 sm:p-5">
      <span
        className="line-grid pointer-events-none absolute inset-x-0 top-0 h-24 text-lime opacity-30"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-white">
            <Icon name="play" size={15} />
          </span>
          <div>
            <p className="font-display text-[15px] font-extrabold leading-none text-ink">Coba dulu!</p>
            <p className="mt-1 text-[11.5px] text-muted">Demo cepat · tidak memengaruhi skor</p>
          </div>
        </div>
        <span className="rounded-full border border-line bg-soft px-2.5 py-1 text-[11.5px] font-bold text-muted tnum">
          {combo > 0 ? `🔥 ${combo} beruntun` : `${tried} dicoba`}
        </span>
      </div>

      <WasteCard key={item.id} item={item} size="sm" className="mt-4" />

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((category) => {
          let state: "idle" | "correct" | "wrong" | "muted" = "idle";
          if (chosen) {
            if (category.id === item.category) state = "correct";
            else if (category.id === chosen) state = "wrong";
            else state = "muted";
          }
          return (
            <TrashBin
              key={category.id}
              category={category}
              state={state}
              compact
              disabled={locked}
              onSelect={() => handleChoose(category.id)}
            />
          );
        })}
      </div>

      <div
        className={cn(
          "mt-3 rounded-[14px] border p-3 text-[13px] leading-relaxed transition-colors",
          chosen === null
            ? "border-dashed border-line bg-soft/60 text-muted"
            : isCorrect
              ? "border-correct/35 bg-mint text-primary-dark"
              : "border-wrong/35 bg-haz-soft text-ink"
        )}
        role="status"
        aria-live="polite"
      >
        {chosen === null ? (
          <>Klik salah satu tempat sampah di atas untuk mencoba memilah.</>
        ) : isCorrect ? (
          <>
            <strong className="font-bold">Tepat sekali!</strong> {item.reason}
          </>
        ) : (
          <>
            <strong className="font-bold">Belum tepat.</strong> {item.name} masuk kategori{" "}
            <CategoryBadge category={CATEGORIES.find((c) => c.id === item.category)!} size="sm" /> —{" "}
            {item.wrongHint}
          </>
        )}
      </div>
    </Card>
  );
}
