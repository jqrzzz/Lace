import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Gift,
  Package,
  Sparkles,
  MapPin,
  Camera,
  Bell,
  Globe,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Buy one, give one. Learn how every Lace by La Luz purchase gifts a veil to a sister in need at churches around the world.",
};

export default function MissionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Our Mission
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6">
            Buy One.{" "}
            <span className="text-burgundy italic">Give One.</span>
          </h1>
          <p className="text-lg text-warm-gray leading-relaxed max-w-xl mx-auto">
            Every purchase helps place a veil in the hands of a sister who needs
            one. This isn&apos;t charity — it&apos;s sisterhood.
          </p>
        </div>
      </section>

      {/* How It Works — Detailed */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl text-charcoal">
              How It Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Sparkles,
                step: "01",
                title: "You Choose a Veil",
                desc: "Browse our collection and pick a style that speaks to your heart. Every veil is crafted with the same love.",
              },
              {
                icon: Package,
                step: "02",
                title: "We Prepare & Ship",
                desc: "Your veil is prepared with boutique care. Beautiful packaging, personal attention, shipped to your door.",
              },
              {
                icon: Gift,
                step: "03",
                title: "A Sister Receives One Too",
                desc: "We batch donated veils and ship them to sister church communities around the world. One for you, one for her.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-border-light p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-blush/30 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-burgundy" />
                </div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                  Step {item.step}
                </p>
                <h3 className="font-heading text-xl text-charcoal mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Your Journey as a Buyer */}
          <div className="max-w-3xl mx-auto">
            <h3 className="font-heading text-2xl text-charcoal text-center mb-10">
              Your Mission Journey
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: Heart,
                  title: "You Purchase a Veil",
                  desc: "Instantly, a second veil is marked for donation. You'll see this in your order confirmation.",
                },
                {
                  icon: Bell,
                  title: "We Notify You",
                  desc: 'Once we have enough veils, we select a destination church. You\'ll get an alert: "Your gifted veil is on its way to [Church Name] in [Location]."',
                },
                {
                  icon: MapPin,
                  title: "Veils Arrive at Their Destination",
                  desc: "We ship batches of donated veils to sister churches — startup communities in Africa, Latin America, and beyond.",
                },
                {
                  icon: Camera,
                  title: "You See the Impact",
                  desc: "You'll receive a photo and update of the sisters wearing their new veils. Real faces, real joy, real sisterhood.",
                },
              ].map((step, i) => (
                <div key={step.title} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5 text-burgundy" />
                    </div>
                    {i < 3 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-heading text-lg text-charcoal mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-warm-gray leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats (placeholder) */}
      <section className="bg-charcoal py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { number: "0", label: "Veils Gifted", note: "Launching soon" },
              {
                number: "0",
                label: "Churches Reached",
                note: "First shipment pending",
              },
              {
                number: "0",
                label: "Countries",
                note: "Global mission coming",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-heading text-gold mb-1">
                  {stat.number}
                </p>
                <p className="text-white text-sm font-medium">{stat.label}</p>
                <p className="text-soft-gray text-xs mt-1">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Receives */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl border border-border-light p-8">
              <Globe className="w-6 h-6 text-gold mb-4" />
              <h3 className="font-heading text-2xl text-charcoal mb-4">
                Who Receives Gifted Veils?
              </h3>
              <p className="text-warm-gray leading-relaxed mb-4">
                Gifted veils go to sisters at startup and growing church
                communities — places where women worship with deep faith but may
                not have access to quality veils.
              </p>
              <p className="text-warm-gray leading-relaxed">
                We work with church leaders to identify communities in need. As
                our mission grows, we&apos;ll share every destination, every story,
                every face transparently.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border-light p-8">
              <Heart className="w-6 h-6 text-gold mb-4" />
              <h3 className="font-heading text-2xl text-charcoal mb-4">
                Why It Matters
              </h3>
              <p className="text-warm-gray leading-relaxed mb-4">
                A veil can be small in size but immense in meaning. For many
                women, wearing a veil to worship is an act of devotion, dignity,
                and identity.
              </p>
              <p className="text-warm-gray leading-relaxed">
                When a sister receives a beautiful veil — not a generic one, but
                one crafted with the same love as yours — she feels seen. She
                feels valued. She feels connected to a sisterhood that spans
                continents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-burgundy to-burgundy/90 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Heart className="w-8 h-8 text-rose/60 mx-auto mb-4" />
          <h2 className="font-heading text-3xl text-white mb-4">
            Share Beauty Forward
          </h2>
          <p className="text-rose/80 mb-8">
            Thank you for making this mission real, one order at a time.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-burgundy text-sm font-medium tracking-wide rounded-full hover:bg-ivory transition-colors"
          >
            Shop Veils
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
