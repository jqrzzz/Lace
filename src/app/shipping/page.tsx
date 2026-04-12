import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping rates, timing, tracking, and international orders for Lace by La Luz.",
};

export default function ShippingPage() {
  return (
    <>
      {/* Hero */}
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
            Shipping <span className="italic text-burgundy">Policy</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            How quickly your veil reaches you &mdash; and how to find it if it
            takes a detour.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose-custom space-y-10">
            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Processing Time
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Every veil is inspected, folded in tissue, and packed by hand.
                In-stock orders typically ship within 2&ndash;3 business days.
                During holiday and centennial-edition launches, processing can
                take up to 5 business days &mdash; we&apos;ll email you if
                yours is running long.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Domestic Shipping (United States)
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Standard shipping is $5.99 and typically arrives in 5&ndash;7
                business days via USPS or UPS Ground. Orders of $75 or more
                ship free. Expedited 2-day shipping is available at checkout
                for orders that need to arrive in time for a specific event
                &mdash; please email us if you&apos;re cutting it close.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                International Shipping
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We currently ship within the United States only. If you are
                outside the US and would like a veil, please email us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                &mdash; we can arrange a custom shipment for some destinations.
                The customer is responsible for any customs duties, import
                taxes, and fees charged by the destination country.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Tracking
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                As soon as your order ships, you&apos;ll receive a confirmation
                email with a tracking number. Tracking updates can take
                24&ndash;48 hours to appear after the label is created. If
                tracking hasn&apos;t updated in 5 business days, please reach
                out &mdash; we&apos;ll investigate together.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Lost or Delayed Packages
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Once a package leaves our studio, it is in the carrier&apos;s
                hands, and we are not responsible for delays caused by the
                shipping carrier, weather, or circumstances outside our
                control. That said, we care deeply about every order arriving
                safely. If a package is marked delivered but you can&apos;t
                find it, check with neighbors and your local post office
                first, then email us within 14 days of the expected delivery
                date and we&apos;ll help file a claim.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Incorrect Address
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Please double-check your shipping address at checkout. If you
                spot a mistake, email us right away &mdash; we can usually
                update it before the package goes out. Once a package has
                shipped to an incorrect address, we unfortunately cannot be
                held responsible, though we will always try to help.
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
                Email us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>{" "}
                and we&apos;ll get back to you within 1&ndash;2 business days.
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
