/* ==========================================================================
   EcoSort — Pengaturan
   Preferensi tampilan, suara, animasi, serta pengelolaan data lokal.
   ========================================================================== */

import { useState } from "react";
import { ACHIEVEMENTS } from "../lib/game";
import { useStore } from "../store";
import { Button, Card, Modal, StatTile, Toggle } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import type { ThemeName } from "../lib/storage";

export default function SettingsPage({ onPlay }: { onPlay: () => void }) {
  const { settings, updateSettings, progress, achievements, history, resetProgress, storageOk, sfx, pushToast } =
    useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const themes: { id: ThemeName; name: string; desc: string }[] = [
    { id: "light", name: "Terang", desc: "Latar putih kehijauan, cocok siang hari" },
    { id: "dim", name: "Redup", desc: "Latar hijau gelap, nyaman di malam hari" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <header>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Pengaturan</span>
        <h1 className="mt-2 text-[34px] leading-[1.02] text-ink sm:text-[42px]">
          Bikin EcoSort senyaman kamu
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">
          Semua preferensi langsung tersimpan di browser ini dan tetap ada saat halaman dimuat ulang.
        </p>
      </header>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {/* --------------------------- TAMPILAN --------------------------- */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name="spark" size={18} className="text-primary" />
            Tampilan
          </h2>
          <p className="mt-1 text-[13.5px] text-muted">Pilih nuansa warna yang paling nyaman di matamu.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {themes.map((theme) => {
              const active = settings.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: theme.id });
                    sfx("click");
                  }}
                  aria-pressed={active}
                  className={cn(
                    "group overflow-hidden rounded-[18px] border-2 p-3 text-left transition-all duration-200 hover:-translate-y-0.5",
                    active ? "border-primary shadow-lift" : "border-line hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "block h-20 w-full rounded-[12px] border p-2.5",
                      theme.id === "light"
                        ? "border-[#e4eae5] bg-[#f7f8f4]"
                        : "border-[#2b3831] bg-[#131a17]"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full",
                          theme.id === "light" ? "bg-[#248a63]" : "bg-[#3cba8a]"
                        )}
                      />
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full",
                          theme.id === "light" ? "bg-[#d7f36a]" : "bg-[#d7f36a]"
                        )}
                      />
                      <span
                        className={cn(
                          "h-4 w-10 rounded-full",
                          theme.id === "light" ? "bg-[#ddf5e8]" : "bg-[#1c3a2c]"
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "mt-2 block h-2 w-3/4 rounded-full",
                        theme.id === "light" ? "bg-[#202b27]/25" : "bg-[#eaf2ec]/30"
                      )}
                    />
                    <span
                      className={cn(
                        "mt-1.5 block h-2 w-1/2 rounded-full",
                        theme.id === "light" ? "bg-[#202b27]/15" : "bg-[#eaf2ec]/15"
                      )}
                    />
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[14.5px] font-bold text-ink">{theme.name}</span>
                    {active && <Icon name="check" size={16} className="text-primary" />}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted">{theme.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 divide-y divide-line">
            <Toggle
              checked={settings.animations}
              onChange={(next) => updateSettings({ animations: next })}
              label="Animasi & transisi"
              description="Pop, shake, dan efek melayan saat menjawab. Matikan bila kamu sensitif terhadap gerakan (pengaturan sistem prefers-reduced-motion juga dihormati)."
              icon="spark"
            />
          </div>
        </Card>

        {/* --------------------------- SUARA --------------------------- */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[19px] text-ink">
            <Icon name={settings.sound ? "soundOn" : "soundOff"} size={18} className="text-primary" />
            Suara
          </h2>
          <p className="mt-1 text-[13.5px] text-muted">
            Efek suara dibuat langsung oleh browser (Web Audio API) — tidak ada file audio yang diunduh
            dan tidak ada suara yang berbunyi sendiri tanpa interaksi.
          </p>

          <div className="mt-2 divide-y divide-line">
            <Toggle
              checked={settings.sound}
              onChange={(next) => {
                updateSettings({ sound: next });
                if (next) sfx("correct");
              }}
              label="Efek suara"
              description="Bunyi saat memilih tempat sampah, jawaban benar/salah, dan pencapaian terbuka."
              icon={settings.sound ? "soundOn" : "soundOff"}
            />
          </div>

          <Button
            className="mt-3"
            variant="outline"
            icon="soundOn"
            onClick={() => {
              if (!settings.sound) {
                pushToast({
                  title: "Suara nonaktif",
                  message: "Aktifkan efek suara dulu untuk mendengar contohnya.",
                  tone: "info",
                });
                return;
              }
              sfx("achievement");
            }}
          >
            Coba suara
          </Button>

          <div className="mt-5 rounded-[16px] border border-line bg-soft/50 p-4">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-ink">
              <Icon name="list" size={16} className="text-primary" />
              Pintasan keyboard
            </h3>
            <ul className="mt-2.5 grid gap-1.5 text-[13px] text-muted sm:grid-cols-2">
              {[
                ["1 – 4", "Pilih tempat sampah"],
                ["Enter / Spasi", "Lanjut ke soal berikut"],
                ["H", "Buka petunjuk (non-Time)"],
                ["Esc", "Jeda / tutup dialog"],
              ].map(([key, action]) => (
                <li key={key} className="flex items-center gap-2">
                  <kbd className="rounded-md border border-line bg-card px-2 py-0.5 font-sans text-[11.5px] font-bold text-ink">
                    {key}
                  </kbd>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* --------------------------- DATA --------------------------- */}
      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[19px] text-ink">
              <Icon name="bin" size={18} className="text-primary" />
              Data &amp; progres lokal
            </h2>
            <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-muted">
              Data disimpan memakai LocalStorage dengan key <code className="rounded bg-soft px-1.5 py-0.5 text-[12px]">ecosort_progress</code>,{" "}
              <code className="rounded bg-soft px-1.5 py-0.5 text-[12px]">ecosort_settings</code>,{" "}
              <code className="rounded bg-soft px-1.5 py-0.5 text-[12px]">ecosort_achievements</code>, dan{" "}
              <code className="rounded bg-soft px-1.5 py-0.5 text-[12px]">ecosort_history</code>. Tidak ada
              data pribadi yang dikumpulkan dan tidak ada data yang dikirim ke server.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold",
              storageOk ? "border-correct/35 bg-mint text-primary-dark" : "border-warn/40 bg-warn/10 text-warn"
            )}
          >
            <Icon name={storageOk ? "check" : "info"} size={14} />
            {storageOk ? "LocalStorage aktif" : "LocalStorage tidak tersedia"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="XP terkumpul" value={progress.xp.toLocaleString("id-ID")} icon="spark" />
          <StatTile label="Ronde dimainkan" value={progress.gamesPlayed} icon="calendar" />
          <StatTile
            label="Pencapaian"
            value={`${Object.keys(achievements).length}/${ACHIEVEMENTS.length}`}
            icon="trophy"
            tone="mint"
          />
          <StatTile label="Riwayat tersimpan" value={history.length} icon="list" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[16px] border border-wrong/30 bg-haz-soft/50 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-ink">Reset seluruh progres</h3>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
              Menghapus XP, level, skor terbaik, pencapaian, dan riwayat ronde di browser ini. Tindakan
              ini tidak bisa dibatalkan dan memerlukan konfirmasi.
            </p>
          </div>
          <Button variant="danger" icon="reset" onClick={() => setConfirmOpen(true)}>
            Reset progres
          </Button>
        </div>
      </Card>

      {/* --------------------------- TENTANG --------------------------- */}
      <Card className="mt-4 p-5">
        <h2 className="flex items-center gap-2 text-[19px] text-ink">
          <Icon name="sprout" size={18} className="text-primary" />
          Tentang EcoSort
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-muted">
          EcoSort adalah game edukasi pemilahan sampah dengan tagline{" "}
          <em className="font-semibold not-italic text-ink">“Sort It Right, Keep Earth Bright!”</em>.
          Proyek ini dibuat sebagai tugas akhir semester oleh kelompok beranggotakan tiga mahasiswa
          Sistem Informasi: satu orang mengurus logika permainan, satu orang mengurus tampilan dan
          pengalaman pengguna, dan satu orang mengurus konten edukasi, penyimpanan data, serta pengujian.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              role: "Anggota 1",
              title: "Game Logic",
              text: "Data soal, validasi jawaban, skor & streak, alur ronde dan hasil.",
            },
            {
              role: "Anggota 2",
              title: "UI / UX",
              text: "Struktur halaman, styling, landing page, gameplay, dan responsivitas.",
            },
            {
              role: "Anggota 3",
              title: "Edukasi & Data",
              text: "Ensiklopedia, LocalStorage, pencapaian, pengujian, dan dokumentasi.",
            },
          ].map((member) => (
            <div key={member.role} className="rounded-[16px] border border-line bg-soft/50 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{member.role}</p>
              <p className="mt-1 font-display text-[16px] font-extrabold text-ink">{member.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{member.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-[14px] border border-warn/35 bg-warn/10 p-3.5 text-[12.5px] leading-relaxed text-ink">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-warn" />
          Klasifikasi sampah di dalam game adalah penyederhanaan untuk pembelajaran. Penerimaan suatu
          barang untuk didaur ulang berbeda menurut fasilitas dan kebijakan daerah — selalu ikuti
          panduan pemilahan setempat.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button icon="play" onClick={onPlay}>
            Mulai bermain
          </Button>
          <a
            href="#/"
            className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-line bg-card px-5 text-[15px] font-semibold text-ink transition-colors hover:border-primary/40"
          >
            <Icon name="home" size={18} />
            Ke beranda
          </a>
        </div>
      </Card>

      {/* --------------------------- KONFIRMASI RESET --------------------------- */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset semua progres?"
        subtitle="Tindakan ini permanen dan hanya memengaruhi browser perangkat ini."
        icon="reset"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              icon="reset"
              onClick={() => {
                resetProgress();
                setConfirmOpen(false);
              }}
            >
              Ya, hapus semua
            </Button>
          </>
        }
      >
        <ul className="space-y-2 text-[13.5px] text-muted">
          {[
            `${progress.xp.toLocaleString("id-ID")} XP dan level ${progress.gamesPlayed > 0 ? "kamu" : "awal"}`,
            `${progress.gamesPlayed} ronde yang sudah dimainkan`,
            `${Object.keys(achievements).length} pencapaian yang sudah terbuka`,
            `${progress.viewedItems.length} item ensiklopedia yang ditandai sudah dipelajari`,
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Icon name="close" size={15} className="mt-0.5 shrink-0 text-wrong" />
              {line}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
