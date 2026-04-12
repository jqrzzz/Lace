// ─────────────────────────────────────────────────────────────
// Sparkline — tiny inline-SVG trend line.
//
// Pure React/SVG, no deps. Takes a short series of numbers and
// renders a smooth polyline + an optional area fill + a trailing
// dot. Sized to sit inside a stat card's corner.
// ─────────────────────────────────────────────────────────────

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  /** Tailwind color class for the stroke (e.g. "text-gold"). */
  className?: string;
  /** Set false to hide the soft area fill underneath. */
  fill?: boolean;
}

export default function Sparkline({
  values,
  width = 72,
  height = 24,
  className = "text-gold",
  fill = true,
}: SparklineProps) {
  if (values.length < 2) return null;

  const padX = 1;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * innerW;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });

  const pathD = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  const areaD = `${pathD} L${points[points.length - 1][0]},${height - padY} L${points[0][0]},${height - padY} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      {fill && (
        <path
          d={areaD}
          fill="currentColor"
          fillOpacity="0.12"
          stroke="none"
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={1.75} fill="currentColor" />
    </svg>
  );
}
