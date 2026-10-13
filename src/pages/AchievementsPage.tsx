/* ==========================================================================
   EcoSort — Papan Pencapaian
   Pencapaian terbuka berdasarkan DATA permainan yang tersimpan, bukan karena
   pemain membuka halaman ini.
   ========================================================================== */

import { ACHIEVEMENTS, LEVELS, formatDate, levelInfo } from "../lib/game";
import { useStore } from "../store";
import { Button, Card, LevelMeter, ProgressBar, StatTile } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

export default function AchievementsPage({ onPlay }: { onPlay: () => void }) {
  const { progress, achievements, history } = useStore();
  const level = levelInfo(progress.xp);
  const unlockedCount = Object.keys(achievements).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Papan pencapaian
          </span>
          <h1 className="mt-2 text-[34px] leading-[1.02] text-ink sm:text-[44px]">
            Level {level.level} · {level.title}
          </h1>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted">
            {LEVELS.find((entry) => entry.level === level.level)?.blurb} Setiap pencapaian di bawah
            terbuka otomatis saat syarat datanya terpenuhi dari ronde yang kamu selesaikan.
          </p>
        </div>
        <div className="lg:col-span-5">
          <LevelMeter xp={progress.xp} />
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pencapaian" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} icon="trophy" tone="lime" />
        <StatTile label="Total ronde" value={progress.gamesPlayed} icon="calendar" />
        <StatTile label="Jawaban benar" value={progress.totalCorrect} icon="check" tone="mint" />
        <StatTile label="Streak terbaik" value={`${progress.bestStreak}×`} icon="flame" />
      </div>

      {/* --------------------------- DAFTAR PENCAPAIAN --------------------------- */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[24px] text-ink sm:text-[28px]">
            {unlockedCount === 0 ? "Semua masih terkunci" : `${unlockedCount} pencapaian terbuka`}
          </h2>
          <Button icon="play" onClick={onPlay}>
            Main untuk membuka
          </Button>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlockedAt = achievements[achievement.id];
            const unlocked = Boolean(unlockedAt);
            const value = Math.min(achievement.valueOf(progress), achievement.goal);
            const pct = Math.round((value / achievement.goal) * 100);
            return (
              <li key={achievement.id}>
                <Card
                  className={cn(
                    "relative h-full overflow-hidden p-4 transition-all duration-300",
                    unlocked ? "border-lime/60 bg-lime/10 hover:-translate-y-1" : "hover:-translate-y-1"
                  )}
                >
                  <span
                    className="dot-grid pointer-events-none absolute inset-0 opacity-40"
                    style={{ color: unlocked ? "var(--c-lime)" : "var(--c-line)" }}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-[15px] border",
                        unlocked
                          ? "border-transparent bg-lime text-[#1c2a1f]"
                          : "border-line bg-soft text-muted"
                      )}
                    >
                      <Icon name={unlocked ? achievement.icon : "lock"} size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-extrabold leading-tight text-ink">{achievement.name}</h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="relative mt-3.5">
                    {unlocked ? (
                      <p className="flex items-center gap-1.5 text-[12px] font-bold text-primary-dark">
                        <Icon name="check" size={14} />
                        Terbuka {formatDate(unlockedAt as string)}
                      </p>
                    ) : (
                      <>
                        <ProgressBar value={pct} tone="primary" className="h-1.5" label={`Progres ${achievement.name}`} />
                        <p className="mt-1.5 text-[11.5px] font-semibold text-muted tnum">
                          {value.toLocaleString("id-ID")} / {achievement.goal.toLocaleString("id-ID")}
                        </p>
                      </>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --------------------------- RIWAYAT --------------------------- */}
      <section className="mt-10 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name="list" size={18} className="text-primary" />
            Riwayat ronde terakhir
          </h2>
          {history.length === 0 ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
              Belum ada ronde tersimpan. Selesaikan satu ronde dan riwayatnya akan muncul di sini.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {history.map((round) => (
                <li key={round.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-[11px] border",
                      round.mode === "time"
                        ? "border-warn/35 bg-warn/12 text-warn"
                        : round.mode === "learn"
                          ? "border-rec/35 bg-rec-soft text-rec"
                          : "border-primary/25 bg-mint text-primary-dark"
                    )}
                  >
                    <Icon name={round.mode === "time" ? "timer" : round.mode === "learn" ? "book" : "target"} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink">
                      {round.mode === "time"
                        ? "Time Challenge"
                        : round.mode === "learn"
                          ? "Learning Mode"
                          : "Classic Mode"}
                      {round.perfect && (
                        <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1c2a1f]">
                          sempurna
                        </span>
                      )}
                    </p>
                    <p className="text-[11.5px] text-muted tnum">
                      {formatDate(round.date)} · {round.correct}B/{round.wrong}S · akurasi {round.accuracy}% ·
                      streak {round.bestStreak} · +{round.xp} XP
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-[16px] font-extrabold text-primary tnum">
                    {round.score.toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name="info" size={18} className="text-primary" />
            Catatan penting
          </h2>
          <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted">
            <li className="flex items-start gap-2">
              <Icon name="check" size={15} className="mt-0.5 shrink-0 text-correct" />
              Progres, XP, dan pencapaian disimpan di LocalStorage browser perangkat ini.
            </li>
            <li className="flex items-start gap-2">
              <Icon name="close" size={15} className="mt-0.5 shrink-0 text-wrong" />
              Tidak ada leaderboard online maupun multiplayer — aplikasi ini tidak memakai server.
            </li>
            <li className="flex items-start gap-2">
              <Icon name="info" size={15} className="mt-0.5 shrink-0 text-warn" />
              Data tidak tersinkronisasi antarperangkat atau antarbrowser.
            </li>
            <li className="flex items-start gap-2">
              <Icon name="reset" size={15} className="mt-0.5 shrink-0 text-primary" />
              Menghapus data situs atau memakai mode penyamaran akan mengosongkan progres.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
