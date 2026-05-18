import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/lace/queries";
import { JOURNAL_POSTS } from "@/lib/journal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://lacebylaluz.com";
  const now = new Date();

  const staticPaths = [
    { path: "/", priority: 1.0, change: "weekly" as const },
    { path: "/shop", priority: 0.95, change: "weekly" as const },
    { path: "/story", priority: 0.85, change: "monthly" as const },
    { path: "/mission", priority: 0.9, change: "monthly" as const },
    { path: "/journey", priority: 0.9, change: "monthly" as const },
    { path: "/journal", priority: 0.85, change: "weekly" as const },
    { path: "/centennial", priority: 0.95, change: "monthly" as const },
    { path: "/founder", priority: 0.7, change: "monthly" as const },
    { path: "/wholesale", priority: 0.7, change: "monthly" as const },
    { path: "/press", priority: 0.65, change: "monthly" as const },
    { path: "/faq", priority: 0.7, change: "monthly" as const },
    { path: "/contact", priority: 0.7, change: "yearly" as const },
    { path: "/returns", priority: 0.4, change: "yearly" as const },
    { path: "/privacy", priority: 0.3, change: "yearly" as const },
    { path: "/terms", priority: 0.3, change: "yearly" as const },
  ];

  return [
    ...staticPaths.map((p) => ({
      url: `${base}${p.path}`,
      lastModified: now,
      changeFrequency: p.change,
      priority: p.priority,
    })),
    ...(await listProducts()).map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...JOURNAL_POSTS.map((p) => ({
      url: `${base}/journal/${p.slug}`,
      lastModified: new Date(p.date + "T00:00:00"),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
