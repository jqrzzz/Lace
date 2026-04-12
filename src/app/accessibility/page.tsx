import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Lace by La Luz's commitment to building a site every sister can use, regardless of ability.",
};

export default function AccessibilityPage() {
  return (
    <>
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            Support
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-5xl sm:text-6xl text-charcoal mb-6 leading-tight">
            Accessibility{" "}
            <span className="italic text-burgundy">Statement</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Every sister deserves to find her veil. We are committed to making
            this site usable for everyone.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose-custom space-y-10">
            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Our Commitment
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Lace by La Luz is committed to ensuring digital accessibility
                for people with disabilities. We are continually improving the
                user experience for everyone, and applying the relevant
                accessibility standards as we grow.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Standards We Follow
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We aim to conform to the{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                </a>
                . These guidelines help make web content more accessible to
                people with a wide array of disabilities, including visual,
                auditory, physical, cognitive, and neurological differences.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Features We&apos;ve Built In
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <ul className="list-disc pl-6 space-y-2 text-warm-gray leading-[1.8]">
                <li>Skip-to-content link for keyboard and screen-reader users</li>
                <li>
                  Descriptive alt text on product photos and meaningful imagery
                </li>
                <li>Keyboard-navigable menus, carts, and checkout</li>
                <li>
                  Visible focus outlines on interactive elements
                </li>
                <li>
                  Color contrast that meets or exceeds WCAG AA for body text
                </li>
                <li>
                  A respectful dark mode for low-light reading
                </li>
                <li>Semantic HTML headings and ARIA labels where appropriate</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Known Limitations
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We are a small team and this site is a living thing. Some
                pages may have decorative imagery, animations, or third-party
                embeds (like our checkout) that we do not fully control. If
                you encounter a barrier that stops you from completing a task,
                we want to know.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Feedback
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                If you have trouble using any part of our site, please email{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                with a description of the issue and, if possible, the URL and
                assistive technology you were using. We aim to respond within
                2 business days and will do our best to provide the
                information or service you need in an alternative format.
              </p>
            </div>

            <div className="pt-4 border-t border-border-light/50">
              <p className="text-sm text-warm-gray/60">
                Last updated: April 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
