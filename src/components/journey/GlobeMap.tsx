"use client";

/**
 * GlobeMap — stylized SVG world visualization for the Journey page.
 *
 * Rather than a topojson map, we use a simplified continent silhouette
 * (viewBox 0 0 1000 500) with animated arcs connecting the origin/workshop
 * to each recipient community. Pins hover + click to reveal details in the
 * side panel. Everything here is pure SVG + React — no external map deps.
 */

import { useState, useMemo } from "react";
import { Heart, MapPin, Sparkles, X } from "lucide-react";
import {
  GIFTED_COMMUNITIES,
  ORIGIN,
  WORKSHOP,
  GiftedCommunity,
} from "@/lib/gifted";
import { cn } from "@/lib/utils";

// Simplified continent outlines — paths authored to read as a stylized world
// silhouette, not a geographically perfect map. viewBox is 1000 x 500.
const CONTINENT_PATHS: string[] = [
  // North America
  "M 100 110 Q 140 80 200 90 Q 240 95 265 120 L 290 150 Q 295 175 275 195 L 245 220 Q 220 235 195 225 L 170 210 Q 140 200 115 175 Q 95 150 100 110 Z",
  // Central America + Caribbean
  "M 240 235 Q 260 225 280 240 L 295 260 Q 300 275 285 285 L 260 278 Q 240 270 235 250 Z",
  // South America
  "M 275 275 Q 310 270 335 290 Q 355 315 360 355 Q 355 395 335 420 Q 305 445 280 435 Q 260 420 265 390 Q 255 355 265 320 Q 268 295 275 275 Z",
  // Europe
  "M 470 120 Q 510 105 550 115 Q 575 125 580 150 L 570 175 Q 545 185 515 180 L 490 170 Q 470 155 470 135 Z",
  // Africa
  "M 490 215 Q 530 205 570 220 Q 600 240 605 280 Q 600 325 575 355 Q 550 380 520 370 Q 495 355 485 320 Q 475 275 485 240 Q 488 225 490 215 Z",
  // Middle East
  "M 585 185 Q 610 178 630 195 L 625 215 Q 605 222 590 210 Z",
  // Asia
  "M 625 110 Q 700 95 790 110 Q 840 125 860 155 L 855 195 Q 820 225 770 230 L 720 235 Q 680 225 650 215 L 620 195 Q 605 160 625 110 Z",
  // South/Southeast Asia
  "M 680 245 Q 710 235 730 245 L 740 265 Q 735 285 715 290 L 695 282 Q 680 268 680 245 Z",
  // Indonesia / Indo archipelago (approx, stylized)
  "M 775 290 Q 800 285 820 295 L 815 310 Q 795 315 780 305 Z",
  // Australia
  "M 820 360 Q 870 350 905 365 Q 920 385 910 405 Q 880 420 845 415 Q 825 400 820 380 Z",
];

interface Props {
  onSelect?: (community: GiftedCommunity | null) => void;
}

