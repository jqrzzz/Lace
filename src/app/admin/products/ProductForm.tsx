"use client";

// Shared form for both /admin/products/new and
// /admin/products/[slug]/edit. Mode prop switches the API endpoint
// and which fields are editable (slug is locked on edit).
//
// Variants aren't editable here yet — there's a read-only summary
// near the bottom with a pointer to Supabase Studio. Variant CRUD
// gets its own phase alongside image uploads.

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  Check,
  Loader2,
  Save,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

// Named card-color presets so a non-technical owner picks a swatch instead of
// typing Tailwind classes. The value is the gradient class string the rest of
// the app already understands; the name is what she reads.
const ACCENT_PRESETS: { name: string; cls: string }[] = [
  { name: "Ivory & Gold", cls: "from-amber-50 via-orange-50 to-yellow-50" },
  { name: "Blush Rose", cls: "from-pink-50 via-rose-50 to-pink-100" },
  { name: "Warm Stone", cls: "from-stone-50 via-amber-50 to-stone-100" },
  { name: "Pure White", cls: "from-gray-50 via-white to-gray-50" },
  { name: "Champagne", cls: "from-yellow-50 via-amber-50 to-orange-50" },
  { name: "Rose Petal", cls: "from-rose-50 via-pink-50 to-amber-50" },
  { name: "Soft Lavender", cls: "from-purple-50 via-pink-50 to-rose-50" },
  { name: "Sage Mist", cls: "from-emerald-50 via-teal-50 to-stone-50" },
];

interface FormState {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  priceDollars: string;
  compareAtDollars: string;
  featured: boolean;
  sort: string;
  accentGradient: string;
  heroCopy: string;
  style: string;
  preOrder: boolean;
  featuresText: string;
  careText: string;
}

const CATEGORY_OPTIONS = [
  { value: "signature", label: "Signature" },
  { value: "essentials", label: "Essentials" },
  { value: "limited", label: "Limited" },
  { value: "centennial", label: "Centennial" },
  { value: "accessories", label: "Accessories" },
];

const COLLECTION_TO_CATEGORY: Record<string, string> = {
  Signature: "signature",
  Essentials: "essentials",
  Limited: "limited",
  Centennial: "centennial",
  Accessories: "accessories",
};

function emptyState(): FormState {
  return {
    slug: "",
    name: "",
    tagline: "",
    description: "",
    category: "signature",
    priceDollars: "",
    compareAtDollars: "",
    featured: false,
    sort: "0",
    accentGradient: "",
    heroCopy: "",
    style: "",
    preOrder: true,
    featuresText: "",
    careText: "",
  };
}

function stateFromProduct(p: Product): FormState {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    category:
      COLLECTION_TO_CATEGORY[p.collection] ?? p.collection.toLowerCase(),
    priceDollars: p.price.toFixed(2),
    compareAtDollars: "",
    featured: false,
    sort: "0",
    accentGradient: p.placeholder?.gradient ?? "",
    heroCopy: "",
    style: p.style ?? "",
    preOrder: p.preOrder,
    featuresText: (p.features ?? []).join("\n"),
    careText: (p.care ?? []).join("\n"),
  };
}

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface ProductFormProps {
  mode: "new" | "edit";
  initial?: Product;
  /** Only meaningful in edit mode — controls the active/archive buttons. */
  isActive?: boolean;
}

