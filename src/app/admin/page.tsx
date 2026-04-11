"use client";

import {
  ShoppingBag,
  DollarSign,
  Heart,
  TrendingUp,
  Sparkles,
  Send,
} from "lucide-react";
import { useState } from "react";

const STATS = [
  {
    label: "Total Orders",
    value: "0",
    change: "Pre-launch",
    icon: ShoppingBag,
  },
  {
    label: "Revenue",
    value: "$0",
    change: "Pre-launch",
    icon: DollarSign,
  },
  {
    label: "Veils Gifted",
    value: "0",
    change: "Mission starting",
    icon: Heart,
  },
  {
    label: "Conversion Rate",
    value: "—",
    change: "Awaiting data",
    icon: TrendingUp,
  },
];

const RECENT_ORDERS: {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: string;
}[] = [];

export default function AdminDashboard() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    // Placeholder: In production this calls your AI API
    setTimeout(() => {
      setAiResponse(
        `Here's a draft based on your request:\n\n"${aiPrompt}"\n\n[AI response will be generated here when API key is configured. This admin console is ready to connect to Claude API for product descriptions, social posts, and customer emails.]`
      );
      setAiLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Dashboard</h1>
        <p className="text-sm text-warm-gray">
          Welcome back. Here&apos;s your store at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-border-light p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-warm-gray uppercase tracking-wide">
                {stat.label}
              </span>
              <stat.icon className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl font-heading text-charcoal">{stat.value}</p>
            <p className="text-xs text-soft-gray mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Recent Orders
          </h2>
          {RECENT_ORDERS.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-10 h-10 text-soft-gray mx-auto mb-3" />
              <p className="text-sm text-warm-gray mb-4">
                No orders yet. Share your store to start receiving orders!
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://lacebylaluz.com");
                  alert("Store URL copied to clipboard!");
                }}
                className="text-xs text-burgundy hover:underline"
              >
                Copy store link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-cream rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {order.customer}
                    </p>
                    <p className="text-xs text-warm-gray">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">
                      {order.total}
                    </p>
                    <p className="text-xs text-warm-gray">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-heading text-xl text-charcoal">
              AI Assistant
            </h2>
          </div>

          <p className="text-sm text-warm-gray mb-4">
            Ask me to write product descriptions, Instagram captions, customer
            emails, or analyze your sales data.
          </p>

          <div className="space-y-3">
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                "Write an Instagram caption for Grace Veil",
                "Draft a thank you email for new customers",
                "Create a product description for Rosa Veil",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setAiPrompt(prompt)}
                  className="px-3 py-1.5 text-xs bg-cream border border-border rounded-full text-warm-gray hover:text-charcoal hover:border-charcoal transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAi()}
                placeholder="Ask the AI assistant..."
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold bg-ivory"
              />
              <button
                onClick={handleAi}
                disabled={aiLoading}
                className="px-4 py-2.5 bg-burgundy text-white rounded-xl hover:bg-burgundy/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {aiResponse && (
              <div className="bg-ivory border border-border-light rounded-xl p-4">
                <p className="text-xs text-gold font-medium mb-2">
                  AI Response
                </p>
                <p className="text-sm text-warm-gray whitespace-pre-line">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
