/* eslint-disable @next/next/no-head-element, @next/next/no-page-custom-font */
// ^ These templates render standalone HTML for email clients (Resend /
//   Postmark), not Next.js pages — the Next Head component is not applicable
//   and web fonts must be loaded via the <link> the email client can parse.

/**
 * Email BaseLayout — shared chrome for all transactional + nurture emails.
 *
 * Intentionally uses inline styles and table-style layout primitives so it
 * renders consistently in Gmail, Outlook, Apple Mail, and iOS Mail. We avoid
 * CSS variables, flexbox, and grid. All spacing is in px, fonts are web-safe
 * with a Google Fonts fallback link for clients that allow it.
 *
 * Brand palette (email-safe hex — mirrors but does not rely on our CSS tokens):
 *   burgundy  #8B3A4A
 *   gold      #C19640
 *   gold-dark #936E20
 *   charcoal  #2C2527
 *   warm-gray #5A4A4D
 *   cream     #FDF5EE
 *   ivory     #FFF9F5
 *   blush     #F5E1E6
 *   border    #E8DED8
 */

import type { ReactNode } from "react";

interface BaseLayoutProps {
  preheader: string; // hidden preview text (shows in inbox list)
  title: string; // <title> tag — used by some webmail clients
  children: ReactNode;
  footerNote?: string;
}

export const EMAIL_COLORS = {
  burgundy: "#8B3A4A",
  gold: "#C19640",
  goldLight: "#DAB46B",
  goldDark: "#936E20",
  charcoal: "#2C2527",
  warmGray: "#5A4A4D",
  softGray: "#A89A9D",
  cream: "#FDF5EE",
  ivory: "#FFF9F5",
  blush: "#F5E1E6",
  border: "#E8DED8",
  pearl: "#F7F0EA",
  white: "#FFFFFF",
} as const;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://lacebylaluz.com";

export default function BaseLayout({
  preheader,
  title,
  children,
  footerNote,
}: BaseLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <title>{title}</title>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:ital,wght@0,500;1,500&display=swap"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: EMAIL_COLORS.cream,
          fontFamily: "'Inter', Helvetica, Arial, sans-serif",
          color: EMAIL_COLORS.charcoal,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* Preheader — hidden but shown as preview in inbox */}
        <div
          style={{
            display: "none",
            fontSize: "1px",
            lineHeight: "1px",
            maxHeight: 0,
            maxWidth: 0,
            opacity: 0,
            overflow: "hidden",
            color: EMAIL_COLORS.cream,
          }}
        >
          {preheader}
          {"\u200C\u00A0".repeat(50)}
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ backgroundColor: EMAIL_COLORS.cream }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>
                <table
                  role="presentation"
                  width={600}
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{
                    width: "100%",
                    maxWidth: 600,
                    backgroundColor: EMAIL_COLORS.ivory,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 2px 18px rgba(44,37,39,0.05)",
                  }}
                >
                  <tbody>
                    {/* Gold top stripe */}
                    <tr>
                      <td
                        height={4}
                        style={{
                          background: `linear-gradient(90deg, transparent, ${EMAIL_COLORS.gold}, transparent)`,
                          fontSize: "1px",
                          lineHeight: "4px",
                        }}
                      >
                        &nbsp;
                      </td>
                    </tr>

                    {/* Logo */}
                    <tr>
                      <td align="center" style={{ padding: "36px 40px 8px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 28,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: EMAIL_COLORS.charcoal,
                          }}
                        >
                          Lace
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 9,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: EMAIL_COLORS.gold,
                            fontWeight: 500,
                            marginTop: -2,
                          }}
                        >
                          by La Luz
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "28px 40px 40px" }}>{children}</td>
                    </tr>

                    {/* Centennial badge */}
                    <tr>
                      <td align="center" style={{ padding: "0 40px 32px" }}>
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          border={0}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "8px 16px",
                                  border: `1px solid ${EMAIL_COLORS.gold}`,
                                  borderRadius: 999,
                                  fontSize: 10,
                                  letterSpacing: "0.3em",
                                  textTransform: "uppercase",
                                  color: EMAIL_COLORS.gold,
                                  fontWeight: 500,
                                }}
                              >
                                Centennial · 1926 – 2026
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "32px 40px",
                          backgroundColor: EMAIL_COLORS.pearl,
                          borderTop: `1px solid ${EMAIL_COLORS.border}`,
                        }}
                      >
                        {footerNote && (
                          <p
                            style={{
                              margin: "0 0 16px",
                              fontSize: 12,
                              lineHeight: 1.7,
                              color: EMAIL_COLORS.warmGray,
                              fontStyle: "italic",
                            }}
                          >
                            {footerNote}
                          </p>
                        )}
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 11,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: EMAIL_COLORS.warmGray,
                          }}
                        >
                          Buy one · Give one
                        </p>
                        <p
                          style={{
                            margin: "0 0 16px",
                            fontSize: 11,
                            color: EMAIL_COLORS.softGray,
                          }}
                        >
                          Lace by La Luz &middot; Guadalajara, México
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: EMAIL_COLORS.softGray,
                          }}
                        >
                          <a
                            href={`${SITE}/shop`}
                            style={{
                              color: EMAIL_COLORS.warmGray,
                              textDecoration: "none",
                              margin: "0 6px",
                            }}
                          >
                            Shop
                          </a>
                          ·
                          <a
                            href={`${SITE}/journal`}
                            style={{
                              color: EMAIL_COLORS.warmGray,
                              textDecoration: "none",
                              margin: "0 6px",
                            }}
                          >
                            Journal
                          </a>
                          ·
                          <a
                            href={`${SITE}/journey`}
                            style={{
                              color: EMAIL_COLORS.warmGray,
                              textDecoration: "none",
                              margin: "0 6px",
                            }}
                          >
                            Journey
                          </a>
                          ·
                          <a
                            href={`${SITE}/account`}
                            style={{
                              color: EMAIL_COLORS.warmGray,
                              textDecoration: "none",
                              margin: "0 6px",
                            }}
                          >
                            Account
                          </a>
                        </p>
                        <p
                          style={{
                            marginTop: 18,
                            fontSize: 10,
                            color: EMAIL_COLORS.softGray,
                            lineHeight: 1.6,
                          }}
                        >
                          You&apos;re receiving this because you subscribed at{" "}
                          <a
                            href={SITE}
                            style={{
                              color: EMAIL_COLORS.warmGray,
                              textDecoration: "underline",
                            }}
                          >
                            lacebylaluz.com
                          </a>
                          .
                          <br />
                          <a
                            href={`${SITE}/account/preferences`}
                            style={{ color: EMAIL_COLORS.warmGray }}
                          >
                            Update preferences
                          </a>{" "}
                          ·{" "}
                          <a
                            href={`${SITE}/unsubscribe?email={{email}}`}
                            style={{ color: EMAIL_COLORS.warmGray }}
                          >
                            Unsubscribe
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/* ── Shared building blocks ─────────────────────────────────────
   Small components used by every template to keep spacing and
   voice consistent. Keep all styling inline — don't extract into
   className-based patterns (email clients strip them). */

