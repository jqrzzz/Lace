"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Clock, Heart, Send, Check, Sparkles, Loader2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Please confirm consent to submit your message.");
      return;
    }
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      consent: true,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Failed to send. Please email us directly at hello@lacebylaluz.com");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            Contact
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 leading-tight">
            We&apos;re Here <span className="italic text-burgundy">to Help</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Questions about veils, orders, or our mission? Send us a message and
            we&apos;ll reply with care.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <Reveal className="lg:col-span-3">
              <div className="luxury-card rounded-2xl p-7 sm:p-9">
                <h2 className="font-heading text-2xl text-charcoal mb-2">
                  Send a Message
                </h2>
                <div className="gold-line mb-7 opacity-40" />

                {submitted ? (
                  <div className="text-center py-16">
                    <div className="w-[72px] h-[72px] bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Check className="w-8 h-8 text-green-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-heading text-xl text-charcoal mb-2">
                      Message Sent
                    </h3>
                    <p className="text-warm-gray leading-relaxed">
                      Thank you for reaching out. We&apos;ll get back to you within
                      1-2 business days.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm text-burgundy hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-[13px] font-medium text-charcoal mb-2">
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,169,110,0.1)] transition-all duration-200 bg-ivory/50"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-[13px] font-medium text-charcoal mb-2">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,169,110,0.1)] transition-all duration-200 bg-ivory/50"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-[13px] font-medium text-charcoal mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-all duration-200 bg-ivory/50"
                      >
                        <option>Product Question</option>
                        <option>Order Support</option>
                        <option>Mission / Donations</option>
                        <option>Wholesale Inquiry</option>
                        <option>Press / Media</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-[13px] font-medium text-charcoal mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,169,110,0.1)] transition-all duration-200 bg-ivory/50 resize-y"
                        placeholder="How can we help?"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 text-[12px] text-warm-gray leading-relaxed cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 accent-burgundy"
                      />
                      <span>
                        I understand my message will be read by the Lace by La
                        Luz team. By submitting I accept the{" "}
                        <Link
                          href="/privacy"
                          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-luxe inline-flex items-center gap-2.5 px-8 py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" strokeWidth={1.5} /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Details */}
            <div className="lg:col-span-2 space-y-5">
              <Reveal delay={0.1}>
                <div className="luxury-card rounded-2xl p-6">
                  <Mail className="w-5 h-5 text-gold mb-3" strokeWidth={1.5} />
                  <h3 className="font-heading text-lg text-charcoal mb-2">
                    Email Us
                  </h3>
                  <p className="text-sm text-warm-gray">hello@lacebylaluz.com</p>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="luxury-card rounded-2xl p-6">
                  <Clock className="w-5 h-5 text-gold mb-3" strokeWidth={1.5} />
                  <h3 className="font-heading text-lg text-charcoal mb-2">
                    Response Time
                  </h3>
                  <p className="text-sm text-warm-gray">
                    We typically respond within 1–2 business days.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-blush/30 to-rose/15 border border-rose/20">
                  <div className="lace-pattern absolute inset-0 opacity-15 pointer-events-none" />
                  <div className="relative">
                    <Heart className="w-5 h-5 text-burgundy mb-3" strokeWidth={1.5} />
                    <h3 className="font-heading text-lg text-charcoal mb-2">
                      We&apos;d Love to Hear From You
                    </h3>
                    <p className="text-sm text-warm-gray leading-relaxed">
                      Whether it&apos;s a product question, a mission idea, or just a
                      kind word — your message matters to us.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.4}>
                <div className="luxury-card rounded-2xl p-6">
                  <Sparkles className="w-5 h-5 text-gold mb-3" strokeWidth={1.5} />
                  <h3 className="font-heading text-lg text-charcoal mb-2">
                    Wholesale & Press
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    Interested in carrying our veils or featuring our mission?
                    Select the relevant subject above.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
