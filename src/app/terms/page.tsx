import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for shopping at Lace by La Luz. Simple, honest terms for a mission-driven brand.",
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            Legal
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-5xl sm:text-6xl text-charcoal mb-6 leading-tight">
            Terms of <span className="italic text-burgundy">Service</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            The fine print, written in plain language. No surprises, just
            clarity.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose-custom space-y-10">
            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Acceptance of Terms
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                By browsing or purchasing from Lace by La Luz, you agree to
                these terms. If anything here doesn&apos;t sit well with you,
                please reach out before placing an order &mdash; we&apos;re
                always open to a conversation.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Product Descriptions
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We do our best to describe and photograph every veil accurately.
                Because our veils are handcrafted from Bali lace, slight
                variations in color, pattern, and texture are natural and part
                of what makes each piece unique. These small differences are not
                defects &mdash; they&apos;re the hallmark of artisan
                craftsmanship.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Pricing
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                All prices are listed in US dollars and include the cost of your
                veil as well as the gifted veil that goes to a sister church
                through our buy-one-give-one mission. Prices may change from
                time to time, but any changes will not affect orders that have
                already been placed and confirmed.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Pre-Orders
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We occasionally offer pre-orders for upcoming styles or
                restocks. When you place a pre-order, your payment is processed
                at the time of purchase and your veil will ship as soon as
                it&apos;s ready. We&apos;ll keep you updated on timing via
                email. Pre-orders are subject to the same return policy as
                regular orders.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Payment
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                All payments are processed securely through Stripe. We accept
                major credit and debit cards. We do not store your card details
                &mdash; Stripe handles all payment data under the highest
                industry security standards. By placing an order, you confirm
                that you are authorized to use the payment method provided.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Shipping
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We currently ship within the United States only. Standard
                shipping typically takes 5&ndash;7 business days from the date
                your order is fulfilled. Once your veil ships, you&apos;ll
                receive a confirmation email with tracking information. We are
                not responsible for delays caused by the shipping carrier,
                weather, or other circumstances beyond our control.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Our Buy-One-Give-One Mission
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Every purchase funds a matching veil that is gifted to a woman
                at a sister church community in need. We batch donated veils and
                ship them periodically to partner churches around the world.
                While we are committed to this mission with every order, we
                cannot guarantee a specific recipient, destination, or delivery
                timeline for the gifted veil. Our mission updates will keep you
                informed about where donated veils are going.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Intellectual Property
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                All content on this site &mdash; including photography, product
                names, logos, copy, and design &mdash; belongs to Lace by La
                Luz. You&apos;re welcome to share our content on social media
                with proper credit, but please don&apos;t reproduce, distribute,
                or use it for commercial purposes without our written
                permission.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Warranty Disclaimer
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Our site and products are provided &ldquo;as is&rdquo; and
                &ldquo;as available,&rdquo; without warranties of any kind,
                either express or implied, including but not limited to implied
                warranties of merchantability, fitness for a particular
                purpose, and non-infringement. We do not warrant that the site
                will be uninterrupted, error-free, or free of harmful
                components. Our{" "}
                <a
                  href="/returns"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  Returns &amp; Exchanges policy
                </a>{" "}
                sets out the remedies available for defective product.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Limitation of Liability
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Lace by La Luz, its owners, and employees shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of our site or
                products, including without limitation lost profits, lost data,
                or emotional distress. Our total aggregate liability for any
                claim related to a purchase will not exceed the amount you
                paid for that order. Some jurisdictions do not allow the
                exclusion of certain damages, so parts of this section may not
                apply to you.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Indemnification
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                You agree to indemnify and hold harmless Lace by La Luz and its
                team from any claim, loss, or expense (including reasonable
                legal fees) arising from your breach of these terms, your
                misuse of the site, or your violation of any third-party
                right.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                User-Generated Content
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                If you share reviews, photos, or other content with us (for
                example, tagging us on social media), you grant Lace by La Luz
                a non-exclusive, royalty-free, worldwide license to use,
                reproduce, and display that content in connection with our
                brand and mission, with credit whenever reasonable. You are
                responsible for ensuring you have the right to share any
                content you submit, and that it does not infringe on anyone
                else&apos;s rights.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Governing Law &amp; Dispute Resolution
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                These terms are governed by the laws of the State of
                California, United States, without regard to conflict-of-law
                rules. Before filing a formal claim, you agree to contact us
                first at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                so we can try to resolve it informally. If we cannot reach a
                resolution, any dispute will be resolved in the state or
                federal courts located in California, and you and Lace by La
                Luz consent to the exclusive jurisdiction of those courts.
                Nothing in this section limits your rights under applicable
                consumer protection laws that apply where you live.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Severability &amp; Entire Agreement
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                If any part of these terms is found unenforceable, the rest
                remains in effect. These terms, together with our{" "}
                <a
                  href="/privacy"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/returns"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  Returns Policy
                </a>
                , form the entire agreement between you and Lace by La Luz
                about your use of our site and products.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Changes to These Terms
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We may update these terms from time to time. When we do,
                we&apos;ll revise the date at the bottom of this page.
                Continued use of the site after changes are posted means you
                accept the updated terms.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Contact Us
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Questions about these terms? We&apos;d love to hear from you at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>
                .
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
