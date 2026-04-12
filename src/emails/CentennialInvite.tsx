/**
 * CentennialInvite — "One hundred veils. One hundred years."
 *
 * Sent: to the full subscriber list on centennial edition launch.
 * Voice: heirloom drop, not a flash sale. Scarcity is real (100 pieces total)
 * but never coded as panic. Doubled-gift is the emotional hook.
 */

import BaseLayout, {
  Heading,
  Subhead,
  Paragraph,
  Button,
  GoldLine,
  Signoff,
  SITE,
  EMAIL_COLORS,
} from "./BaseLayout";

interface Props {
  firstName?: string;
  remaining?: number; // optional — piece count remaining
}

export default function CentennialInvite({ firstName, remaining }: Props) {
  return (
    <BaseLayout
      preheader="One hundred numbered veils. One hundred years of faith. Reserve yours."
      title="One hundred veils · One hundred years"
    >
      <Subhead>Centennial · 1926 – 2026</Subhead>
      <Heading italic>One hundred veils. <br />One hundred years.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, this` : "This"} year La Luz del Mundo — the
        church our family has worshipped in for three generations — turns one
        hundred. We do not take that lightly.
      </Paragraph>

      <Paragraph>
        To honor the century, we have made one hundred numbered veils. Not one
        hundred styles. One hundred pieces of a single commemorative design,
        numbered by hand 1/100 through 100/100, each inscribed with a
        hand-tied gold thread reading{" "}
        <em style={{ color: EMAIL_COLORS.burgundy }}>1926 – 2026</em>.
      </Paragraph>

      {/* Hero card */}
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
              style={{
                padding: 32,
                background: `linear-gradient(135deg, ${EMAIL_COLORS.charcoal}, ${EMAIL_COLORS.burgundy})`,
                borderRadius: 16,
                textAlign: "center",
                color: "#fff",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: EMAIL_COLORS.goldLight,
                  fontWeight: 600,
                }}
              >
                Commemorative Edition
              </p>
              <p
                style={{
                  margin: "12px 0 4px",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 44,
                  fontStyle: "italic",
                  color: "#fff",
                  lineHeight: 1.05,
                }}
              >
                100 / 100
              </p>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 12,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: EMAIL_COLORS.goldLight,
                }}
              >
                Numbered · Blessed · Boxed
              </p>
              {remaining !== undefined && (
                <p
                  style={{
                    margin: "16px 0 0",
                    fontSize: 12,
                    color: "#fff",
                    opacity: 0.85,
                  }}
                >
                  {remaining} of 100 remaining
                </p>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <Paragraph>
        <strong>And because it is the centennial:</strong> every edition sold
        gifts two veils, not one, to sisters in growing communities. Our
        mission, doubled, for this year only.
      </Paragraph>

      <ul
        style={{
          paddingLeft: 20,
          margin: "0 0 20px",
          fontSize: 14,
          lineHeight: 1.9,
          color: EMAIL_COLORS.warmGray,
        }}
      >
        <li>Numbered 1/100 through 100/100 — yours is yours alone.</li>
        <li>Hand-tied gold thread: 1926 – 2026.</li>
        <li>Commemorative silk pouch + a letter from our family.</li>
        <li>Two veils gifted per purchase — doubled mission.</li>
      </ul>

      <Button href={`${SITE}/centennial`}>Reserve your number</Button>

      <Paragraph>
        A century of Sunday mornings, sung hymns, and grandmothers folding
        tissue paper. If you wear one, you will carry it.
      </Paragraph>

      <Signoff note="With reverence," />
    </BaseLayout>
  );
}
