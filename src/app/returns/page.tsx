import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "Our return and exchange policy at Lace by La Luz. We want you to love your veil and we are here to help if something is not right.",
};

export default function ReturnsPage() {
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
            Returns & <span className="italic text-burgundy">Exchanges</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            We want you to love your veil. If something isn&apos;t right,
            we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose-custom space-y-10">
            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Our Promise
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Every Lace by La Luz veil is crafted with care and inspected
                before it ships. Because every purchase also funds a veil for a
                sister in need through our buy-one-give-one mission, we ask that
                returns be reserved for quality issues. We believe in standing
                behind our work, and we want every veil to bring you joy.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                14-Day Return Window
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                If your veil arrives with a defect, damage from shipping, or a
                quality issue, you have 14 days from the delivery date to
                contact us and start a return. We&apos;ll make it right &mdash;
                that&apos;s a promise. Simply email us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                with your order number and a photo of the issue, and we&apos;ll
                guide you through the next steps.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                What We Cannot Accept
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We are unable to accept returns for veils that have been
                damaged by the customer, altered, or washed improperly. Because
                of the nature of our mission &mdash; a second veil is set aside
                for donation with every order &mdash; we kindly ask for
                understanding that general change-of-mind returns are not
                available. We want to be transparent about why: your purchase
                directly funds a gift for another woman, and honoring that
                commitment is at the heart of everything we do.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Exchanges
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Want a different color? We&apos;re happy to offer an exchange
                for a different color of the same style, subject to
                availability. Just reach out to us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                within 14 days of receiving your order, and we&apos;ll arrange
                the swap. Please return the original veil in unused condition
                with its packaging.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Refund Process
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Once we receive and inspect your returned veil, we&apos;ll
                process your refund to the original payment method. Refunds
                typically appear within 5&ndash;7 business days, depending on
                your bank or card provider. We&apos;ll send you a confirmation
                email as soon as the refund is on its way.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                How to Start a Return or Exchange
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Email us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                with your order number, the reason for your return or exchange,
                and any photos if applicable. We&apos;ll respond within 1&ndash;2
                business days with instructions. We handle every request
                personally because you&apos;re not a ticket number to us &mdash;
                you&apos;re part of this sisterhood.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Questions?
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We&apos;re always here to help. If you&apos;re unsure about
                anything, don&apos;t hesitate to reach out at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>
                . We&apos;d rather answer a question before your purchase than
                have you disappointed after.
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
