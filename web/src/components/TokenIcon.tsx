/**
 * Crypto token brand icons — proper SVG marks, not Unicode glyphs.
 * Each renders as a brand-colored circle with the official-style monogram in white.
 */

type Props = { size?: number; className?: string };

function Frame({ children, color, size = 24, className = "" }: Props & { children: React.ReactNode; color: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="16" r="16" fill={color} />
      {children}
    </svg>
  );
}

export function BTCIcon(p: Props) {
  return (
    <Frame {...p} color="#F7931A">
      {/* Bitcoin "B" with vertical strokes — simplified official mark */}
      <path
        d="M21.92 14.34c.27-1.81-1.11-2.78-2.99-3.43l.61-2.45-1.49-.37-.6 2.38c-.39-.1-.79-.19-1.19-.27l.6-2.4-1.49-.37-.61 2.44c-.32-.07-.64-.15-.95-.22l-2.05-.51-.4 1.59s1.1.25 1.08.26c.6.15.71.55.69.86l-.7 2.79c.04.01.09.03.16.05-.05-.01-.11-.03-.16-.04l-.97 3.91c-.07.18-.26.46-.68.35.01.02-1.08-.27-1.08-.27l-.74 1.7 1.94.48c.36.09.71.18 1.06.27l-.61 2.46 1.49.37.6-2.42c.41.11.81.21 1.2.31l-.6 2.41 1.49.37.61-2.45c2.55.48 4.46.29 5.27-2.02.65-1.86-.03-2.93-1.38-3.63 1-.23 1.74-.88 1.94-2.24Zm-3.48 4.79c-.46 1.86-3.6.85-4.62.6l.81-3.27c1.02.26 4.3.76 3.81 2.67Zm.46-4.81c-.42 1.69-3.04.83-3.88.62l.73-2.96c.85.21 3.59.6 3.15 2.34Z"
        fill="#fff"
      />
    </Frame>
  );
}

export function ETHIcon(p: Props) {
  return (
    <Frame {...p} color="#627EEA">
      {/* Ethereum diamond — light/dark face split */}
      <g fill="#fff">
        <path d="M16.5 4v8.87l7.5 3.35z" fillOpacity="0.6" />
        <path d="M16.5 4 9 16.22l7.5-3.35z" />
        <path d="M16.5 21.97V28l7.5-10.39z" fillOpacity="0.6" />
        <path d="M16.5 28v-6.03L9 17.61z" />
        <path d="m16.5 20.57 7.5-4.35-7.5-3.35z" fillOpacity="0.2" />
        <path d="m9 16.22 7.5 4.35v-7.7z" fillOpacity="0.6" />
      </g>
    </Frame>
  );
}

export function USDTIcon(p: Props) {
  return (
    <Frame {...p} color="#26A17B">
      {/* Tether "T" inside vertical capsule — official mark */}
      <path
        d="M17.92 17.38v-.01c-.11.01-.67.04-1.91.04-.99 0-1.69-.03-1.93-.04v.01c-3.81-.17-6.65-.83-6.65-1.62 0-.8 2.84-1.46 6.65-1.63v2.59c.25.02.96.06 1.95.06 1.19 0 1.78-.05 1.89-.06v-2.59c3.8.17 6.64.83 6.64 1.63 0 .79-2.84 1.46-6.64 1.62m0-3.51v-2.32h5.3V8h-14.5v3.55h5.31v2.32c-4.31.2-7.55 1.05-7.55 2.08 0 1.02 3.24 1.88 7.55 2.07v7.43h3.83v-7.42c4.3-.2 7.54-1.05 7.54-2.08 0-1.02-3.24-1.87-7.54-2.07"
        fill="#fff"
      />
    </Frame>
  );
}

export function USDCIcon(p: Props) {
  return (
    <Frame {...p} color="#2775CA">
      {/* USDC concentric ring + dollar sign — official mark style */}
      <g fill="#fff">
        <path d="M20.022 18.5c0-1.788-1.072-2.4-3.216-2.66-1.532-.205-1.84-.616-1.84-1.328 0-.712.51-1.17 1.532-1.17.92 0 1.43.308 1.685.971.052.153.206.255.358.255h.817c.205 0 .357-.153.357-.358v-.05c-.205-1.124-1.124-1.99-2.297-2.092v-1.227c0-.205-.152-.358-.408-.41h-.766c-.205 0-.357.154-.41.41v1.176c-1.532.205-2.502 1.226-2.502 2.5 0 1.685 1.022 2.349 3.165 2.605 1.43.255 1.89.561 1.89 1.378 0 .817-.715 1.379-1.685 1.379-1.327 0-1.787-.562-1.94-1.327-.05-.205-.205-.307-.357-.307h-.868c-.205 0-.358.153-.358.358v.05c.205 1.277 1.022 2.196 2.706 2.452v1.226c0 .205.153.358.408.41h.767c.205 0 .357-.154.41-.41v-1.226c1.531-.256 2.553-1.328 2.553-2.706z" />
        <path d="M13.49 23.872c-3.98-1.43-6.022-5.872-4.54-9.8.766-2.144 2.45-3.83 4.54-4.595.205-.103.307-.256.307-.511v-.715c0-.205-.102-.358-.307-.41-.052 0-.154 0-.205.052-4.847 1.532-7.503 6.685-5.97 11.532.92 2.86 3.114 5.054 5.97 5.972.205.103.41 0 .46-.205.052-.05.052-.102.052-.205v-.715c0-.153-.154-.358-.307-.4zm5.04-15.97c-.204-.103-.41 0-.46.205-.05.05-.05.102-.05.205v.715c0 .205.153.41.306.46 3.98 1.43 6.022 5.872 4.54 9.8-.766 2.144-2.45 3.83-4.54 4.595-.205.103-.307.256-.307.511v.715c0 .205.102.358.307.41.052 0 .154 0 .205-.052 4.847-1.532 7.503-6.685 5.97-11.532-.92-2.911-3.165-5.105-5.971-6.023z" />
      </g>
    </Frame>
  );
}

export function TokenIcon({ token, size = 24, className = "" }: { token: string; size?: number; className?: string }) {
  switch (token.toUpperCase()) {
    case "BTC":  return <BTCIcon size={size} className={className} />;
    case "ETH":  return <ETHIcon size={size} className={className} />;
    case "USDT": return <USDTIcon size={size} className={className} />;
    case "USDC": return <USDCIcon size={size} className={className} />;
    default:
      return (
        <span
          className={`rounded-full bg-white/10 text-white/60 flex items-center justify-center font-mono font-bold shrink-0 ${className}`}
          style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
        >
          {token.slice(0, 3).toUpperCase()}
        </span>
      );
  }
}
