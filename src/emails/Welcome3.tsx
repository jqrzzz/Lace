/**
 * Welcome 3 — "A morning in Nairobi" + first soft product nudge
 * Sent: 7 days after Welcome 1 (4 days after Welcome 2).
 * Goal: emotional mission peak; first (gentle) product link + centennial hint.
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

export default function Welcome3({ firstName }: Props) {
  return (
    <BaseLayout
      preheader="Forty-seven women. Three veils. One morning that changed everything."
      title="A morning in Nairobi · Lace by La Luz"
    >
      <Subhead>The Mission</Subhead>
      <Heading italic>A morning in Nairobi.</Heading>
      <GoldLine />

      <Paragraph>
        {firstName ? `${firstName}, this` : "This"} is the last of my three
        welcome letters, and it is the one I have cried writing most.
      </Paragraph>

      <Paragraph>
        In February, my sister Sofia flew to Nairobi to deliver forty veils to
        Iglesia La Luz Nairobi — forty-seven women who had been sharing three
        veils between them on Sundays, rotating so each could cover for at
        least part of the service.
      </Paragraph>

      <Paragraph>
        They asked if the veils could be laid on the altar first, in prayer.
        So for an hour — before any of them were distributed — forty-seven
        women sat in silence with those veils. Mama Winnie, eighty-three years
        old, put hers on when the service began and wept. She had not covered
        in worship in four years.
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
        &ldquo;Tell them we are not a project. We are their sisters.&rdquo;
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
          — a sister in Nairobi, nineteen years old
        </span>
      </blockquote>

      <Paragraph>
        Every veil you buy reaches a woman like her. Not a recipient of
        charity — a sister waiting across an ocean. If you are able, and only
        if it is right for you, our shop is here:
      </Paragraph>

      <Button href={`${SITE}/shop`}>Explore the veils</Button>

      <Paragraph>
        And because this year is our centennial — one hundred years of La Luz
        del Mundo — we are making exactly one hundred commemorative veils.
        Each one gifts two.
      </Paragraph>

      <Button href={`${SITE}/centennial`} variant="secondary">
        See the centennial edition
      </Button>

      <Paragraph>
        Thank you for letting me write to you. I will go quiet now. When I
        return, it will be with a story worth your morning.
      </Paragraph>

      <Signoff note="With all my love," />
    </BaseLayout>
  );
}
