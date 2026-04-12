// Journal — Lace by La Luz editorial content.
//
// A lightweight, typed content system for our blog. Posts live here rather
// than a CMS for now so the editorial voice stays tightly controlled and the
// site stays statically generated. Each post is composed of a small set of
// section primitives (paragraph, quote, heading, image, list) so the layout
// component can render any post consistently with luxury typography.
//
// When we migrate to Sanity/Contentful, these types map 1:1.

export type JournalCategory =
  | "Heritage"
  | "Craft"
  | "Sisterhood"
  | "Mission"
  | "Rituals";

export type JournalSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[]; style?: "bullet" | "numbered" }
  | {
      type: "image";
      gradient: string; // tailwind gradient classes, placeholder until CMS
      caption?: string;
      aspect?: "wide" | "square" | "portrait";
    }
  | { type: "divider" };

export interface JournalPost {
  slug: string;
  title: string;
  dek: string; // sub-headline / standfirst
  excerpt: string; // teaser for listing + OG description
  category: JournalCategory;
  author: string;
  authorRole: string;
  date: string; // YYYY-MM-DD
  readMinutes: number;
  coverGradient: string;
  coverAccent: "rose" | "gold" | "burgundy" | "champagne";
  featured?: boolean;
  tags: string[];
  body: JournalSection[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "language-of-lace",
    title: "The Language of Lace",
    dek: "On why we still cover — and why it is more tender than you think.",
    excerpt:
      "Before it is a veil it is a whisper — a quiet decision to be present, to be reverent, to be seen in a softer light. A meditation on what the veil says, and what it refuses to say.",
    category: "Heritage",
    author: "Luz Maria Hernández",
    authorRole: "Founder",
    date: "2026-03-14",
    readMinutes: 6,
    coverGradient: "from-blush via-rose/40 to-champagne",
    coverAccent: "rose",
    featured: true,
    tags: ["veil", "faith", "heritage", "tradition"],
    body: [
      {
        type: "paragraph",
        text:
          "There is a moment in our family — repeated across three generations now — that I have never been able to fully describe. My grandmother would lift her veil from its tissue before worship, hold it in both hands for a breath, and then settle it over her hair like a decision. Not a performance. Not a uniform. A decision.",
      },
      {
        type: "paragraph",
        text:
          "That is what the veil has always been for the women in my family: a small, quiet decision to be reverent. To arrive differently. To soften the day's noise at the doorway of the sanctuary.",
      },
      {
        type: "quote",
        text:
          "The veil is not what makes a woman holy. It is what makes her remember that she already is.",
        attribution: "My mother, Sunday morning, 2007",
      },
      { type: "heading", text: "A century of quiet decisions" },
      {
        type: "paragraph",
        text:
          "La Luz del Mundo was founded in Guadalajara in 1926. For a hundred years now, women in our community have worn the veil — not because anyone commanded them to, but because something in it corresponds to something in them. Reverence, when it is real, seeks a shape.",
      },
      {
        type: "paragraph",
        text:
          "I am acutely aware that the veil has also been misunderstood — weaponized, even — in places far from ours. This is not that. The veil we know is tender. It is chosen. It is a thread between you and the women who prayed before you.",
      },
      { type: "heading", text: "What lace remembers" },
      {
        type: "paragraph",
        text:
          "Fabric holds memory better than people do. The veil my mother wore to her first baptism still carries the faintest trace of her mother's rose oil, thirty years on. We are not making a fashion object. We are making a small, beautiful vessel that, one day, will remember you to someone.",
      },
      {
        type: "list",
        items: [
          "It is a doorway — a way to arrive at prayer more slowly.",
          "It is a bridge — to the women in your line who wore one first.",
          "It is a gift — one day folded in tissue for a daughter or a sister.",
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text:
          "If you have never worn a veil and you are curious, begin small. Hold one in both hands for a breath. Let it be a decision, not a performance. That is the whole of it.",
      },
    ],
  },
  {
    slug: "bali-to-guadalajara",
    title: "Bali to Guadalajara",
    dek: "Tracing one veil — thread to sanctuary, twelve thousand kilometers.",
    excerpt:
      "Every veil we make travels further than most people ever will. An inside look at the journey from Balinese lace-makers, through our Guadalajara atelier, to the hands that finally tie the ribbon.",
    category: "Craft",
    author: "Esteban Ruiz",
    authorRole: "Head of Atelier",
    date: "2026-02-22",
    readMinutes: 8,
    coverGradient: "from-champagne via-gold/30 to-blush",
    coverAccent: "gold",
    tags: ["craft", "artisans", "bali", "guadalajara", "process"],
    body: [
      {
        type: "paragraph",
        text:
          "The first hands on every Lace by La Luz veil are not ours. They belong to Ibu Ketut, a lace-maker in a village an hour north of Ubud whose grandmother taught her the same stitches she is now teaching her granddaughter. The thread is cotton-silk, spun in Java. The pattern — a small, repeating lily — is older than any of us.",
      },
      { type: "heading", text: "Stage one · Bali" },
      {
        type: "paragraph",
        text:
          "Bali is where the lace is born. We work with a small cooperative of eleven families. They dye, they loom, they finish the edges by hand. A single meter of our signature lace takes a full day to complete. We never rush them. When the order takes twelve weeks, the order takes twelve weeks.",
      },
      {
        type: "image",
        gradient: "from-champagne via-gold/15 to-blush",
        caption: "Hand-dyed cotton-silk drying in the Balinese sun.",
      },
      { type: "heading", text: "Stage two · The flight" },
      {
        type: "paragraph",
        text:
          "Lace is shipped in breathable muslin rolls, never vacuum-sealed. It rests for two weeks in our atelier to acclimate — fabric, like people, hates a shock. This is the least romantic stage, and the one we refuse to skip.",
      },
      { type: "heading", text: "Stage three · Guadalajara" },
      {
        type: "paragraph",
        text:
          "In our atelier, each veil is cut against a paper pattern by one of four seamstresses, all of them daughters or granddaughters of La Luz del Mundo. We do not use rotary cutters — the blade distorts the weave. Every edge is rolled and hand-hemmed. A veil takes our team roughly six hours, split across two days to let the fabric settle.",
      },
      {
        type: "quote",
        text:
          "I think about the woman who will wear it. Always. The seam line is nothing — the thought behind it is everything.",
        attribution: "María Elena, seamstress since 2019",
      },
      { type: "heading", text: "Stage four · The ribbon" },
      {
        type: "paragraph",
        text:
          "The last act, before the veil goes into its silk pouch, is the ribbon. Gold satin, hand-tied, sealed with a small wax medallion. The woman who ties the ribbon is the one who writes a short note to go with it. Every veil carries a voice.",
      },
      { type: "divider" },
      {
        type: "paragraph",
        text:
          "From Bali to your hands, the veil will pass through roughly forty human touches — no machines beyond the simplest needles. This is the luxury we actually believe in: a thing you can feel was made by someone.",
      },
    ],
  },
  {
    slug: "one-hundred-years-of-light",
    title: "One Hundred Years of Light",
    dek: "Our centennial edition, and what a century really asks of us.",
    excerpt:
      "In 2026 La Luz del Mundo celebrates one hundred years. We are releasing a single commemorative edition — one hundred numbered veils. Here is the story, and the thinking, behind it.",
    category: "Heritage",
    author: "Luz Maria Hernández",
    authorRole: "Founder",
    date: "2026-01-12",
    readMinutes: 5,
    coverGradient: "from-burgundy via-gold/40 to-champagne",
    coverAccent: "burgundy",
    featured: true,
    tags: ["centennial", "la luz del mundo", "heritage", "limited edition"],
    body: [
      {
        type: "paragraph",
        text:
          "The church my great-grandmother joined as a young woman in Guadalajara is a hundred years old this year. I do not say that lightly. A century of any institution is remarkable; a century of a faith community is rarer still; a century of one that has taught generations of women to treat reverence as a daily practice is, to me, a quiet miracle.",
      },
      { type: "heading", text: "The edition" },
      {
        type: "paragraph",
        text:
          "To honor the centennial we are making one hundred veils. Not one hundred styles — one hundred pieces of a single commemorative design. Each is numbered by hand, from 1/100 to 100/100. Each is inscribed with a small gold thread that reads 1926 – 2026. Each comes with a letter from our family and a commemorative silk pouch.",
      },
      {
        type: "list",
        items: [
          "Numbered 1/100 through 100/100.",
          "Hand-inscribed gold thread, 1926 – 2026.",
          "Commemorative silk pouch and a letter from our family.",
          "Every edition sold gifts two veils — doubling our mission for the year.",
        ],
      },
      { type: "heading", text: "What a century asks" },
      {
        type: "paragraph",
        text:
          "I have been thinking a lot this year about what it means to inherit something old and make it worth handing on. It is not enough to preserve. You also have to tend. A fire kept burning for a hundred years is not the same fire — it is the fire that was stewarded through a hundred years of nights by people who chose, again and again, not to let it go out.",
      },
      {
        type: "quote",
        text:
          "The veil is not a museum piece. It is a relay baton. Our job is to hand it on.",
      },
      { type: "heading", text: "The doubled gift" },
      {
        type: "paragraph",
        text:
          "For every centennial edition sold, two veils are gifted to sisters in communities that have asked for them — not one. In a year of gratitude, it seemed right to double what we give. Our mission has always been buy one, give one. This year, for these one hundred pieces, it is buy one, give two.",
      },
      { type: "divider" },
      {
        type: "paragraph",
        text:
          "If you wear one, you will not just be wearing a veil. You will be wearing a hundred years of Sunday mornings, of sung hymns, of grandmothers folding tissue paper. I cannot think of a more beautiful thing to carry.",
      },
    ],
  },
  {
    slug: "a-morning-in-nairobi",
    title: "A Morning in Nairobi",
    dek: "Notes from the day we delivered forty veils to a growing sisterhood.",
    excerpt:
      "In February we flew to Nairobi to meet the sisters of Iglesia La Luz Nairobi — a community of forty-seven women who had been sharing three veils between them. This is what that morning was like.",
    category: "Sisterhood",
    author: "Sofia Hernández",
    authorRole: "Co-Founder",
    date: "2026-02-04",
    readMinutes: 7,
    coverGradient: "from-rose/30 via-burgundy/20 to-blush",
    coverAccent: "burgundy",
    tags: ["nairobi", "gifted", "mission", "sisterhood", "stories"],
    body: [
      {
        type: "paragraph",
        text:
          "Sister Grace met us at the airport in a long white dress. She had not slept. She had not slept because forty-seven of her sisters had been praying all night that the veils would arrive safely, and she had been praying with them. She told us this calmly, as if describing the weather.",
      },
      { type: "heading", text: "The congregation" },
      {
        type: "paragraph",
        text:
          "Iglesia La Luz Nairobi meets in a converted community hall in the Eastleigh district. Forty-seven women, ranging in age from seventeen to eighty-three. Before our visit they had three veils between them. They rotated — Sunday by Sunday — so every woman could cover for at least some of the service.",
      },
      {
        type: "quote",
        text:
          "We never complained. But we also never had enough. To cover all of us, at once, would have been a dream we did not even let ourselves hold.",
          attribution: "Sister Grace, pastoral lead",
      },
      {
        type: "image",
        gradient: "from-rose/20 via-gold/20 to-champagne",
        caption: "The hall the morning before service. White roses on the altar.",
      },
      { type: "heading", text: "The morning" },
      {
        type: "paragraph",
        text:
          "We arrived before sunrise. The women were already there. We did not unpack the veils immediately — Sister Grace asked if they could be laid on the altar first, in prayer. For an hour, forty-seven women sat in silence with forty veils between them. I cannot describe this without crying. I have tried.",
      },
      {
        type: "paragraph",
        text:
          "When the service began, every woman wore a veil. Every single one. Some of them held the edge of the lace between their fingers for the full hour, as if to make sure it was real. A grandmother named Mama Winnie — eighty-three, a widow — wept openly when she put hers on. She had not covered in worship in four years.",
      },
      { type: "heading", text: "What I will carry" },
      {
        type: "list",
        items: [
          "The sound of forty-seven women singing in Swahili with their heads covered.",
          "Mama Winnie's two hands holding her veil as if it might fly away.",
          "The young woman, maybe twenty, who said: 'Tell them we are not a project. We are their sisters.'",
          "A girl of nine who asked if one day she could have a veil of her own.",
        ],
      },
      { type: "divider" },
      {
        type: "paragraph",
        text:
          "She will. That is the whole point. Every veil you buy is not charity — it is a sister's reach across an ocean. Nairobi is one of nine communities we have reached so far. The work, thank God, is not close to done.",
      },
    ],
  },
];

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  "Heritage",
  "Craft",
  "Sisterhood",
  "Mission",
  "Rituals",
];

export function getPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): JournalPost[] {
  const current = getPostBySlug(slug);
  if (!current) return [];
  // Same category first, then most recent, excluding self
  return JOURNAL_POSTS.filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aCat = a.category === current.category ? 0 : 1;
      const bCat = b.category === current.category ? 0 : 1;
      if (aCat !== bCat) return aCat - bCat;
      return b.date.localeCompare(a.date);
    })
    .slice(0, limit);
}

export function getSortedPosts(): JournalPost[] {
  return [...JOURNAL_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatJournalDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