export default function ProductForm({
  mode,
  initial,
  isActive = true,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    initial ? stateFromProduct(initial) : emptyState(),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showCustomAccent, setShowCustomAccent] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function parseDollarsToCents(s: string): number | null {
    const trimmed = s.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) return NaN;
    return Math.round(n * 100);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const priceCents = parseDollarsToCents(form.priceDollars);
    if (priceCents === null || Number.isNaN(priceCents)) {
      setError("Price must be a number (e.g. 49 or 49.99).");
      setSaving(false);
      return;
    }
    const compareAt = parseDollarsToCents(form.compareAtDollars);
    if (compareAt !== null && Number.isNaN(compareAt)) {
      setError("Compare-at price must be a number, or leave it blank.");
      setSaving(false);
      return;
    }

    const metadata = {
      style: form.style.trim() || undefined,
      preOrder: form.preOrder,
      features: linesToList(form.featuresText),
      care: linesToList(form.careText),
    };

    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      subtitle: form.tagline.trim() || null,
      description: form.description.trim() || null,
      category: form.category,
      price_cents: priceCents,
      compare_at_cents: compareAt,
      featured: form.featured,
      sort: Number(form.sort) || 0,
      accent_gradient: form.accentGradient.trim() || null,
      hero_copy: form.heroCopy.trim() || null,
      metadata,
    };

    try {
      const res = await adminFetch(
        mode === "new"
          ? "/api/admin/products"
          : `/api/admin/products/${encodeURIComponent(initial?.slug ?? "")}`,
        {
          method: mode === "new" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Couldn't save the product.");
        return;
      }
      setSaved(true);
      if (mode === "new") {
        router.replace(`/admin/products/${encodeURIComponent(payload.slug)}/edit`);
      } else {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!initial) return;
    if (!confirm(`Archive "${initial.name}"? It will hide from the shop.`))
      return;
    setArchiving(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/products/${encodeURIComponent(initial.slug)}/archive`,
        { method: "POST" },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Couldn't archive.");
        return;
      }
      router.replace("/admin/products");
    } finally {
      setArchiving(false);
    }
  }

  async function restore() {
    if (!initial) return;
    setArchiving(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/products/${encodeURIComponent(initial.slug)}/restore`,
        { method: "POST" },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Couldn't restore.");
        return;
      }
      router.refresh();
    } finally {
      setArchiving(false);
    }
  }

  const variants = initial?.variants ?? [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray">
          Basics
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slug (URL identifier)" hint="lowercase + dashes, e.g. grace-veil">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              disabled={mode === "edit"}
              placeholder="grace-veil"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold disabled:bg-cream disabled:text-warm-gray"
            />
          </Field>
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Grace Veil"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </Field>
        </div>

        <Field label="Tagline">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Timeless ivory elegance"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
          />
        </Field>

        <Field label="Description" hint="The full prose on the product page.">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Our signature piece…"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
          />
        </Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Collection">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Style" hint="Free-form, e.g. Floral Lace">
            <input
              type="text"
              value={form.style}
              onChange={(e) => set("style", e.target.value)}
              placeholder="Classic Lace"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </Field>
          <Field label="Sort order" hint="Lower = appears first">
            <input
              type="number"
              value={form.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray">
          Price & flags
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Price (dollars)">
            <input
              type="text"
              inputMode="decimal"
              value={form.priceDollars}
              onChange={(e) => set("priceDollars", e.target.value)}
              placeholder="49.00"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </Field>
          <Field
            label="Compare-at price"
            hint="Optional. Strikes through when set."
          >
            <input
              type="text"
              inputMode="decimal"
              value={form.compareAtDollars}
              onChange={(e) => set("compareAtDollars", e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            Featured (appears on the home page)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={form.preOrder}
              onChange={(e) => set("preOrder", e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            Pre-order (badge + altered CTA)
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray">
          Storytelling
        </h2>

        <Field label="Hero copy" hint="One-line hook used in some marquees.">
          <input
            type="text"
            value={form.heroCopy}
            onChange={(e) => set("heroCopy", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
          />
        </Field>

        <div>
          <span className="text-sm text-charcoal block mb-1">Card color</span>
          <span className="text-xs text-warm-gray block mb-2">
            The soft gradient shown behind this veil until you add a photo. Pick
            the one that best matches its tone.
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {ACCENT_PRESETS.map((preset) => {
              const selected = form.accentGradient === preset.cls;
              return (
                <button
                  key={preset.cls}
                  type="button"
                  onClick={() => set("accentGradient", preset.cls)}
                  title={preset.name}
                  aria-label={preset.name}
                  aria-pressed={selected}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 overflow-hidden transition-all bg-gradient-to-br",
                    preset.cls,
                    selected
                      ? "border-burgundy ring-2 ring-burgundy/20 scale-105"
                      : "border-border hover:border-rose-gold",
                  )}
                >
                  <span className="absolute inset-0 product-lace opacity-30" />
                  {selected && (
                    <Check className="absolute top-1 right-1 w-3.5 h-3.5 text-burgundy drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-warm-gray">
              {ACCENT_PRESETS.find((p) => p.cls === form.accentGradient)?.name ??
                (form.accentGradient ? "Custom" : "None selected")}
            </span>
            <button
              type="button"
              onClick={() => setShowCustomAccent((v) => !v)}
              className="text-[11px] text-warm-gray hover:text-charcoal underline"
            >
              {showCustomAccent ? "Hide advanced" : "Advanced"}
            </button>
          </div>
          {(showCustomAccent ||
            (form.accentGradient &&
              !ACCENT_PRESETS.some((p) => p.cls === form.accentGradient))) && (
            <input
              type="text"
              value={form.accentGradient}
              onChange={(e) => set("accentGradient", e.target.value)}
              placeholder="Tailwind classes, e.g. from-rose-50 via-blush/10 to-cream"
              className="w-full mt-2 px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold font-mono"
            />
          )}
        </div>

        <Field
          label="Features"
          hint="One bullet per line. Renders as a bulleted list on the product page."
        >
          <textarea
            value={form.featuresText}
            onChange={(e) => set("featuresText", e.target.value)}
            rows={4}
            placeholder={"Hand-finished Bali lace\nScalloped edge detail\n…"}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
          />
        </Field>

        <Field label="Care instructions" hint="One bullet per line, same as features.">
          <textarea
            value={form.careText}
            onChange={(e) => set("careText", e.target.value)}
            rows={4}
            placeholder={"Hand wash cold with gentle soap\nLay flat to dry…"}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold leading-relaxed"
          />
        </Field>
      </div>

      {mode === "edit" && (
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray mb-3">
            Variants
          </h2>
          {variants.length === 0 ? (
            <p className="text-sm text-warm-gray">
              No variants yet. Variants are edited in Supabase Studio for now —
              we&apos;ll bring inline editing here in a follow-up.
            </p>
          ) : (
            <ul className="divide-y divide-border-light/60">
              {variants.map((v) => (
                <li
                  key={v.color}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: v.colorHex }}
                      title={v.color}
                    />
                    <span className="text-sm text-charcoal">{v.color}</span>
                  </div>
                  <span className="text-xs text-warm-gray">
                    {v.inStock ? "In stock" : "Out of stock"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-warm-gray mt-3">
            Manage SKUs, stock, and adding new colors in Supabase Studio for
            now.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {mode === "new" ? "Create product" : "Save changes"}
        </button>
        <Link
          href="/admin/products"
          className="px-4 py-2.5 text-sm text-warm-gray hover:text-charcoal"
        >
          Nevermind
        </Link>
        {mode === "edit" && (
          <div className="ml-auto">
            {isActive ? (
              <button
                type="button"
                onClick={archive}
                disabled={archiving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-900 hover:bg-amber-100 text-sm rounded-xl border border-amber-200 transition-colors disabled:opacity-60"
              >
                {archiving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                Archive
              </button>
            ) : (
              <button
                type="button"
                onClick={restore}
                disabled={archiving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm rounded-xl border border-emerald-200 transition-colors disabled:opacity-60"
              >
                {archiving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArchiveRestore className="w-4 h-4" />
                )}
                Restore
              </button>
            )}
          </div>
        )}
      </div>

      {saved && (
        <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
          <Check className="w-4 h-4" /> Saved.
        </p>
      )}
      {error && (
        <p className="inline-flex items-center gap-1.5 text-sm text-red-700">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-charcoal block mb-1">{label}</span>
      {hint && <span className="text-xs text-warm-gray block mb-2">{hint}</span>}
      {children}
    </label>
  );
}
