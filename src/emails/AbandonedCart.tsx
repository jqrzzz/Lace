/**
 * AbandonedCart — "Your veil is waiting"
 *
 * Sent: 4 hours after cart abandonment, then a follow-up at 24h if needed.
 * Voice: not pushy, not urgent-countdown. A gentle "we saved your place."
 * Luxury-ecom best practice: show the product beautifully, include a single
 * quiet incentive (free shipping) rather than a discount that cheapens the
 * brand. Mission reminder at bottom.
 */

import BaseLayout, {
  Heading,
  Subhead,
  Paragraph,
  Button,
  GoldLine,
  Signoff,
  EMAIL_COLORS,
} from "./BaseLayout";

interface AbandonedCartItem {
  slug: string;
  name: string;
  variantLabel?: string;
  price: string; // formatted, e.g. "$189"
  gradient: string; // tailwind-style gradient (not used in email) — kept for CMS parity
}

interface Props {
  firstName?: string;
  items: AbandonedCartItem[];
  checkoutUrl: string;
}

export default function AbandonedCart({ firstName, items, checkoutUrl }: Props) {
  return (
    <BaseLayout
      preheader="We saved your veil — no rush. Whenever you're ready."
      title="Your veil is waiting"
    >
      <Subhead>We Saved Your Place</Subhead>
      <Heading italic>Your veil is waiting.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, you` : "You"} left something lovely
        behind. No rush at all — we simply wanted to let you know your place
        in line is held.
      </Paragraph>

      {/* Item(s) */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{ margin: "20px 0" }}
      >
        <tbody>
          {items.map((item) => (
            <tr key={item.slug}>
              <td
                style={{
                  padding: 16,
                  border: `1px solid ${EMAIL_COLORS.border}`,
                  borderRadius: 12,
                  backgroundColor: EMAIL_COLORS.ivory,
                }}
              >
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td width={90} style={{ paddingRight: 16 }}>
                        <div
                          style={{
                            width: 80,
                            height: 100,
                            background: `linear-gradient(135deg, ${EMAIL_COLORS.blush}, ${EMAIL_COLORS.pearl})`,
                            borderRadius: 8,
                          }}
                        />
                      </td>
                      <td valign="middle">
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 18,
                            color: EMAIL_COLORS.charcoal,
                          }}
                        >
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: 12,
                              color: EMAIL_COLORS.warmGray,
                            }}
                          >
                            {item.variantLabel}
                          </p>
                        )}
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: 14,
                            color: EMAIL_COLORS.burgundy,
                            fontWeight: 500,
                          }}
                        >
                          {item.price}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button href={checkoutUrl}>Complete your order</Button>

      {/* Quiet incentive */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{ margin: "24px 0" }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              style={{
                padding: 14,
                backgroundColor: EMAIL_COLORS.pearl,
                border: `1px solid ${EMAIL_COLORS.border}`,
                borderRadius: 12,
                fontSize: 12,
                color: EMAIL_COLORS.warmGray,
                letterSpacing: "0.1em",
              }}
            >
              Complimentary shipping &middot; Code{" "}
              <strong style={{ color: EMAIL_COLORS.burgundy }}>SISTER</strong>{" "}
              at checkout
            </td>
          </tr>
        </tbody>
      </table>

      <Paragraph>
        And remember — every veil you purchase gifts a second veil to a sister
        who does not yet have one. The last forty went to Nairobi.
      </Paragraph>

      <Signoff
        name="Luz Maria"
        note="If the moment isn't right, truly — I understand."
      />
    </BaseLayout>
  );
}
