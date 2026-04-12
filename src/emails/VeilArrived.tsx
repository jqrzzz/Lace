/**
 * VeilArrived — "Your veil has landed"
 *
 * Sent: on shipping confirmation delivery (post-delivery webhook).
 * Voice: celebratory but soft. The goal is the unboxing moment, not upsell.
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
  orderNumber: string;
  veilName: string;
}

export default function VeilArrived({ firstName, orderNumber, veilName }: Props) {
  return (
    <BaseLayout
      preheader="A small ritual for opening it — and a note from our family."
      title="Your veil has landed"
    >
      <Subhead>It Has Arrived</Subhead>
      <Heading italic>Your veil has landed.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, I` : "I"} hope this reaches you on a
        morning you can take slowly. Your {veilName} should be at your door by
        now.
      </Paragraph>

      <Paragraph>Here is how we, in our family, open a new veil:</Paragraph>

      <ol
        style={{
          paddingLeft: 20,
          margin: "0 0 20px",
          fontSize: 15,
          lineHeight: 1.8,
          color: EMAIL_COLORS.warmGray,
        }}
      >
        <li>Wash your hands. (A small reverence — nothing religious.)</li>
        <li>Open the silk pouch; read the note.</li>
        <li>
          Hold the veil in both hands for a full breath before you do anything
          else.
        </li>
        <li>Put it somewhere it will rest folded until Sunday.</li>
      </ol>

      <Paragraph>
        That is all. If you take a photo, we would love to see it — but only
        if it feels right.
      </Paragraph>

      {/* Share */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{ margin: "20px 0" }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              style={{
                padding: 16,
                backgroundColor: EMAIL_COLORS.blush,
                borderRadius: 12,
                fontSize: 13,
                color: EMAIL_COLORS.burgundy,
              }}
            >
              Share with us: tag{" "}
              <strong>@lacebylaluz</strong> or{" "}
              <strong>#WornByASister</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <Paragraph>
        Because you bought one, a second veil is already on its way to a
        sister in a community that needed it. You will hear about her soon.
      </Paragraph>

      <Button href={`${SITE}/account/orders/${orderNumber}`} variant="secondary">
        View your order
      </Button>

      <Signoff />
    </BaseLayout>
  );
}
