/**
 * Welcome 2 — "The women who taught us"
 * Sent: 3 days after Welcome 1.
 * Goal: deepen brand story; no product push. Pure craft / heritage narrative.
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

export default function Welcome2({ firstName }: Props) {
  return (
    <BaseLayout
      preheader="Ibu Ketut, a Balinese lace-maker, and the six hours our seamstresses spend on every veil."
      title="The women who taught us · Lace by La Luz"
    >
      <Subhead>The Craft</Subhead>
      <Heading italic>The women who taught us.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, I` : "I"} want to tell you about the first
        pair of hands that touches every Lace by La Luz veil. They do not
        belong to us.
      </Paragraph>

      <Paragraph>
        They belong to Ibu Ketut, a lace-maker in a village an hour north of
        Ubud. Her grandmother taught her the stitches she is now teaching her
        own granddaughter. A single meter of our signature lace takes her a
        full day to complete. We have never once asked her to work faster.
      </Paragraph>

      <blockquote
        style={{
          margin: "20px 0",
          padding: "8px 0 8px 20px",
          borderLeft: `2px solid ${EMAIL_COLORS.gold}`,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.5,
          color: EMAIL_COLORS.burgundy,
        }}
      >
        &ldquo;I think about the woman who will wear it. Always. The seam line
        is nothing — the thought behind it is everything.&rdquo;
        <span
          style={{
            display: "block",
            marginTop: 8,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: EMAIL_COLORS.warmGray,
            fontStyle: "normal",
          }}
        >
          — María Elena, our atelier, since 2019
        </span>
      </blockquote>

      <Paragraph>
        In Guadalajara, four women — all daughters or granddaughters of our
        congregation — cut, roll, and hand-hem each veil against a paper
        pattern. A single piece takes roughly six hours, spread across two
        days so the fabric can rest. We do not use rotary cutters. We do not
        vacuum-seal. We do not rush.
      </Paragraph>

      <Paragraph>
        The luxury we actually believe in is this: a thing you can feel was
        made by someone.
      </Paragraph>

      <Button href={`${SITE}/journal/bali-to-guadalajara`}>
        Read the full journey
      </Button>

      <Paragraph>
        One more letter is coming — this one about a morning in Nairobi. And
        then I will go quiet for a while.
      </Paragraph>

      <Signoff />
    </BaseLayout>
  );
}