export function Heading({
  children,
  italic,
}: {
  children: ReactNode;
  italic?: boolean;
}) {
  return (
    <h1
      style={{
        margin: "0 0 16px",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 30,
        lineHeight: 1.2,
        fontWeight: 500,
        color: EMAIL_COLORS.charcoal,
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {children}
    </h1>
  );
}

export function Subhead({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 20px",
        fontSize: 11,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: EMAIL_COLORS.gold,
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        fontSize: 15,
        lineHeight: 1.75,
        color: EMAIL_COLORS.warmGray,
      }}
    >
      {children}
    </p>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const primary = variant === "primary";
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: "16px 0" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              borderRadius: 999,
              backgroundColor: primary ? EMAIL_COLORS.burgundy : EMAIL_COLORS.ivory,
              border: primary ? "none" : `1px solid ${EMAIL_COLORS.charcoal}`,
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "14px 32px",
                fontSize: 13,
                letterSpacing: "0.08em",
                color: primary ? EMAIL_COLORS.white : EMAIL_COLORS.charcoal,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function GoldLine() {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: "20px 0" }}
    >
      <tbody>
        <tr>
          <td
            height={1}
            width={60}
            style={{
              background: `linear-gradient(90deg, transparent, ${EMAIL_COLORS.gold}, transparent)`,
              fontSize: "1px",
              lineHeight: "1px",
            }}
          >
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Signoff({
  name = "Luz Maria",
  note,
}: {
  name?: string;
  note?: string;
}) {
  return (
    <div style={{ marginTop: 28 }}>
      {note && (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 14,
            lineHeight: 1.7,
            color: EMAIL_COLORS.warmGray,
            fontStyle: "italic",
          }}
        >
          {note}
        </p>
      )}
      <p
        style={{
          margin: 0,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 20,
          fontStyle: "italic",
          color: EMAIL_COLORS.burgundy,
        }}
      >
        — {name}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 10,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: EMAIL_COLORS.warmGray,
        }}
      >
        Founder · Lace by La Luz
      </p>
    </div>
  );
}

export { SITE };
