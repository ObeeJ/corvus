type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  muted?: boolean;
};

/**
 * Corvus brand mark.
 * Composition: vertical anchor (state) + two horizontal bars (the bracketed "C") + inner wedge (beak / signal pointer).
 * Two weights, two colors: the anchor reads quiet, the bars and wedge carry the brand accent.
 */
export function Logo({
  size = 22,
  withWordmark = true,
  className = "",
  wordmarkClassName = "",
  muted = false,
}: LogoProps) {
  const accent = muted ? "#F97316" : "#F97316";
  const anchor = muted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.78)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        {/* Vertical anchor stroke (left edge of the C) */}
        <rect x="5" y="5" width="2.5" height="22" fill={anchor} />

        {/* Top horizontal bar */}
        <rect x="5" y="5" width="15" height="2.5" fill={accent} />

        {/* Bottom horizontal bar */}
        <rect x="5" y="24.5" width="15" height="2.5" fill={accent} />

        {/* Inner wedge: beak / outbound signal pointer */}
        <path d="M13 12 L23 16 L13 20 Z" fill={accent} />

        {/* Tiny precision dot inside the wedge: adds a single point of detail at large sizes */}
        <circle cx="15" cy="16" r="0.9" fill="#0c0d10" />
      </svg>

      {withWordmark && (
        <span
          className={`font-mono font-semibold tracking-[0.2em] uppercase ${wordmarkClassName}`}
        >
          Corvus
        </span>
      )}
    </span>
  );
}
