import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Lace by La Luz | Elegant Veils, Shared with Purpose",
    template: "%s | Lace by La Luz",
  },
  description:
    "Handcrafted lace veils rooted in beauty, reverence, and sisterhood. Buy one, give one — every purchase gifts a veil to a sister in need.",
  keywords: [
    "lace veils",
    "church veils",
    "mantilla",
    "chapel veil",
    "buy one give one",
    "La Luz del Mundo",
    "Bali lace",
  ],
  openGraph: {
    title: "Lace by La Luz | Elegant Veils, Shared with Purpose",
    description:
      "Handcrafted lace veils rooted in beauty, reverence, and sisterhood. Buy one, give one.",
    siteName: "Lace by La Luz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Google Fonts loaded via link tags — works on Vercel, fallback to system fonts locally */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ivory text-charcoal antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