export default function GlobeMap({ onSelect }: Props) {
  const [active, setActive] = useState<GiftedCommunity | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // For the connection arcs: start point is the workshop in Guadalajara;
  // origin (Bali) is rendered as a secondary origin marker.
  const arcs = useMemo(() => {
    const x1 = WORKSHOP.point.x * 1000;
    const y1 = WORKSHOP.point.y * 500;
    return GIFTED_COMMUNITIES.map((c, i) => {
      const x2 = c.point.x * 1000;
      const y2 = c.point.y * 500;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - Math.min(120, Math.abs(x2 - x1) * 0.35);
      return {
        id: c.id,
        d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        delay: i * 0.15,
      };
    });
  }, []);

  const select = (c: GiftedCommunity | null) => {
    setActive(c);
    onSelect?.(c);
  };

  return (
    <div className="relative grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Map canvas */}
      <div className="relative rounded-[2rem] overflow-hidden luxury-card p-6 sm:p-8">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.gold/8)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 lace-pattern opacity-[0.08] pointer-events-none" />

        <svg
          viewBox="0 0 1000 500"
          className="relative w-full h-auto"
          role="img"
          aria-label="World map showing where Lace by La Luz veils are sourced and gifted"
        >
          <defs>
            {/* Ocean — soft pearl radial with a warm rose tint at the edges */}
            <radialGradient id="ocean" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="var(--color-pearl)" />
              <stop offset="55%" stopColor="var(--color-cream)" />
              <stop offset="100%" stopColor="var(--color-blush)" stopOpacity="0.4" />
            </radialGradient>
            {/* Continents — subtle warm fill with a soft inner glow */}
            <linearGradient id="continent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-champagne)" />
              <stop offset="60%" stopColor="var(--color-blush)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--color-rose)" stopOpacity="0.85" />
            </linearGradient>
            {/* Arc — rose-gold ribbon, more romantic than tri-color */}
            <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-burgundy)" stopOpacity="0.85" />
              <stop offset="45%" stopColor="var(--color-rose-gold)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="pin-pulse">
              <stop offset="0%" stopColor="var(--color-burgundy)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--color-burgundy)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="origin-pulse">
              <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
            </radialGradient>
            {/* Soft drop-shadow so continents float on the ocean */}
            <filter id="continent-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Glow for arcs */}
            <filter id="arc-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Vignette mask — softens the edges of the ocean */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
              <stop offset="70%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.18" />
            </radialGradient>
            {/* Dash animation */}
            <style>{`
              .arc-stroke { stroke-dasharray: 5 8; animation: dash 5s linear infinite; }
              @keyframes dash { to { stroke-dashoffset: -26; } }
              .pin-ring { animation: pinPulse 2.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
              @keyframes pinPulse { 0%,100% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1.6); opacity: 0; } }
              @media (prefers-reduced-motion: reduce) {
                .arc-stroke { animation: none; }
                .pin-ring { animation: none; opacity: 0.4; }
              }
            `}</style>
          </defs>

          {/* Ocean backdrop — rounded rect so the whole canvas reads as a printed map */}
          <rect x="0" y="0" width="1000" height="500" rx="24" fill="url(#ocean)" />

          {/* Soft dot "sea" pattern — gives water some texture without reading as grid */}
          <g fill="var(--color-rose-gold)" opacity="0.18">
            {Array.from({ length: 40 }).map((_, i) => {
              const x = ((i * 137) % 980) + 12;
              const y = ((i * 83) % 480) + 12;
              return <circle key={i} cx={x} cy={y} r="1.2" />;
            })}
          </g>

          {/* Ghosted meridians — much softer than before */}
          <g stroke="var(--color-rose-gold)" strokeWidth="0.3" opacity="0.22">
            {[125, 250, 375].map((y) => (
              <line key={y} x1="40" x2="960" y1={y} y2={y} />
            ))}
            {[250, 500, 750].map((x) => (
              <line key={x} y1="60" y2="440" x1={x} x2={x} />
            ))}
          </g>

          {/* Continents with soft shadow */}
          <g filter="url(#continent-soft)">
            {CONTINENT_PATHS.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="url(#continent)"
                stroke="var(--color-rose-gold)"
                strokeWidth="0.8"
                strokeLinejoin="round"
                opacity="0.92"
              />
            ))}
          </g>

          {/* Arcs from workshop to recipients — with a glow layer underneath */}
          <g fill="none" strokeLinecap="round">
            {arcs.map((arc) => {
              const op = active
                ? active.id === arc.id
                  ? 1
                  : 0.15
                : hover
                  ? hover === arc.id
                    ? 1
                    : 0.22
                  : 0.6;
              return (
                <g key={arc.id} opacity={op}>
                  {/* Glow underlay */}
                  <path
                    d={arc.d}
                    stroke="url(#arc)"
                    strokeWidth="4"
                    opacity="0.35"
                    filter="url(#arc-glow)"
                  />
                  {/* Sharp ribbon */}
                  <path
                    d={arc.d}
                    stroke="url(#arc)"
                    strokeWidth="1.6"
                    className="arc-stroke"
                    style={{ animationDelay: `${arc.delay}s` }}
                  />
                </g>
              );
            })}
          </g>

          {/* Origin pin — Bali */}
          <g transform={`translate(${ORIGIN.point.x * 1000} ${ORIGIN.point.y * 500})`}>
            <circle r="22" fill="url(#origin-pulse)" className="pin-ring" />
            <circle r="8" fill="var(--color-gold)" stroke="white" strokeWidth="1.5" />
            <Sparkles
              x={-5}
              y={-5}
              width={10}
              height={10}
              color="white"
              strokeWidth={2}
            />
            <text
              x={0}
              y={28}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-ink)"
              fontWeight="600"
              style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Bali · Origin
            </text>
          </g>

          {/* Workshop pin — Guadalajara (start of arcs) */}
          <g transform={`translate(${WORKSHOP.point.x * 1000} ${WORKSHOP.point.y * 500})`}>
            <circle r="22" fill="url(#origin-pulse)" className="pin-ring" />
            <circle r="9" fill="var(--color-burgundy)" stroke="var(--color-gold)" strokeWidth="1.5" />
            <Heart
              x={-5}
              y={-5}
              width={10}
              height={10}
              color="white"
              strokeWidth={2}
              fill="white"
            />
            <text
              x={0}
              y={-16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-ink)"
              fontWeight="600"
              style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Guadalajara · Workshop
            </text>
          </g>

          {/* Recipient pins */}
          {GIFTED_COMMUNITIES.map((c) => {
            const cx = c.point.x * 1000;
            const cy = c.point.y * 500;
            const isActive = active?.id === c.id;
            const isHover = hover === c.id;
            return (
              <g
                key={c.id}
                transform={`translate(${cx} ${cy})`}
                className="cursor-pointer"
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => select(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(c);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${c.community} in ${c.city}, ${c.country} — ${c.veilsGifted} veils gifted`}
              >
                <circle
                  r={isActive || isHover ? 18 : 14}
                  fill="url(#pin-pulse)"
                  className="pin-ring"
                />
                <circle
                  r={isActive ? 7 : 5.5}
                  fill="var(--color-burgundy)"
                  stroke="white"
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ transition: "all 0.3s ease" }}
                />
                {(isActive || isHover) && (
                  <g transform="translate(0 -14)">
                    <rect
                      x={-42}
                      y={-17}
                      width={84}
                      height={18}
                      rx={9}
                      fill="var(--color-paper)"
                      stroke="var(--color-rose-gold)"
                      strokeWidth="0.6"
                    />
                    <text
                      x={0}
                      y={-5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="var(--color-ink)"
                      fontWeight="600"
                    >
                      {c.flag} {c.city}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Vignette — softens the corners so the map feels printed */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="500"
            rx="24"
            fill="url(#vignette)"
            pointerEvents="none"
          />
        </svg>

        {/* Map legend */}
        <div className="mt-6 flex flex-wrap items-center gap-5 text-[11px] text-warm-gray">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold border border-white" />
            <span>Origin — Bali</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-burgundy border border-gold" />
            <span>Workshop — Guadalajara</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-burgundy border border-white" />
            <span>Gifted communities</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
            Click a pin to read the story
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <aside
        className={cn(
          "luxury-card rounded-2xl p-6 sticky top-24 self-start transition-all duration-500",
          active ? "" : "opacity-90"
        )}
        aria-live="polite"
      >
        {active ? (
          <div>
            <button
              onClick={() => select(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border hover:border-burgundy hover:text-burgundy flex items-center justify-center text-warm-gray transition-colors"
              aria-label="Close detail"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <div className="text-4xl mb-2">{active.flag}</div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-2">
              {active.region}
            </p>
            <h3 className="font-heading text-xl text-charcoal mb-1">
              {active.community}
            </h3>
            <p className="text-sm text-warm-gray mb-4">
              {active.city}, {active.country}
            </p>
            <div className="gold-line mb-4 opacity-50" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-blush/30 p-3 text-center">
                <p className="font-heading text-2xl text-burgundy">
                  {active.veilsGifted}
                </p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-warm-gray">
                  Veils gifted
                </p>
              </div>
              <div className="rounded-xl bg-champagne/40 p-3 text-center">
                <p className="font-heading text-sm text-charcoal mt-1">
                  {new Date(active.date + "-01").toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-warm-gray mt-1">
                  Gifted
                </p>
              </div>
            </div>
            <p className="text-sm text-warm-gray leading-relaxed italic">
              &ldquo;{active.story}&rdquo;
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <MapPin
              className="w-8 h-8 text-gold/50 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <h3 className="font-heading text-lg text-charcoal mb-2">
              Our Global Sisterhood
            </h3>
            <div className="gold-line mx-auto mb-4 opacity-40" />
            <p className="text-sm text-warm-gray leading-relaxed">
              Every veil traces a path across the world — Bali artisans,
              Guadalajara craftsmanship, and sisters in growing communities
              who receive the gift.
            </p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gold mt-5 font-medium">
              Click any pin to explore
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
