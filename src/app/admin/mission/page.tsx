"use client";

import {
  Heart,
  MapPin,
  Gift,
  Camera,
  Plus,
  Globe,
} from "lucide-react";

const DESTINATIONS: {
  name: string;
  location: string;
  veilsNeeded: number;
  veilsCollected: number;
  status: string;
}[] = [];

export default function AdminMissionPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">
            Mission Tracker
          </h1>
          <p className="text-sm text-warm-gray">
            Track donated veils and manage destinations
          </p>
        </div>
        <button
          onClick={() => alert("Destination management will be available once Supabase is connected.")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-full hover:bg-burgundy/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Destination
        </button>
      </div>

      {/* Mission Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Gift,
            label: "Veils Donated",
            value: "0",
            desc: "Awaiting first orders",
          },
          {
            icon: Globe,
            label: "Destinations",
            value: "0",
            desc: "Add your first church",
          },
          {
            icon: MapPin,
            label: "Shipments Sent",
            value: "0",
            desc: "No shipments yet",
          },
          {
            icon: Camera,
            label: "Impact Photos",
            value: "0",
            desc: "Upload when received",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-border-light p-5"
          >
            <stat.icon className="w-5 h-5 text-gold mb-3" />
            <p className="text-2xl font-heading text-charcoal">{stat.value}</p>
            <p className="text-xs text-warm-gray mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-soft-gray mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Destination Churches */}
      <div className="bg-white rounded-2xl border border-border-light p-6 mb-6">
        <h2 className="font-heading text-xl text-charcoal mb-4">
          Destination Churches
        </h2>
        <p className="text-sm text-warm-gray mb-6">
          Add churches where donated veils will be sent. Track collection
          progress and upload photos when veils arrive.
        </p>

        {DESTINATIONS.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
            <MapPin className="w-10 h-10 text-soft-gray mx-auto mb-3" />
            <h3 className="font-heading text-lg text-charcoal mb-2">
              No Destinations Added
            </h3>
            <p className="text-sm text-warm-gray max-w-sm mx-auto mb-4">
              Add a church community to start tracking your mission. Once enough
              veils are collected, you can ship them and share the impact.
            </p>
            <button
              onClick={() => alert("Destination management will be available once Supabase is connected.")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-full hover:bg-burgundy/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Destination
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="flex items-center justify-between p-4 bg-cream rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-burgundy" />
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {dest.name}
                    </p>
                    <p className="text-xs text-warm-gray">{dest.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-charcoal">
                    {dest.veilsCollected}/{dest.veilsNeeded} veils
                  </p>
                  <p className="text-xs text-warm-gray">{dest.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How Mission Flow Works */}
      <div className="bg-blush/20 rounded-2xl border border-rose/20 p-6">
        <h3 className="font-heading text-lg text-charcoal mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-burgundy" />
          Mission Flow
        </h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            {
              step: "1",
              title: "Orders Come In",
              desc: "Each order automatically marks a veil for donation",
            },
            {
              step: "2",
              title: "Veils Accumulate",
              desc: "Track collected veils against each destination's goal",
            },
            {
              step: "3",
              title: "Ship Batch",
              desc: "When goal is met, ship veils and notify customers",
            },
            {
              step: "4",
              title: "Share Impact",
              desc: "Upload photos and send updates to customers",
            },
          ].map((s) => (
            <div key={s.step}>
              <span className="w-6 h-6 bg-burgundy text-white text-xs font-bold rounded-full inline-flex items-center justify-center mb-2">
                {s.step}
              </span>
              <h4 className="text-sm font-medium text-charcoal mb-1">
                {s.title}
              </h4>
              <p className="text-xs text-warm-gray">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
