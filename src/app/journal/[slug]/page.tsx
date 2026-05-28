import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, Share2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import {
  getPostBySlug,
  getRelatedPosts,
  formatJournalDate,
  JOURNAL_POSTS,
  JournalSection,
} from "@/lib/journal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return JOURNAL_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} · Lace by La Luz Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const related = getRelatedPosts(slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* ── Hero ── */}
      <section
        className={`relative bg-gradient-to-b from-blush/20 via-ivory to-ivory overflow-hidden py-20 sm:py-24`}
      >
        <div className="lace-pattern absolute inset-0 opacity-15 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-warm-gray hover:text-burgundy transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            Back to Journal
          </Link>

          <div className="text-center animate-fade-up">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold mb-5">
              {post.category}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-[1.1]">
              {post.title}
            </h1>
            <p className="text-xl text-warm-gray leading-relaxed italic max-w-2xl mx-auto mb-8">
              {post.dek}
            </p>
            <div className="gold-line mx-auto mb-8" />

            <div className="flex items-center justify-center gap-5 text-[11px] text-warm-gray">
              <div>
                <p className="text-charcoal font-medium">{post.author}</p>
                <p className="tracking-[0.2em] uppercase text-[10px] text-warm-gray">
                  {post.authorRole}
                </p>
              </div>
              <span className="w-px h-8 bg-border" />
              <div>
                <p className="text-charcoal font-medium">
                  {formatJournalDate(post.date)}
                </p>
                <p className="tracking-[0.2em] uppercase text-[10px] text-warm-gray flex items-center gap-1.5 justify-center">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {post.readMinutes} min read
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cover art ── */}
      <section className="relative -mt-4 mb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div
            className={`relative aspect-[16/9] rounded-[2rem] overflow-hidden bg-gradient-to-br ${post.coverGradient} shadow-[0_20px_60px_rgba(44,37,39,0.12)] product-lace-trim`}
          >
            <div className="absolute inset-0 product-lace opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <article className="relative pb-20 bg-ivory">
        <div className="max-w-[680px] mx-auto px-4">
          <Reveal>
            <div className="space-y-7">
              {post.body.map((section, i) => (
                <SectionRenderer key={i} section={section} />
              ))}
            </div>
          </Reveal>

          {/* Tags + share */}
          <div className="mt-14 pt-8 border-t border-border-light flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-pearl border border-border-light text-[10px] tracking-[0.2em] uppercase text-warm-gray"
                >
                  {t}
                </span>
              ))}
            </div>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + " · Lace by La Luz")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-burgundy transition-colors"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              Share
            </a>
          </div>
        </div>
      </article>

      {/* ── Author card ── */}
      <section className="relative py-16 bg-cream border-y border-border-light">
        <div className="max-w-[680px] mx-auto px-4">
          <div className="luxury-card rounded-2xl p-7 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose/40 to-burgundy/30 border border-gold/30 flex items-center justify-center font-heading text-2xl text-burgundy flex-shrink-0">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-1">
                {post.authorRole}
              </p>
              <p className="font-heading text-xl text-charcoal">{post.author}</p>
              <p className="text-sm text-warm-gray mt-1">
                Writing from our atelier in Guadalajara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="relative py-20 bg-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                  Keep Reading
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                  More from the <span className="italic text-burgundy">Journal</span>
                </h2>
                <div className="gold-line mx-auto mt-5" />
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08}>
                  <Link
                    href={`/journal/${p.slug}`}
                    className="group luxury-card rounded-2xl overflow-hidden block h-full"
                  >
                    <div
                      className={`relative aspect-[4/3] bg-gradient-to-br ${p.coverGradient}`}
                    >
                      <div className="absolute inset-0 product-lace opacity-30" />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-pearl/80 backdrop-blur-sm text-[9px] tracking-[0.2em] uppercase text-charcoal font-semibold">
                        {p.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg text-charcoal mb-2 group-hover:text-burgundy transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-warm-gray line-clamp-2">
                        {p.excerpt}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative py-24 bg-gradient-to-b from-ivory via-blush/15 to-ivory overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.12] pointer-events-none" />
        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
              Wear something that <span className="italic text-burgundy">carries a story</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-warm-gray leading-relaxed mb-8 max-w-md mx-auto">
              Every veil we make is a small act of devotion — to our craft, to
              our faith, and to a sister somewhere who will receive the gift.
            </p>
            <Link
              href="/shop"
              className="btn-luxe inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
            >
              Shop the Veils
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SectionRenderer({ section }: { section: JournalSection }) {
  switch (section.type) {
    case "paragraph":
      return (
        <p className="font-body text-lg text-charcoal leading-[1.85] [&::first-letter]:first-of-type:font-heading">
          {section.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="font-heading text-2xl sm:text-3xl text-charcoal pt-6 leading-[1.2]">
          {section.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="relative border-l-2 border-gold pl-6 my-10 py-2">
          <p className="font-heading italic text-2xl text-burgundy leading-[1.4]">
            &ldquo;{section.text}&rdquo;
          </p>
          {section.attribution && (
            <cite className="block mt-3 text-[11px] tracking-[0.25em] uppercase text-warm-gray not-italic">
              — {section.attribution}
            </cite>
          )}
        </blockquote>
      );
    case "list":
      return section.style === "numbered" ? (
        <ol className="space-y-3 list-decimal list-inside text-lg text-charcoal leading-[1.8]">
          {section.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-3">
          {section.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-3 flex-shrink-0" />
              <span className="text-lg text-charcoal leading-[1.8]">{it}</span>
            </li>
          ))}
        </ul>
      );
    case "image": {
      const aspect =
        section.aspect === "square"
          ? "aspect-square"
          : section.aspect === "portrait"
            ? "aspect-[4/5]"
            : "aspect-[16/9]";
      return (
        <figure className="my-8">
          <div
            className={`${aspect} rounded-2xl bg-gradient-to-br ${section.gradient} overflow-hidden relative flex items-center justify-center`}
          >
            <div className="absolute inset-0 product-lace opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 pointer-events-none" />
            {section.caption && (
              <div className="relative z-10 px-10 sm:px-16 max-w-xl text-center">
                <div className="w-10 h-px bg-charcoal/30 mx-auto mb-5" />
                <p className="font-heading text-xl sm:text-2xl text-charcoal/75 italic leading-snug">
                  {section.caption}
                </p>
                <div className="w-10 h-px bg-charcoal/30 mx-auto mt-5" />
              </div>
            )}
          </div>
        </figure>
      );
    }
    case "divider":
      return (
        <div className="section-divider my-8" aria-hidden />
      );
  }
}
