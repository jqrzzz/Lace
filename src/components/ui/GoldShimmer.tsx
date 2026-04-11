"use client";

/* Deterministic particle positions to avoid SSR hydration mismatches */
const PARTICLES = [
  { left: "7%", delay: "0s", duration: "4.2s", size: 3 },
  { left: "15%", delay: "1.3s", duration: "5.1s", size: 2 },
  { left: "24%", delay: "2.5s", duration: "4.8s", size: 3.5 },
  { left: "32%", delay: "0.8s", duration: "3.7s", size: 2 },
  { left: "39%", delay: "3.4s", duration: "5.5s", size: 2.5 },
  { left: "46%", delay: "1.9s", duration: "4.0s", size: 2 },
  { left: "53%", delay: "0.4s", duration: "5.3s", size: 3 },
  { left: "61%", delay: "2.8s", duration: "3.9s", size: 3.5 },
  { left: "68%", delay: "1.6s", duration: "4.5s", size: 2 },
  { left: "75%", delay: "3.9s", duration: "5.0s", size: 2.5 },
  { left: "82%", delay: "1.0s", duration: "4.7s", size: 2 },
  { left: "89%", delay: "2.2s", duration: "3.8s", size: 3 },
  { left: "95%", delay: "1.5s", duration: "5.6s", size: 2.5 },
  { left: "11%", delay: "3.6s", duration: "4.3s", size: 2 },
  { left: "28%", delay: "0.6s", duration: "5.8s", size: 3 },
  { left: "43%", delay: "3.0s", duration: "4.1s", size: 2 },
  { left: "57%", delay: "1.8s", duration: "3.5s", size: 3.5 },
  { left: "72%", delay: "3.2s", duration: "5.2s", size: 2 },
  { left: "86%", delay: "0.3s", duration: "4.6s", size: 2.5 },
  { left: "50%", delay: "2.6s", duration: "5.4s", size: 2 },
];

export default function GoldShimmer({
  className = "",
  density = "normal",
}: {
  className?: string;
  density?: "sparse" | "normal" | "dense";
}) {
  const particles =
    density === "sparse"
      ? PARTICLES.slice(0, 10)
      : density === "dense"
        ? PARTICLES
        : PARTICLES.slice(0, 15);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="gold-particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
