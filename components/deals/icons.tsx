// Inline SVG icons for the Deals page — matches the rest of the site
// (no icon library needed).
type P = { size?: number; className?: string; color?: string; fill?: string };

const base = (size = 16, color = "currentColor", fill = "none") => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill,
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const FlameIcon = ({ size, className, color = "#F97316", fill = "#F97316" }: P) => (
  <svg {...base(size, color, fill)} className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const TimerIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <line x1="10" y1="2" x2="14" y2="2" />
    <line x1="12" y1="14" x2="15" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

export const TagIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const TruckIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <rect x="1" y="3" width="15" height="13" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const ShieldIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const CashIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export const TrendIcon = ({ size, className, color = "#E85D3A" }: P) => (
  <svg {...base(size, color)} className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const SparkIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
  </svg>
);

export const BotIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <rect x="3" y="8" width="18" height="12" rx="3" />
    <path d="M12 8V4" />
    <circle cx="12" cy="3" r="1" />
    <circle cx="9" cy="14" r="1.2" />
    <circle cx="15" cy="14" r="1.2" />
  </svg>
);

export const PiggyIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
    <path d="M16 11h.01" />
  </svg>
);

export const TicketIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v2M13 17v2M13 11v2" />
  </svg>
);

export const GridIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const SearchIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const ArrowIcon = ({ size = 14, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const FilterIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const CloseIcon = ({ size, className, color }: P) => (
  <svg {...base(size, color)} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const HeartIcon = ({ size = 14, filled }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#DC2626" : "none"} stroke={filled ? "#DC2626" : "#5A574E"} strokeWidth={2}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const CartIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const Star = ({ size = 12, on = true }: { size?: number; on?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? "#F5B400" : "#E1DFD8"}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
