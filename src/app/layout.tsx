import type { Metadata } from "next";
import "./globals.css";
import ShellWrapper from "@/components/layout/ShellWrapper";
import CursorGlow from "@/components/ui/CursorGlow";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

// Runs synchronously in <head> before paint — prevents a flash of the wrong
// theme. Reads the saved preference from localStorage, falling back to the
// system color scheme.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://lacebylaluz.com"
  ),
  openGraph: {
    title: "Lace by La Luz | Elegant Veils, Shared with Purpose",
    description:
      "Handcrafted lace veils rooted in beauty, reverence, and sisterhood. Buy one, give one.",
    siteName: "Lace by La Luz",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lace by La Luz | Elegant Veils, Shared with Purpose",
    description:
      "Handcrafted lace veils rooted in beauty, reverence, and sisterhood. Buy one, give one.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google Fonts loaded via link tags — works on Vercel, fallback to system fonts locally */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
        <ThemeProvider>
          <CursorGlow />
          <AuthProvider>
            <ShellWrapper>{children}</ShellWrapper>
          </AuthProvider>
        </ThemeProvider>

        {/* Analytics — replace with your tracking script */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
