/**
 * The Maschinenkindt sigil — the mark the page is remembered by.
 * A ritual circle (occult) fused with cog teeth (machine) around an
 * upward alchemical triangle (fire) and an angular inner diamond.
 * Pure SVG so it stays crisp at any size and animates cheaply.
 */
export function Sigil({
  className,
  strokeWidth = 1.4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  // 24 cog teeth around the outer ritual band.
  // Coordinates are rounded to a fixed precision so the server and client
  // stringify identically — otherwise floating-point drift trips React's
  // hydration check.
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  const teeth = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const inner = 92;
    const outer = i % 2 === 0 ? 100 : 96;
    return {
      x1: r3(100 + Math.cos(a) * inner),
      y1: r3(100 + Math.sin(a) * inner),
      x2: r3(100 + Math.cos(a) * outer),
      y2: r3(100 + Math.sin(a) * outer),
      major: i % 2 === 0,
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* ritual bands */}
      <circle cx="100" cy="100" r="88" opacity="0.9" />
      <circle cx="100" cy="100" r="70" opacity="0.45" />
      {/* cog teeth */}
      {teeth.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          opacity={t.major ? 0.9 : 0.4}
        />
      ))}
      {/* cardinal ticks */}
      <line x1="100" y1="4" x2="100" y2="18" />
      <line x1="100" y1="182" x2="100" y2="196" />
      <line x1="4" y1="100" x2="18" y2="100" />
      <line x1="182" y1="100" x2="196" y2="100" />
      {/* alchemical fire triangle */}
      <path d="M100 42 L142 128 L58 128 Z" opacity="0.85" />
      {/* angular inner diamond — kantig */}
      <path d="M100 62 L134 100 L100 138 L66 100 Z" opacity="0.55" />
      {/* machine core */}
      <circle cx="100" cy="100" r="7" fill="currentColor" stroke="none" />
      <circle cx="100" cy="100" r="20" opacity="0.6" />
    </svg>
  );
}
