"use client";

import { ClipboardList, Search } from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">Orders</h1>
          <p className="text-sm text-warm-gray">
            Manage orders and track fulfillment
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
          />
        </div>
        <select className="px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal bg-white">
          <option>All Status</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
        </select>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-border-light p-16 text-center">
        <ClipboardList className="w-12 h-12 text-soft-gray mx-auto mb-4" />
        <h2 className="font-heading text-xl text-charcoal mb-2">
          No Orders Yet
        </h2>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          When customers place orders, they&apos;ll appear here. Share your store on
          social media to start receiving orders.
        </p>
      </div>
    </div>
  );
}
