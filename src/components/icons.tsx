/* ==========================================================================
   EcoSort — icons.tsx
   Semua ikon berupa SVG inline (stroke konsisten 1.75) supaya tidak
   bergantung pada file gambar eksternal dan tetap tajam di semua layar.
   ========================================================================== */

import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "leaf"
  | "recycle"
  | "residue"
  | "hazard"
  | "play"
  | "timer"
  | "book"
  | "trophy"
  | "gear"
  | "arrowLeft"
  | "arrowRight"
  | "chevronRight"
  | "chevronDown"
  | "chevronUp"
  | "check"
  | "close"
  | "soundOn"
  | "soundOff"
  | "pause"
  | "heart"
  | "search"
  | "home"
  | "target"
  | "flame"
  | "compass"
  | "calendar"
  | "bolt"
  | "flag"
  | "sprout"
  | "lock"
  | "info"
  | "reset"
  | "spark"
  | "list"
  | "bin"
  | "plus";

const PATHS: Record<IconName, ReactNode> = {
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6 2.4-.5 4.9-2 5.9-3" />
    </>
  ),
  recycle: (
    <>
      <path d="M7.5 8.5 10 5.2a2.3 2.3 0 0 1 3.7-.1l2.4 3.2" />
      <path d="m14.4 4.6 2.1 3.9 3.9-1.6" />
      <path d="M19.6 12.3 20.9 16a2.3 2.3 0 0 1-2.1 3.1l-3.9.1" />
      <path d="m19 14.4-2.6 3.5 3.6 2.2" />
      <path d="M9.9 19.2H6a2.3 2.3 0 0 1-2-3.2l1.9-3.5" />
      <path d="m3.6 15.4 4.2-.3-.4-4.2" />
    </>
  ),
  residue: (
    <>
      <path d="M3.5 6h17" />
      <path d="M8.5 6V4.2c0-.7.5-1.2 1.2-1.2h4.6c.7 0 1.2.5 1.2 1.2V6" />
      <path d="m5.6 6 1 13.1c.05.9.8 1.6 1.7 1.6h7.4c.9 0 1.65-.7 1.7-1.6L18.4 6" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  hazard: (
    <>
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17.4h.01" />
    </>
  ),
  play: <path d="M7 4.5 19 12 7 19.5v-15Z" />,
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 10v3.8l2.4 1.6" />
      <path d="M9.2 2.5h5.6" />
      <path d="m18.6 6.2 1.6-1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.4A2.6 2.6 0 0 1 6.6 17H20" />
      <path d="M6.6 2.5H20v19H6.6A2.6 2.6 0 0 1 4 18.9V5.1a2.6 2.6 0 0 1 2.6-2.6Z" />
      <path d="M9 7h7M9 11h5" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4Z" />
      <path d="M7.5 6H4.8v1a3.2 3.2 0 0 0 3 3.2" />
      <path d="M16.5 6h2.7v1a3.2 3.2 0 0 1-3 3.2" />
      <path d="M12 13.5V17" />
      <path d="M8.5 20.5h7" />
      <path d="M9.5 17h5l.8 3.5H8.7l.8-3.5Z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.1 4.7a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.3 9v.09a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03Z" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H4" />
      <path d="m10 18-6-6 6-6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  chevronRight: <path d="m9.5 18 6.5-6-6.5-6" />,
  chevronDown: <path d="m6 9.5 6 6.5 6-6.5" />,
  chevronUp: <path d="m6 14.5 6-6.5 6 6.5" />,
  check: <path d="M20 6.5 9.4 17.1 4 11.7" />,
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  soundOn: (
    <>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15.2 9.2a4 4 0 0 1 0 5.6" />
      <path d="M18 6.4a8 8 0 0 1 0 11.2" />
    </>
  ),
  soundOff: (
    <>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="m22 9.5-5.5 5.5" />
      <path d="m16.5 9.5 5.5 5.5" />
    </>
  ),
  pause: (
    <>
      <path d="M9 4.5v15" />
      <path d="M15 4.5v15" />
    </>
  ),
  heart: (
    <path d="M20.8 5.6a5 5 0 0 0-7.1 0l-1.7 1.7-1.7-1.7a5 5 0 1 0-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 10.5 8.5-7 8.5 7V20a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 20v-9.5Z" />
      <path d="M9.5 21.5v-7h5v7" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  flame: (
    <path d="M8.6 14.4A2.4 2.4 0 0 0 11 12c0-1.3-.5-2-1-3-1-2-.2-3.8 2-5.7.5 2.4 2 4.7 3.9 6.2 1.9 1.5 2.9 3.3 2.9 5.2a6.8 6.8 0 1 1-13.6 0c0-1.1.4-2.2 1-2.9a2.4 2.4 0 0 0 2.4 2.6Z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.7 8.3-2 5.4-5.4 2 2-5.4 5.4-2Z" />
    </>
  ),
  calendar: (
    <>
      <path d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v12.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5V7a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M8 3v4M16 3v4M3 10.5h18" />
    </>
  ),
  bolt: <path d="M13.2 2.5 3.8 13.8h6.6l-.6 7.7 9.4-11.3h-6.6l.6-7.7Z" />,
  flag: (
    <>
      <path d="M4.5 21.5V3.5" />
      <path d="M4.5 4.8s1.4-.9 4-.9 4.2 1.7 6.8 1.7c1.9 0 3.2-.8 3.2-.8v8.6s-1.3.9-3.2.9c-2.6 0-4.2-1.7-6.8-1.7-2.6 0-4 .9-4 .9V4.8Z" />
    </>
  ),
  sprout: (
    <>
      <path d="M7 20.5h10" />
      <path d="M12 20.5c0-3.6-.6-6.3-1.8-8.1" />
      <path d="M9.7 9.6c1 .7 1.7 2 2.1 3.4-1.9.4-3.3.3-4.5-.3-1.1-.6-2.1-1.8-2.8-3.9 2.6-.5 4.1 0 5.2.8Z" />
      <path d="M13.6 6.2a6.6 6.6 0 0 0-1 3.8c1.8-.1 3.1-.6 4-1.4.9-.9 1.5-2.1 1.6-4.3-2.5.1-3.8 1-4.6 1.9Z" />
    </>
  ),
  lock: (
    <>
      <path d="M5.5 10.5h13v9.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9.5Z" />
      <path d="M8.2 10.5V7.2a3.8 3.8 0 0 1 7.6 0v3.3" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16.5V11" />
      <path d="M12 7.8h.01" />
    </>
  ),
  reset: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.9-6.4L3 8.5" />
      <path d="M3 3.5v5h5" />
    </>
  ),
  spark: (
    <path d="m12 3.2 1.9 5.6 5.6 1.9-5.6 1.9L12 18.2l-1.9-5.6L4.5 10.7l5.6-1.9L12 3.2Z" />
  ),
  list: (
    <>
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <path d="M3.8 6.5h.01M3.8 12h.01M3.8 17.5h.01" />
    </>
  ),
  bin: (
    <>
      <path d="M4 8.5h16l-1.3 11a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 8.5Z" />
      <path d="M9 8.5V5.2c0-.9.8-1.7 1.7-1.7h2.6c.9 0 1.7.8 1.7 1.7v3.3" />
      <path d="M10 12.5v5M14 12.5v5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className = "", ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
