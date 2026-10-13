/* ==========================================================================
   EcoSort — ui.tsx
   Kumpulan komponen tampilan yang dipakai ulang di semua halaman
   (tombol, kartu, progress bar, modal, toggle, toast, empty state).
   ========================================================================== */

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Icon, type IconName } from "./icons";
import type { Toast } from "../store";
import { levelInfo } from "../lib/game";

/* ----------------------------- Button ----------------------------- */

type Variant = "primary" | "lime" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_10px_22px_-12px_var(--c-primary)] border border-transparent",
  lime: "bg-lime text-[#1c2a1f] hover:brightness-[1.05] border border-[#c2dd57]/70 shadow-[0_10px_22px_-14px_#9dbb3a]",
  outline: "bg-card text-ink border border-line hover:border-primary/50 hover:bg-mint/40",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-soft border border-transparent",
  danger: "bg-wrong text-white hover:brightness-95 border border-transparent",
  soft: "bg-mint text-primary-dark hover:brightness-[0.98] border border-primary/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]",
  md: "h-11 px-5 text-[15px] gap-2 rounded-[12px]",
  lg: "h-14 px-7 text-base gap-2.5 rounded-[14px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold tracking-[-0.01em]",
        "transition-[transform,background-color,border-color,box-shadow,filter] duration-200",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === "lg" ? 20 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 20 : 18} />}
    </button>
  );
}

/* ------------------------------ Card ------------------------------ */

export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[20px] border border-line bg-card shadow-soft",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1",
        "text-[11px] font-bold uppercase tracking-[0.14em] text-muted",
        className
      )}
    >
      {icon && <Icon name={icon} size={13} className="text-primary" />}
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center"
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="mb-2 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl text-ink sm:text-[32px]">{title}</h2>
        {description && <p className="mt-2 text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------- ProgressBar ---------------------------- */

export function ProgressBar({
  value,
  tone = "primary",
  striped = false,
  className,
  label,
}: {
  value: number;
  tone?: "primary" | "lime" | "warn" | "wrong" | "correct";
  striped?: boolean;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const toneClass = {
    primary: "bg-primary",
    lime: "bg-lime",
    warn: "bg-warn",
    wrong: "bg-wrong",
    correct: "bg-correct",
  }[tone];
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-soft", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progres"}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", toneClass)}
        style={{ width: `${pct}%` }}
      >
        {striped && pct > 2 && <div className="stripe-bar h-full w-full rounded-full" />}
      </div>
    </div>
  );
}

/* ------------------------------ Chip ------------------------------ */

export function Chip({
  active,
  onClick,
  children,
  icon,
  className,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: IconName;
  className?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold",
        "transition-all duration-200 hover:-translate-y-0.5",
        active
          ? "border-primary bg-primary text-white shadow-[0_8px_18px_-12px_var(--c-primary)]"
          : "border-line bg-card text-muted hover:border-primary/40 hover:text-ink",
        className
      )}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tnum",
            active ? "bg-white/25 text-white" : "bg-soft text-muted"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ------------------------------ Toggle ------------------------------ */

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  icon?: IconName;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] border transition-colors",
              checked
                ? "border-primary/25 bg-mint text-primary-dark"
                : "border-line bg-soft text-muted"
            )}
          >
            <Icon name={icon} size={18} />
          </span>
        )}
        <div>
          <p className="text-[15px] font-semibold text-ink">{label}</p>
          {description && <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors duration-200",
          checked ? "border-primary bg-primary" : "border-line bg-soft"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-200",
            checked ? "left-[26px]" : "left-[3px]"
          )}
        />
      </button>
    </div>
  );
}

/* ------------------------------ Modal ------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    const previous = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-[#0d1512]/55 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "anim-fade-up relative w-full overflow-hidden rounded-t-[24px] border border-line bg-card shadow-lift sm:rounded-[24px]",
          width
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
          {icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-mint text-primary-dark">
              <Icon name={icon} size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="text-lg leading-tight text-ink sm:text-xl">
              {title}
            </h3>
            {subtitle && <p className="mt-1 text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="max-h-[62vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-soft/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Toast host --------------------------- */

const TOAST_TONE: Record<Toast["tone"], { border: string; badge: string; icon: IconName }> = {
  info: { border: "border-primary/30", badge: "bg-mint text-primary-dark", icon: "info" },
  success: { border: "border-correct/35", badge: "bg-mint text-correct", icon: "check" },
  danger: { border: "border-wrong/35", badge: "bg-haz-soft text-wrong", icon: "info" },
  achievement: { border: "border-lime", badge: "bg-lime text-[#1c2a1f]", icon: "trophy" },
};

export function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-3 sm:items-end sm:pr-5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const tone = TOAST_TONE[toast.tone];
        return (
          <div
            key={toast.id}
            className={cn(
              "anim-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[16px] border bg-card p-3 shadow-lift",
              tone.border
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-[11px]", tone.badge)}>
              <Icon
                name={
                  toast.tone === "achievement" && toast.icon
                    ? (toast.icon as IconName)
                    : tone.icon
                }
                size={18}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">{toast.title}</p>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug text-ink">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-ink"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- Empty state --------------------------- */

export function EmptyState({
  icon = "search",
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-[18px] bg-mint text-primary-dark">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="max-w-sm text-[14px] text-muted">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* --------------------------- Level meter --------------------------- */

export function LevelMeter({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const info = levelInfo(xp);
  return (
    <div className={cn("rounded-[18px] border border-line bg-card p-4", compact && "p-3.5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-[12px] bg-lime text-[15px] font-extrabold text-[#1c2a1f] tnum">
            {info.level}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Level sekarang</p>
            <p className="font-display text-[17px] font-extrabold leading-tight text-ink">{info.title}</p>
          </div>
        </div>
        <p className="shrink-0 text-right text-[12px] font-semibold text-muted tnum">
          {xp.toLocaleString("id-ID")} XP
        </p>
      </div>
      <ProgressBar
        className="mt-3.5"
        value={info.pct}
        tone={info.nextTitle ? "primary" : "lime"}
        label={`Progres menuju level ${info.level + 1}`}
      />
      <p className="mt-2 text-[12.5px] text-muted">
        {info.nextTitle ? (
          <>
            Butuh <strong className="font-bold text-ink tnum">{info.remaining} XP</strong> lagi untuk jadi{" "}
            <strong className="font-bold text-ink">{info.nextTitle}</strong>.
          </>
        ) : (
          <>Level tertinggi sudah tercapai. Jago pilah sampah sejati!</>
        )}
      </p>
    </div>
  );
}

/* --------------------------- Scroll reveal --------------------------- */

/**
 * Membungkus konten agar muncul perlahan saat masuk viewport.
 * Bila browser tidak mendukung IntersectionObserver, konten langsung ditampilkan.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(shown ? "anim-fade-up" : "opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* --------------------------- Stat tile --------------------------- */

export function StatTile({
  label,
  value,
  icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon: IconName;
  hint?: string;
  tone?: "default" | "lime" | "mint";
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[18px] border border-line bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        tone === "lime" && "bg-lime/15 border-lime/50",
        tone === "mint" && "bg-mint/50"
      )}
    >
      <div className="flex items-center gap-2 text-muted">
        <Icon name={icon} size={15} className="text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-[0.13em]">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-[26px] font-extrabold leading-none text-ink tnum">{value}</p>
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}
