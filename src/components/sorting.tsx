/* ==========================================================================
   EcoSort — sorting.tsx
   Komponen inti permainan: badge kategori, tempat sampah (bin), dan kartu
   sampah. Setiap tempat sampah SELALU punya nama + ikon + warna, jadi tidak
   bergantung pada warna saja (ramah untuk pemain buta warna).
   ========================================================================== */

import { cn } from "../utils/cn";
import { Icon } from "./icons";
import {
  CATEGORY_MAP,
  CATEGORY_STYLE,
  type Category,
  type CategoryId,
  type WasteItem,
} from "../data/waste";

/* Warna kategori diambil dari CSS variable agar otomatis ikut tema terang/dim */
export const BIN_COLOR: Record<CategoryId, string> = {
  organik: "var(--cat-org)",
  daurulang: "var(--cat-rec)",
  residu: "var(--cat-res)",
  b3: "var(--cat-haz)",
};

export const BIN_SOFT: Record<CategoryId, string> = {
  organik: "var(--cat-org-soft)",
  daurulang: "var(--cat-rec-soft)",
  residu: "var(--cat-res-soft)",
  b3: "var(--cat-haz-soft)",
};

export const CATEGORY_HOTKEY: Record<CategoryId, string> = {
  organik: "1",
  daurulang: "2",
  residu: "3",
  b3: "4",
};

/* --------------------------- CategoryBadge --------------------------- */

export function CategoryBadge({
  category,
  size = "md",
  withIcon = true,
}: {
  category: Category;
  size?: "sm" | "md";
  withIcon?: boolean;
}) {
  const style = CATEGORY_STYLE[category.id];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold",
        style.soft,
        style.text,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12.5px]"
      )}
    >
      {withIcon && <Icon name={category.icon} size={size === "sm" ? 12 : 14} />}
      {category.name}
    </span>
  );
}

/* ------------------------------ TrashBin ------------------------------ */

export type BinState = "idle" | "correct" | "wrong" | "reveal" | "muted";

export function TrashBin({
  category,
  state = "idle",
  onSelect,
  disabled = false,
  compact = false,
  className,
}: {
  category: Category;
  state?: BinState;
  onSelect?: () => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const color = BIN_COLOR[category.id];
  const soft = BIN_SOFT[category.id];
  const lidOpen = state === "correct" || state === "reveal";

  const isButton = typeof onSelect === "function";
  const Tag = isButton ? "button" : "div";
  const interactiveProps = isButton
    ? { type: "button" as const, onClick: onSelect, disabled }
    : {};

  return (
    <Tag
      {...interactiveProps}
      aria-label={`Tempat sampah ${category.name}. ${category.tagline}`}
      className={cn(
        "group relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-[18px] border-2 p-3 text-center",
        "transition-[transform,border-color,background-color,box-shadow] duration-200 sm:p-4",
        isButton && "hover:-translate-y-1 hover:shadow-lift active:translate-y-0 active:scale-[0.98] cursor-pointer",
        disabled && "cursor-not-allowed",
        state === "idle" && "border-line bg-card",
        state === "muted" && "border-line bg-card opacity-40 saturate-50",
        state === "correct" && "border-transparent shadow-lift anim-pop",
        state === "wrong" && "border-wrong bg-haz-soft/60 anim-shake",
        state === "reveal" && "border-dashed",
        className
      )}
      style={
        state === "correct" || state === "reveal"
          ? { borderColor: color, backgroundColor: soft }
          : undefined
      }
    >
      {/* Nomor pintasan keyboard */}
      {isButton && !compact && (
        <span className="absolute left-2 top-2 z-10 grid size-6 place-items-center rounded-md border border-line bg-card text-[11px] font-bold text-muted tnum">
          {CATEGORY_HOTKEY[category.id]}
        </span>
      )}

      {/* Tanda benar / salah: selalu ada ikon + teks, bukan warna saja */}
      {state === "correct" && (
        <span className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-correct text-white">
          <Icon name="check" size={16} />
          <span className="sr-only">Jawaban benar</span>
        </span>
      )}
      {state === "wrong" && (
        <span className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-wrong text-white">
          <Icon name="close" size={16} />
          <span className="sr-only">Jawaban salah</span>
        </span>
      )}
      {state === "reveal" && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          Jawaban benar
        </span>
      )}

      <BinArt color={color} open={lidOpen} compact={compact} />

      <div className="flex items-center justify-center gap-1.5">
        <Icon name={category.icon} size={compact ? 14 : 16} style={{ color }} />
        <span
          className={cn(
            "font-display font-extrabold leading-tight text-ink",
            compact ? "text-[13px]" : "text-[15px] sm:text-base"
          )}
        >
          {category.binLabel}
        </span>
      </div>
      {!compact && (
        <span className="text-[11.5px] font-medium leading-snug text-muted">{category.tagline}</span>
      )}
    </Tag>
  );
}

