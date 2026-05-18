import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import {
  getSortedPosts,
  formatJournalDate,
  JOURNAL_CATEGORIES,
  JournalPost,
} from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal · Stories, Craft, and Sisterhood",
  description:
    "The Lace by La Luz journal — essays on heritage, craft, faith, and the women who wear the veil. Slow reading for a quiet morning.",
};

export default function JournalPage() {
  const posts = getSortedPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured.slug);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-blush/25 via-rose/5 to-ivory overflow-hidden py-24 sm:py-28">
        <div className="lace-pattern absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.gold/10)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pearl/60 backdrop-blur-sm rounded-full border border-gold/25 mb-7">
            <BookOpen className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              The Journal
            </span>
          </div>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-tight">
            Slow reading for <br className="hidden sm:block" />
            <span className="italic text-burgundy">a quiet morning</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Essays on heritage, craft, and sisterhood. Letters from our
            atelier, our missions, and the women who wear the veil.
          </p>
        </div>
      </section>

      {/* ── Category filter (visual only for now) ── */}
      <section className="relative py-8 bg-ivory border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-4 py-1.5 rounded-full bg-burgundy text-white text-[11px] tracking-[0.15em] uppercase font-medium">
              All
            </span>
            {JOURNAL_CATEGORIES.map((c) => (
              <span
                key={c}
                className="px-4 py-1.5 rounded-full border border-border text-[11px] tracking-[0.15em] uppercase text-warm-gray hover:border-gold/50 hover:text-charcoal transition-colors cursor-default"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured post ── */}
      <section className="relative py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href={`/journal/${featured.slug}`}
              className="group block luxury-card rounded-[2rem] overflow-hidden grid lg:grid-cols-[1.1fr_1fr] gap-0"
            >
              <div
                className={`relative aspect-[16/11] lg:aspect-auto bg-gradient-to-br ${featured.coverGradient} overflow-hidden product-lace-trim`}
              >
                <div className="absolute inset-0 product-lace opacity-40" />
                <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal/85 backdrop-blur-sm border border-gold/30">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-gold font-semibold">
                    Featured · {featured.category}
                  </span>
                </div>
              </div>
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-medium mb-4">
                  {formatJournalDate(featured.date)} · {featured.readMinutes} min read
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4 group-hover:text-burgundy transition-colors leading-[1.15]">
                  {featured.title}
                </h2>
                <p className="text-warm-gray leading-relaxed italic mb-5">
                  {featured.dek}
                </p>
                <p className="text-sm text-warm-gray leading-[1.85] mb-7">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-charcoal font-medium">
                      {featured.author}
                    </p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray">
                      {featured.authorRole}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm text-burgundy font-medium group-hover:gap-3 transition-all">
                    Read
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Grid of posts ── */}
      <section className="relative py-20 bg-cream">
        <div className="lace-pattern absolute inset-0 opacity-[0.1] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2 font-medium">
                  More from the Journal
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                  Recent <span className="italic text-burgundy">letters</span>
                </h2>
              </div>
              <div className="gold-line opacity-50" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter hook ── */}
      <section className="relative py-24 bg-ivory overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.gold/10)_0%,transparent_60%)] pointer-events-none" />
        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <BookOpen className="w-7 h-7 text-gold mx-auto mb-5" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
              New letters, <span className="italic text-burgundy">one at a time</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-warm-gray leading-relaxed mb-8 max-w-md mx-auto">
              We send one letter a month. No noise, no sales emails disguised
              as stories. Just a quiet piece of writing, and the occasional
              note from our sisters.
            </p>
            <Link
              href="/#newsletter"
              className="btn-luxe inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
            >
              Subscribe to the letter
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function PostCard({ post }: { post: JournalPost }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group luxury-card rounded-2xl overflow-hidden flex flex-col h-full"
    >
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${post.coverGradient} overflow-hidden`}
      >
        <div className="absolute inset-0 product-lace opacity-30" />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pearl/80 backdrop-blur-md border border-border-light">
          <span className="text-[9px] tracking-[0.25em] uppercase text-charcoal font-semibold">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-3 flex items-center gap-2">
          {formatJournalDate(post.date)}
          <span className="w-1 h-1 rounded-full bg-gold/60" />
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {post.readMinutes} min
        </p>
        <h3 className="font-heading text-xl text-charcoal mb-2 group-hover:text-burgundy transition-colors leading-[1.2]">
          {post.title}
        </h3>
        <p className="text-sm text-warm-gray leading-relaxed mb-5 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border-light">
          <span className="text-[11px] text-warm-gray">
            by{" "}
            <span className="text-charcoal font-medium">{post.author}</span>
          </span>
          <ArrowRight
            className="w-4 h-4 text-burgundy opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </Link>
  );
}
