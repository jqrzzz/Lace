/**
 * ReviewRequest — "Would you tell us?"
 *
 * Sent: ~14 days after delivery (enough time to wear it at least once).
 * Voice: conversational, zero salesy urgency. A request as from a friend.
 * Best-practice luxury: ask for feedback before ask for review, offer a
 * low-friction 5-star + optional text.
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
  productSlug: string;
  productName: string;
}

export default function ReviewRequest({
  firstName,
  productSlug,
  productName,
}: Props) {
  return (
    <BaseLayout
      preheader="A small favor — would you tell us what you thought?"
      title="Would you tell us?"
    >
      <Subhead>A Small Favor</Subhead>
      <Heading italic>Would you tell us?</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, I` : "I"} hope you have had the chance to
        wear your {productName} at least once by now.
      </Paragraph>

      <Paragraph>
        If you have a few moments, I would love to know how it felt — the
        drape of the lace, the weight, the moment you first put it on. Your
        words will help another sister decide, and they will help us make the
        next one better.
      </Paragraph>

      {/* Quick star rating row */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        style={{ margin: "24px auto" }}
      >
        <tbody>
          <tr>
            {[1, 2, 3, 4, 5].map((n) => (
              <td key={n} style={{ padding: "0 4px" }}>
                <a
                  href={`${SITE}/product/${productSlug}?rate=${n}`}
                  style={{
                    display: "inline-block",
                    width: 44,
                    height: 44,
                    lineHeight: "44px",
                    textAlign: "center",
                    borderRadius: 999,
                    border: `1px solid ${EMAIL_COLORS.gold}`,
                    color: EMAIL_COLORS.gold,
                    fontSize: 18,
                    textDecoration: "none",
                  }}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                >
                  ★
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <Button href={`${SITE}/product/${productSlug}#review`} variant="secondary">
        Leave a longer note
      </Button>

      <Paragraph>
        And if the veil did not feel right in some way — please tell me
        directly. I read every reply. Returns are open for sixty days, no
        questions asked.
      </Paragraph>

      <Signoff />
    </BaseLayout>
  );
}
