/**
 * Welcome 1 — "A quiet hello"
 *
 * Sent: immediately on newsletter signup / account creation.
 * Goal: welcome warmly, establish voice, give ONE soft invitation (not a sale).
 * Inspiration: The first letter from a luxury house — tender, assured, not
 * transactional. A nod to TOMS' mission language without the heavy CTA.
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
}

export default function Welcome1({ firstName }: Props) {
  const greeting = firstName ? `Dear ${firstName},` : "Dear friend,";

  return (
    <BaseLayout
      preheader="A quiet hello from our family to yours — and a small promise."
      title="Welcome to Lace by La Luz"
    >
      <Subhead>A Quiet Hello</Subhead>
      <Heading italic>Welcome, sister.</Heading>
      <GoldLine />

      <Paragraph>{greeting}</Paragraph>

      <Paragraph>
        Thank you for subscribing. I want to start with something small: we do
        not send many emails. We believe your inbox should be as quiet as the
        moment before worship.
      </Paragraph>

      <Paragraph>
        Lace by La Luz is a family project — three generations of women rooted
        in La Luz del Mundo, the church our great-grandmother helped build in
        Guadalajara a hundred years ago. Every veil we make is crafted with
        reverence in Bali, hand-finished in our atelier, and packaged with a
        letter.
      </Paragraph>

      <Paragraph>
        For every veil you buy, one is gifted — to a sister in a growing
        community who does not yet have her own. So far we have gifted to nine
        communities on four continents. Every one of them began with someone
        exactly like you.
      </Paragraph>

      <Button href={`${SITE}/story`}>Read our story</Button>

      <Paragraph>
        Over the next few weeks I will write you two more short letters — one
        on the women who taught us to sew, and one on the morning we delivered
        forty veils in Nairobi. If they feel like too much, you can step away
        at any time and I will take no offense.
      </Paragraph>

      <Signoff
        note={`With love from our atelier in Guadalajara,`}
      />

      {/* Small ps-style mission bar */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{ marginTop: 36 }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: 16,
                backgroundColor: EMAIL_COLORS.blush,
                borderRadius: 12,
                textAlign: "center",
                fontSize: 12,
                color: EMAIL_COLORS.burgundy,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              One for you · One for a sister
            </td>
          </tr>
        </tbody>
      </table>
    </BaseLayout>
  );
}
