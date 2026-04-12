import { ShieldCheck, Check, X, Heart, ShoppingBag, Sparkles } from "lucide-react";

const COLOR_GROUPS: Array<{
  name: string;
  tokens: Array<{ name: string; var: string; text?: string }>;
}> = [
  {
    name: "Surfaces",
    tokens: [
      { name: "ivory", var: "--color-ivory" },
      { name: "cream", var: "--color-cream" },
      { name: "pearl", var: "--color-pearl" },
      { name: "champagne", var: "--color-champagne" },
      { name: "paper", var: "--color-paper" },
    ],
  },
  {
    name: "Brand",
    tokens: [
      { name: "burgundy", var: "--color-burgundy", text: "white" },
      { name: "charcoal", var: "--color-charcoal", text: "white" },
      { name: "blush", var: "--color-blush" },
      { name: "rose", var: "--color-rose" },
      { name: "rose-gold", var: "--color-rose-gold" },
      { name: "mauve", var: "--color-mauve" },
    ],
  },
  {
    name: "Gold",
    tokens: [
      { name: "gold", var: "--color-gold", text: "white" },
      { name: "gold-light", var: "--color-gold-light" },
      { name: "gold-dark", var: "--color-gold-dark", text: "white" },
    ],
  },
  {
    name: "Text + structure",
    tokens: [
      { name: "ink", var: "--color-ink", text: "white" },
      { name: "warm-gray", var: "--color-warm-gray", text: "white" },
      { name: "soft-gray", var: "--color-soft-gray" },
      { name: "border", var: "--color-border" },
      { name: "border-light", var: "--color-border-light" },
    ],
  },
];

export default function DesignPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-heading text-3xl text-charcoal mb-1">Design</h1>
        <p className="text-sm text-warm-gray max-w-2xl">
          Internal token + component reference. Use this page when adding a new
          screen or a new component — stay within these swatches, these badges,
          these shapes.
        </p>
      </header>

      {/* Colors */}
      <section>
        <h2 className="font-heading text-xl text-charcoal mb-4">Color tokens</h2>
        <div className="space-y-6">
          {COLOR_GROUPS.map((group) => (
            <div key={group.name}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-2">
                {group.name}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {group.tokens.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl overflow-hidden border border-border-light"
                  >
                    <div
                      className="h-16"
                      style={{
                        background: `var(${t.var})`,
                        color: t.text ?? "var(--color-charcoal)",
                      }}
                    />
                    <div className="bg-white px-3 py-2">
                      <p className="text-sm text-charcoal">{t.name}</p>
                      <p className="text-[10px] text-warm-gray font-mono">
                        {t.var}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="font-heading text-xl text-charcoal mb-4">Typography</h2>
        <div className="bg-white border border-border-light rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-1">
              Heading · font-heading
            </p>
            <p className="font-heading text-4xl text-charcoal">
              Lace by La Luz
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-1">
              Body · sans
            </p>
            <p className="text-charcoal leading-relaxed max-w-prose">
              One hundred years of Sunday mornings. One hundred years of
              grandmothers folding tissue paper into small white squares. The
              Centennial Edition — 100 numbered veils, each a small vessel of
              that inheritance.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-1">
              Micro · uppercase tracking
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">
              Concierge · brand voice · heritage
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="font-heading text-xl text-charcoal mb-4">Buttons</h2>
        <div className="bg-white border border-border-light rounded-2xl p-6 flex flex-wrap gap-3">
          <button className="bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-colors inline-flex items-center gap-2">
            <Check className="w-4 h-4" /> Primary
          </button>
          <button className="bg-white border border-border text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:border-charcoal transition-colors">
            Secondary
          </button>
          <button className="bg-white border border-border text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:border-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-2">
            <X className="w-4 h-4" /> Danger-ghost
          </button>
          <button className="bg-gold/10 border border-gold/40 text-gold-dark px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gold/20 transition-colors inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Gold
          </button>
          <button className="text-burgundy text-sm font-medium hover:underline inline-flex items-center gap-1 px-2">
            Text link →
          </button>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="font-heading text-xl text-charcoal mb-4">Badges</h2>
        <div className="bg-white border border-border-light rounded-2xl p-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-soft-gray/10 text-warm-gray">
            low
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-gold/10 text-gold-dark">
            normal
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-burgundy/10 text-burgundy">
            money
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            destructive
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            approved
          </span>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="font-heading text-xl text-charcoal mb-4">Cards</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-warm-gray uppercase tracking-wide">
                Stat tile
              </span>
              <ShoppingBag className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-heading text-charcoal">24</p>
            <p className="text-xs text-soft-gray mt-1">this week</p>
          </div>

          <div className="bg-gradient-to-br from-burgundy to-charcoal text-pearl rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2 text-gold">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.25em]">
                Briefing
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Today: 2 new orders, 3 approvals waiting, 2 new messages. The
              centennial edition is pacing 40% above last week.
            </p>
          </div>

          <div className="bg-cream rounded-2xl border border-gold/20 p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark mb-0.5">
                Mission
              </p>
              <p className="text-sm text-charcoal leading-snug">
                3,812 veils gifted across 8 communities. Two more shipments go
                out Monday.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-burgundy" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-burgundy">
                Approval
              </span>
            </div>
            <p className="text-base text-charcoal font-medium mb-1">
              Full refund on order LL-2026-1038
            </p>
            <p className="text-xs text-warm-gray">
              Requested by Agent · expires in 23h
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
