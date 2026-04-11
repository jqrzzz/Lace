"use client";

import { useState } from "react";
import { Mail, Clock, Heart, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Contact
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6">
            We&apos;re Here to Help
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto">
            Questions about veils, orders, or our mission? Send us a message and
            we&apos;ll reply with care.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border-light p-6 sm:p-8">
                <h2 className="font-heading text-2xl text-charcoal mb-6">
                  Send a Message
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-heading text-xl text-charcoal mb-2">
                      Message Sent
                    </h3>
                    <p className="text-warm-gray">
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
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-charcoal mb-2"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-charcoal mb-2"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-charcoal mb-2"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
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
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-charcoal mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory resize-y"
                        placeholder="How can we help?"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-border-light p-6">
                <Mail className="w-5 h-5 text-gold mb-3" />
                <h3 className="font-heading text-lg text-charcoal mb-2">
                  Email Us
                </h3>
                <p className="text-sm text-warm-gray">
                  hello@lacebylaluz.com
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-border-light p-6">
                <Clock className="w-5 h-5 text-gold mb-3" />
                <h3 className="font-heading text-lg text-charcoal mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-warm-gray">
                  We typically respond within 1–2 business days.
                </p>
              </div>

              <div className="bg-blush/30 rounded-2xl border border-rose/20 p-6">
                <Heart className="w-5 h-5 text-burgundy mb-3" />
                <h3 className="font-heading text-lg text-charcoal mb-2">
                  We&apos;d Love to Hear From You
                </h3>
                <p className="text-sm text-warm-gray">
                  Whether it&apos;s a product question, a mission idea, or just a
                  kind word — your message matters to us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
