/* ==========================================================================
   EcoSort — Ensiklopedia Sampah (Anggota 3: Edukasi)
   Pencarian nama, filter kategori, pengurutan, dan detail lengkap tiap item.
   Membuka detail item dicatat sebagai "sudah dipelajari" (pencapaian lokal).
   ========================================================================== */

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  COUNT_BY_CATEGORY,
  ITEM_COUNT,
  WASTE_ITEMS,
  type CategoryId,
  type WasteItem,
} from "../data/waste";
import { useStore } from "../store";
import { Button, Card, Chip, EmptyState, Modal, ProgressBar } from "../components/ui";
import { Icon } from "../components/icons";
import { BIN_COLOR, CategoryBadge } from "../components/sorting";
import { cn } from "../utils/cn";

type SortKey = "kategori" | "nama" | "kesulitan";

export default function EncyclopediaPage({
  initialCategory,
  onPlay,
}: {
  initialCategory: CategoryId | null;
  onPlay: () => void;
}) {
  const { progress, recordItemView, sfx } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryId | "all">(initialCategory ?? "all");
  const [sort, setSort] = useState<SortKey>("kategori");
  const [selected, setSelected] = useState<WasteItem | null>(null);

  // Ikuti kategori yang dipilih dari halaman beranda (atau dari URL hash)
  useEffect(() => {
    setFilter(initialCategory ?? "all");
  }, [initialCategory]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = WASTE_ITEMS.filter((item) => {
      const matchCategory = filter === "all" || item.category === filter;
      if (!matchCategory) return false;
      if (!keyword) return true;
      const haystack = [item.name, item.description, item.fact, ...item.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });

    const categoryOrder = CATEGORIES.map((category) => category.id);
    return [...list].sort((a, b) => {
      if (sort === "nama") return a.name.localeCompare(b.name, "id");
      if (sort === "kesulitan") return a.difficulty - b.difficulty || a.name.localeCompare(b.name, "id");
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.name.localeCompare(b.name, "id");
    });
  }, [filter, query, sort]);

  const learnedCount = progress.viewedItems.length;

  const openDetail = (item: WasteItem) => {
    setSelected(item);
    sfx("pop");
    recordItemView(item.id);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Ensiklopedia sampah
          </span>
          <h1 className="mt-2 text-[34px] leading-[1.02] text-ink sm:text-[44px]">
            {ITEM_COUNT} sampah yang wajib kamu kenali
          </h1>
          <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">
            Cari berdasarkan nama, saring berdasarkan kategori, lalu buka kartunya untuk membaca ciri,
            fakta, dan cara penanganan yang aman. Semua penjelasan bersifat umum — ikuti juga panduan
            pemilahan di daerahmu.
          </p>
        </div>

        <Card className="p-4 lg:col-span-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
              Sudah dipelajari
            </p>
            <p className="font-display text-[15px] font-extrabold text-ink tnum">
              {learnedCount}/{ITEM_COUNT}
            </p>
          </div>
          <ProgressBar
            className="mt-2.5"
            value={(learnedCount / ITEM_COUNT) * 100}
            tone={learnedCount >= 10 ? "lime" : "primary"}
            label="Progres item yang sudah dipelajari"
          />
          <p className="mt-2 text-[12px] leading-snug text-muted">
            Buka 10 item untuk membuka pencapaian{" "}
            <strong className="font-semibold text-ink">Kutu Buku Hijau</strong>.
          </p>
        </Card>
      </header>

      {/* --------------------------- PENCARIAN & FILTER --------------------------- */}
      <div className="sticky top-[68px] z-30 mt-6 rounded-[20px] border border-line bg-card/95 p-3 shadow-soft backdrop-blur-md lg:top-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari sampah, misalnya: baterai, kardus, tisu…"
              aria-label="Cari item sampah berdasarkan nama"
              className="h-12 w-full rounded-[14px] border border-line bg-soft/60 pl-11 pr-10 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/80 focus:border-primary focus:bg-card"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus kata pencarian"
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-ink"
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Chip active={filter === "all"} onClick={() => setFilter("all")} icon="list" count={ITEM_COUNT}>
              Semua
            </Chip>
            {CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                active={filter === category.id}
                onClick={() => setFilter(category.id)}
                icon={category.icon}
                count={COUNT_BY_CATEGORY[category.id]}
              >
                {category.name}
              </Chip>
            ))}

            <div className="ml-auto flex items-center gap-1 rounded-full border border-line bg-soft/60 p-1">
              {(
                [
                  { key: "kategori", label: "Kategori" },
                  { key: "nama", label: "Nama" },
                  { key: "kesulitan", label: "Tingkat" },
                ] as { key: SortKey; label: string }[]
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  aria-pressed={sort === option.key}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                    sort === option.key ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] text-muted tnum" role="status">
        Menampilkan <strong className="font-bold text-ink">{filtered.length}</strong> dari {ITEM_COUNT}{" "}
        item
        {filter !== "all" && (
          <>
            {" "}
            pada kategori{" "}
            <strong className="font-bold text-ink">
              {CATEGORIES.find((category) => category.id === filter)?.name}
            </strong>
          </>
        )}
        {query && (
          <>
            {" "}
            untuk kata <strong className="font-bold text-ink">“{query}”</strong>
          </>
        )}
      </p>

      {/* --------------------------- DAFTAR ITEM --------------------------- */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="search"
            title="Tidak ada item yang cocok"
            message="Coba kata kunci lain seperti “plastik”, “kertas”, atau “baterai”. Kamu juga bisa menghapus filter kategori."
            action={
              <Button
                variant="outline"
                icon="reset"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Reset pencarian &amp; filter
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, position) => {
            const learned = progress.viewedItems.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openDetail(item)}
                  className={cn(
                    "group flex h-full w-full flex-col rounded-[20px] border bg-card p-4 text-left shadow-soft",
                    "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                    learned ? "border-primary/30" : "border-line"
                  )}
                  style={{ animationDelay: `${Math.min(position, 12) * 28}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="grid size-12 shrink-0 place-items-center rounded-[14px] text-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `color-mix(in srgb, ${BIN_COLOR[item.category]} 14%, transparent)` }}
                      aria-hidden="true"
                    >
                      {item.emoji}
                    </span>
                    {learned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-primary-dark">
                        <Icon name="check" size={11} />
                        Dipelajari
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5" aria-label={`Tingkat kesulitan ${item.difficulty} dari 3`}>
                        {[1, 2, 3].map((dot) => (
                          <span
                            key={dot}
                            className={cn("size-1.5 rounded-full", dot <= item.difficulty ? "bg-warn" : "bg-line")}
                          />
                        ))}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-[15.5px] font-bold leading-snug text-ink">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                    <CategoryBadge category={CATEGORIES.find((c) => c.id === item.category)!} size="sm" />
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Detail
                      <Icon name="chevronRight" size={13} />
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-[20px] border border-line bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[18px] text-ink">Sudah paham? Uji langsung!</h2>
          <p className="mt-1 text-[13.5px] text-muted">
            Learning Mode memakai item yang sama dengan ensiklopedia ini, lengkap dengan penjelasannya.
          </p>
        </div>
        <Button icon="play" onClick={onPlay}>
          Main sekarang
        </Button>
      </div>

      {/* --------------------------- DETAIL ITEM --------------------------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected ? `Tingkat ${selected.difficulty === 1 ? "mudah" : selected.difficulty === 2 ? "sedang" : "menjebak"}` : undefined}
        icon="info"
        size="lg"
        footer={
          <>
            <Button variant="ghost" icon="close" onClick={() => setSelected(null)}>
              Tutup
            </Button>
            <Button icon="play" onClick={onPlay}>
              Latihan di game
            </Button>
          </>
        }
      >
        {selected && (
          <div>
            <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-line bg-soft/50 p-4">
              <span
                className="grid size-16 shrink-0 place-items-center rounded-[18px] text-4xl"
                style={{ backgroundColor: `color-mix(in srgb, ${BIN_COLOR[selected.category]} 15%, transparent)` }}
                aria-hidden="true"
              >
                {selected.emoji}
              </span>
              <div className="min-w-0">
                <CategoryBadge category={CATEGORIES.find((c) => c.id === selected.category)!} />
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{selected.description}</p>
              </div>
            </div>

            <dl className="mt-4 space-y-3">
              <DetailRow icon="leaf" title="Kenapa masuk kategori ini" text={selected.reason} />
              <DetailRow icon="spark" title="Fakta edukasi" text={selected.fact} />
              <DetailRow icon="check" title="Cara penanganan umum" text={selected.handling} />
              <DetailRow
                icon="info"
                title="Catatan kategori"
                text={CATEGORIES.find((c) => c.id === selected.category)!.note}
              />
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted">
                Kata kunci
              </span>
              {selected.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line bg-soft px-2.5 py-1 text-[12px] font-semibold text-muted">
                  #{tag}
                </span>
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-[14px] border border-warn/35 bg-warn/10 p-3 text-[12.5px] leading-relaxed text-ink">
              <Icon name="hazard" size={16} className="mt-0.5 shrink-0 text-warn" />
              Jangan membakar sampah plastik dan jangan membuang baterai atau limbah kimia ke saluran
              air. Serahkan limbah khusus ke titik pengumpulan resmi di lingkunganmu.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({
  icon,
  title,
  text,
}: {
  icon: "leaf" | "spark" | "check" | "info";
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-card p-3.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        <Icon name={icon} size={14} className="text-primary" />
        {title}
      </dt>
      <dd className="mt-1.5 text-[14px] leading-relaxed text-ink">{text}</dd>
    </div>
  );
}
