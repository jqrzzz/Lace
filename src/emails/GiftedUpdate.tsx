/**
 * GiftedUpdate — "Her name is Mama Winnie"
 *
 * Sent: ~3–6 weeks after purchase, once the matching gifted veil is delivered
 * to a recipient community. The whole point of this email: close the loop.
 * The customer does not buy a thing — she buys a connection, and this email
 * is where we prove it.
 *
 * TOMS-inspired: personal story, specific name, specific place. No dashboard
 * gamification or "your impact" counters — those cheapen the gift. Just a
 * letter from the field.
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
  recipientName: string; // e.g. "Mama Winnie"
  recipientCity: string; // e.g. "Nairobi, Kenya"
  recipientFlag: string; // emoji, e.g. "🇰🇪"
  story: string; // 2–4 sentence dispatch
}

export default function GiftedUpdate({
  firstName,
  recipientName,
  recipientCity,
  recipientFlag,
  story,
}: Props) {
  return (
    <BaseLayout
      preheader={`A sister in ${recipientCity} received the veil you gifted.`}
      title="Her name is..."
    >
      <Subhead>The Gift Has Landed</Subhead>
      <Heading italic>Her name is {recipientName}.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, a` : "A"} few weeks ago, because you
        bought a veil, a second one was sent to a sister who did not yet have
        her own. She received it this week.
      </Paragraph>

      {/* Recipient card */}
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
                padding: 24,
                background: `linear-gradient(135deg, ${EMAIL_COLORS.cream}, ${EMAIL_COLORS.blush})`,
                border: `1px solid ${EMAIL_COLORS.gold}`,
                borderRadius: 16,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 36 }}>{recipientFlag}</p>
              <p
                style={{
                  margin: "10px 0 4px",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  color: EMAIL_COLORS.burgundy,
                }}
              >
                {recipientName}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: EMAIL_COLORS.gold,
                  fontWeight: 500,
                }}
              >
                {recipientCity}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <Paragraph>{story}</Paragraph>

      <Paragraph>
        You did that. Not a corporation. Not a foundation. You. Thank you for
        letting us be the hands in the middle.
      </Paragraph>

      <Button href={`${SITE}/journey`}>See every community we&apos;ve reached</Button>

      <Signoff note="With a full heart," />
    </BaseLayout>
  );
}