function BinArt({ color, open, compact }: { color: string; open: boolean; compact: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", compact ? "h-14 w-14" : "h-16 w-16 sm:h-[72px] sm:w-[72px]")}
      aria-hidden="true"
    >
      {/* Badan tempat sampah */}
      <path
        d="M17 24h30l-2.9 32.1A5 5 0 0 1 39.1 61H24.9a5 5 0 0 1-5-4.9L17 24Z"
        fill={color}
        opacity="0.16"
      />
      <path
        d="M17 24h30l-2.9 32.1A5 5 0 0 1 39.1 61H24.9a5 5 0 0 1-5-4.9L17 24Z"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M27 32v21M37 32v21"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Tutup (berputar saat terbuka) */}
      <g
        style={{
          transformOrigin: "13px 17px",
          transform: open ? "rotate(-19deg)" : "rotate(0deg)",
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <rect x="11" y="14" width="42" height="6.5" rx="3.2" fill={color} />
        <rect x="26.5" y="8.5" width="11" height="5.5" rx="2.7" fill={color} opacity="0.75" />
      </g>
    </svg>
  );
}

/* ------------------------------ WasteCard ------------------------------ */

export function WasteCard({
  item,
  state = "idle",
  showCategory = false,
  size = "lg",
  className,
}: {
  item: WasteItem;
  state?: "idle" | "correct" | "wrong" | "flying";
  showCategory?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border bg-card text-center shadow-lift",
        size === "lg" ? "border-line p-6 sm:p-8" : "border-line p-4",
        state === "wrong" && "anim-shake border-wrong",
        state === "flying" && "anim-fly",
        className
      )}
    >
      {/* Tekstur titik halus agar kartu tidak polos */}
      <span
        className="dot-grid pointer-events-none absolute inset-0 text-line opacity-70"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-mint opacity-60 blur-xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
            <Icon name="spark" size={12} className="text-primary" />
            Tingkat {item.difficulty === 1 ? "mudah" : item.difficulty === 2 ? "sedang" : "menjebak"}
          </span>
          <span className="flex items-center gap-1" aria-label={`Tingkat kesulitan ${item.difficulty} dari 3`}>
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={cn(
                  "size-2 rounded-full",
                  dot <= item.difficulty ? "bg-warn" : "bg-soft"
                )}
              />
            ))}
          </span>
        </div>

        <div
          className={cn(
            "mx-auto mt-4 grid place-items-center rounded-full bg-mint",
            size === "lg" ? "size-28 sm:size-32" : "size-16"
          )}
        >
          <span
            className={cn(
              state === "idle" ? "anim-float" : undefined,
              size === "lg" ? "text-6xl sm:text-7xl" : "text-3xl"
            )}
            style={{ ["--dur" as string]: "6s" }}
            role="img"
            aria-label={`Ilustrasi ${item.name}`}
          >
            {item.emoji}
          </span>
        </div>

        <h3
          className={cn(
            "mx-auto mt-4 max-w-md font-extrabold text-ink",
            size === "lg" ? "text-2xl sm:text-[30px]" : "text-base"
          )}
        >
          {item.name}
        </h3>
        {size === "lg" && (
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">
            {item.description}
          </p>
        )}

        {showCategory && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <CategoryBadge category={CATEGORY_MAP[item.category]} />
            <span className="text-[12.5px] text-muted">{item.tags.slice(0, 3).map((tag) => `#${tag}`).join(" ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}


