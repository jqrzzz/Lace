import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Lace by La Luz collects, uses, and protects your personal information. We value your trust and your privacy.",
};

export default function PrivacyPolicyPage() {
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
            Privacy <span className="italic text-burgundy">Policy</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Your trust matters to us. Here&apos;s how we handle your information
            with care and transparency.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose-custom space-y-10">
            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                What We Collect
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                When you place an order or create an account, we collect your
                name, email address, and shipping address. This is the minimum
                we need to get your veil to your door and keep you updated on
                your order. If you reach out to us via email or our contact form,
                we&apos;ll also keep a record of that conversation so we can
                serve you better.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Payment Information
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                All payments are processed securely through Stripe. Your credit
                card number, expiration date, and security code go directly to
                Stripe &mdash; we never see, handle, or store your card details
                on our servers. Stripe is PCI-DSS compliant, which is the
                highest standard of payment security. You can read more about
                how Stripe protects your data at{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  stripe.com/privacy
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                How We Use Your Information
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We use your information to fulfill your order, send shipping
                confirmations, and let you know when your gifted veil reaches
                its destination church. If you sign up for our newsletter,
                we&apos;ll send occasional updates about new veils, mission
                stories, and special offers. You can unsubscribe at any time
                with one click.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Cookies &amp; Analytics
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8] mb-3">
                We use a small number of cookies, grouped into three
                categories:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-warm-gray leading-[1.8] mb-4">
                <li>
                  <strong className="text-charcoal">Strictly necessary</strong>{" "}
                  — keep your shopping cart working, authenticate sessions, and
                  remember your theme preference. These cannot be turned off.
                </li>
                <li>
                  <strong className="text-charcoal">Analytics</strong> — help
                  us understand which pages are popular and how people find
                  us, aggregated and not tied to your identity.
                </li>
                <li>
                  <strong className="text-charcoal">Marketing</strong> — we do
                  not currently run advertising cookies. If we ever do, we will
                  ask for your consent first.
                </li>
              </ul>
              <p className="text-warm-gray leading-[1.8]">
                See our{" "}
                <a
                  href="/cookies"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  Cookie Policy
                </a>{" "}
                for the full list and how to manage them in your browser.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                We Never Sell Your Data
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Your personal information is never sold, rented, or traded to
                third parties. Period. We only share what&apos;s necessary with
                our shipping carrier to deliver your order and with Stripe to
                process your payment. That&apos;s it.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Data Retention
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We keep your order information for as long as needed to fulfill
                our service to you and to comply with legal obligations such as
                tax and accounting requirements. If you&apos;d like us to delete
                your personal data, just send us an email and we&apos;ll take
                care of it within 30 days.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Your Rights (GDPR &amp; Global)
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8] mb-4">
                If you are located in the European Economic Area, the United
                Kingdom, or another region with similar protections, you have
                the following rights over your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-warm-gray leading-[1.8]">
                <li>
                  <strong className="text-charcoal">Access</strong> — request a
                  copy of the personal data we hold about you.
                </li>
                <li>
                  <strong className="text-charcoal">Rectification</strong> — ask
                  us to correct information that is wrong or incomplete.
                </li>
                <li>
                  <strong className="text-charcoal">Erasure</strong> — request
                  deletion of your personal data (subject to legal retention
                  obligations like tax records).
                </li>
                <li>
                  <strong className="text-charcoal">Restriction</strong> — ask
                  us to pause processing while a concern is resolved.
                </li>
                <li>
                  <strong className="text-charcoal">Portability</strong> —
                  receive your data in a machine-readable format.
                </li>
                <li>
                  <strong className="text-charcoal">Objection</strong> — opt
                  out of marketing emails at any time via the unsubscribe link,
                  or by writing to us.
                </li>
                <li>
                  <strong className="text-charcoal">Withdraw consent</strong> —
                  where we rely on consent, you can withdraw it at any time.
                </li>
              </ul>
              <p className="text-warm-gray leading-[1.8] mt-4">
                To exercise any of these rights, email{" "}
                <a
                  href="mailto:privacy@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  privacy@lacebylaluz.com
                </a>
                . We respond within 30 days and may ask you to verify your
                identity before acting on the request.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                California Residents (CCPA / CPRA)
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                California residents have the right to know what personal
                information we collect, to request deletion, to correct
                inaccurate information, and to opt out of the sale or sharing
                of personal information. We do not sell or share personal
                information as those terms are defined under the CCPA/CPRA — we
                never have, and we never will. You can exercise your rights by
                emailing{" "}
                <a
                  href="mailto:privacy@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  privacy@lacebylaluz.com
                </a>
                . We will not discriminate against you for exercising any of
                these rights.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Children&apos;s Privacy
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                Our site is not directed to children under 13, and we do not
                knowingly collect personal information from children under 13
                (or under 16 in the EEA). If you believe a child has provided
                us with personal information, please contact us and we will
                delete it promptly.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                International Data Transfers
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We are based in the United States. If you access our site from
                outside the US, your information may be transferred to,
                processed in, and stored in the US. We rely on service
                providers (like Stripe and our hosting provider) who maintain
                appropriate safeguards — including Standard Contractual Clauses
                where applicable — to protect international transfers.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Protecting Your Information
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                We take reasonable measures to protect your personal information
                from unauthorized access, loss, or misuse. Our site uses
                TLS/SSL encryption in transit, encrypted storage at rest, and
                least-privilege access controls for our team. In the unlikely
                event of a data breach that affects your personal information,
                we will notify affected customers and applicable regulators
                without undue delay, as required by law.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-2xl text-charcoal mb-4">
                Changes to This Policy
              </h2>
              <div
                className="gold-line mb-4 opacity-30"
                style={{ width: 40 }}
              />
              <p className="text-warm-gray leading-[1.8]">
                If we update this policy, we&apos;ll post the changes on this
                page and update the date below. For significant changes,
                we&apos;ll let you know by email.
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
                If you have any questions about how we handle your data, please
                reach out to us at{" "}
                <a
                  href="mailto:hello@lacebylaluz.com"
                  className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
                >
                  hello@lacebylaluz.com
                </a>
                . We&apos;re happy to help.
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
