-- ─────────────────────────────────────────────────────────────
-- Lace — Seed data (products, variants, mission recipients)
--
-- Mirrors the current static data in src/lib/products.ts and
-- src/lib/gifted.ts. Idempotent — `on conflict do nothing` so
-- re-running is safe. Journal posts intentionally NOT seeded yet;
-- src/lib/journal.ts remains source of truth until the agent
-- starts drafting into the DB.
--
-- Prices are in cents. Stock is nominal pre-order (999 each) so
-- the storefront can render "In stock" before real inventory flows.
-- ─────────────────────────────────────────────────────────────

-- ── Products ───────────────────────────────────────────────────
insert into lace.products (slug, name, subtitle, description, category, price_cents, active, featured, sort, accent_gradient, hero_copy, metadata)
values
  ('grace-veil', 'Grace Veil', 'Timeless ivory elegance',
   'Our signature piece. The Grace Veil features hand-finished Bali lace with a delicate scalloped edge. Designed for women who carry themselves with quiet confidence and deep reverence. Lightweight, breathable, and beautiful enough to become an heirloom.',
   'signature', 4900, true, true, 10,
   'from-amber-50 via-orange-50 to-yellow-50', 'Timeless ivory elegance',
   '{"style":"Classic Lace","preOrder":true,"features":["Hand-finished Bali lace","Scalloped edge detail","Lightweight & breathable","One size — generous drape"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Steam lightly if needed — do not iron directly"]}'::jsonb),

  ('rosa-veil', 'Rosa Veil', 'Soft blush with floral whisper',
   'The Rosa Veil brings a subtle warmth to your worship. Crafted with blush-toned lace featuring a delicate rose-petal motif woven throughout. For the woman who loves soft femininity with meaning.',
   'signature', 5200, true, false, 20,
   'from-pink-50 via-rose-50 to-pink-100', 'Soft blush with floral whisper',
   '{"style":"Floral Lace","preOrder":true,"features":["Rose-petal lace motif","Soft blush tones","Gentle drape & coverage","One size — generous fit"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Steam lightly if needed — do not iron directly"]}'::jsonb),

  ('serena-veil', 'Serena Veil', 'Cathedral-length classic',
   'Named for serenity itself. The Serena Veil offers an extended drape inspired by cathedral tradition. Rich lace detailing meets modern comfort — for the woman who wants presence and grace in equal measure.',
   'signature', 5600, true, false, 30,
   'from-stone-50 via-amber-50 to-stone-100', 'Cathedral-length classic',
   '{"style":"Classic Lace","preOrder":true,"features":["Extended cathedral-length drape","Intricate lace border detail","Premium weight fabric","One size — generous coverage"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Steam lightly if needed — do not iron directly"]}'::jsonb),

  ('luz-veil', 'Luz Veil', 'Pure white radiance',
   'The Luz Veil — named for light itself. Pure white Bali lace with a clean, modern edge. No embellishment, just beautiful simplicity. For the woman who lets her faith speak louder than her accessories.',
   'essentials', 4900, true, false, 40,
   'from-gray-50 via-white to-gray-50', 'Pure white radiance',
   '{"style":"Minimal","preOrder":true,"features":["Clean modern edge finish","Pure Bali lace","Ultra-lightweight","One size — classic drape"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Steam lightly if needed — do not iron directly"]}'::jsonb),

  ('esperanza-veil', 'Esperanza Veil', 'Woven with hope',
   'Esperanza means hope — and this veil carries that promise in every thread. A warm ivory base with gold-kissed lace threading that catches light beautifully. For celebrations, special services, and moments that matter.',
   'limited', 5800, true, true, 50,
   'from-yellow-50 via-amber-50 to-orange-50', 'Woven with hope',
   '{"style":"Embellished","preOrder":true,"features":["Gold-kissed lace threading","Warm ivory base","Special occasion weight","One size — elegant drape"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Do not wring — handle with care"]}'::jsonb),

  ('hermosa-veil', 'Hermosa Veil', 'Beautiful in every language',
   'Hermosa — beautiful. This veil combines our finest floral lace with a generous mantilla-style cut. Designed for the woman who wants to feel covered in beauty from head to heart. A bestseller in the making.',
   'signature', 5400, true, false, 60,
   'from-rose-50 via-pink-50 to-amber-50', 'Beautiful in every language',
   '{"style":"Floral Lace","preOrder":true,"features":["Mantilla-style generous cut","All-over floral lace pattern","Soft rolled edges","One size — full coverage drape"],"care":["Hand wash cold with gentle soap","Lay flat to dry on a clean towel","Store folded in the included silk pouch","Steam lightly if needed — do not iron directly"]}'::jsonb)
on conflict (slug) do nothing;

-- ── Product variants ───────────────────────────────────────────
-- SKU format: LL-<PRODUCT>-<COLOR_CODE>. Pre-order stock nominal 999.
with p as (select id, slug from lace.products)
insert into lace.product_variants (product_id, sku, variant_name, stock, is_default, sort, price_cents)
select p.id, v.sku, v.variant_name, 999, v.is_default, v.sort, null
from p
join (values
  -- Grace
  ('grace-veil',     'LL-GRACE-IVO',   'Ivory',          true,  10),
  ('grace-veil',     'LL-GRACE-PRL',   'Pearl White',    false, 20),
  ('grace-veil',     'LL-GRACE-CHP',   'Champagne',      false, 30),
  -- Rosa
  ('rosa-veil',      'LL-ROSA-BLU',    'Blush',          true,  10),
  ('rosa-veil',      'LL-ROSA-DRS',    'Dusty Rose',     false, 20),
  ('rosa-veil',      'LL-ROSA-SPK',    'Soft Pink',      false, 30),
  -- Serena
  ('serena-veil',    'LL-SERENA-CRM',  'Cream',          true,  10),
  ('serena-veil',    'LL-SERENA-IVO',  'Ivory',          false, 20),
  -- Luz
  ('luz-veil',       'LL-LUZ-WHT',     'White',          true,  10),
  ('luz-veil',       'LL-LUZ-SNW',     'Snow',           false, 20),
  -- Esperanza
  ('esperanza-veil', 'LL-ESP-GIV',     'Gold Ivory',     true,  10),
  ('esperanza-veil', 'LL-ESP-WGD',     'Warm Gold',      false, 20),
  -- Hermosa
  ('hermosa-veil',   'LL-HERMOSA-IFL', 'Ivory Floral',   true,  10),
  ('hermosa-veil',   'LL-HERMOSA-BFL', 'Blush Floral',   false, 20),
  ('hermosa-veil',   'LL-HERMOSA-CFL', 'Cream Floral',   false, 30)
) as v(slug, sku, variant_name, is_default, sort) on v.slug = p.slug
on conflict (sku) do nothing;

-- ── Mission recipients (current gifted communities) ────────────
-- Partial unique index on metadata->>'legacy_id' makes the insert
-- idempotent — re-running the seed does nothing.
create unique index if not exists mission_recipients_legacy_id_uidx
  on lace.mission_recipients ((metadata->>'legacy_id'))
  where metadata ? 'legacy_id';

insert into lace.mission_recipients
  (community, city, country, region, flag_emoji, map_x, map_y,
   veils_requested, veils_gifted, story, accent_gradient, active, metadata)
values
  ('Hermana Iglesia Central',      'Guadalajara',    'México',       'Latin America', '🇲🇽', 0.235, 0.470, 42, 42,
   'Our first gifting, to the mother community in Guadalajara. Forty-two sisters received veils during the centennial prayer service.',
   'from-rose/30 via-blush/25 to-champagne/30', true, '{"legacy_id":"mx-gdl","date":"2026-02"}'::jsonb),

  ('Congregación Luz de Vida',     'San Salvador',   'El Salvador',  'Latin America', '🇸🇻', 0.265, 0.530, 18, 18,
   'A small congregation in the hills welcomed eighteen veils, one for each of their newly baptized sisters.',
   'from-mauve/25 via-rose/20 to-blush/30', true, '{"legacy_id":"sv-ss","date":"2026-03"}'::jsonb),

  ('Hermanas de Bogotá',           'Bogotá',         'Colombia',     'Latin America', '🇨🇴', 0.300, 0.580, 24, 24,
   'Twenty-four veils arrived in Bogotá just before Holy Week — blessed by the pastor and shared with elder sisters first.',
   'from-blush/30 via-rose/20 to-rose-gold/25', true, '{"legacy_id":"co-bog","date":"2026-03"}'::jsonb),

  ('Iglesia de Lima',              'Lima',           'Perú',         'Latin America', '🇵🇪', 0.290, 0.650, 15, 15,
   'A coastal congregation where many sisters had never owned a veil of their own — fifteen received theirs with tears of joy.',
   'from-champagne/30 via-blush/20 to-mauve/20', true, '{"legacy_id":"pe-lim","date":"2026-04"}'::jsonb),

  ('Sisters of Nairobi',           'Nairobi',        'Kenya',        'Africa',        '🇰🇪', 0.580, 0.590, 30, 30,
   'Thirty veils were gifted at a growing congregation in Nairobi — the first Lace by La Luz shipment to the African continent.',
   'from-gold/20 via-champagne/30 to-rose/20', true, '{"legacy_id":"ke-nai","date":"2026-02"}'::jsonb),

  ('Lagos Sisterhood',             'Lagos',          'Nigeria',      'Africa',        '🇳🇬', 0.510, 0.570, 22, 22,
   'Twenty-two sisters in Lagos received veils ahead of their centennial celebration service.',
   'from-rose-gold/25 via-blush/25 to-gold/15', true, '{"legacy_id":"ng-lag","date":"2026-03"}'::jsonb),

  ('Johannesburg Congregation',    'Johannesburg',   'South Africa', 'Africa',        '🇿🇦', 0.570, 0.740, 16, 16,
   'A young congregation in Johannesburg — sixteen veils for sixteen sisters preparing for their first communion service.',
   'from-champagne/25 via-rose/15 to-rose-gold/20', true, '{"legacy_id":"za-joh","date":"2026-04"}'::jsonb),

  ('Hermanas de Manila',           'Manila',         'Philippines',  'Asia',          '🇵🇭', 0.820, 0.560, 28, 28,
   'The Manila sisters welcomed twenty-eight veils — many hand-delivered by church members returning from abroad.',
   'from-blush/30 via-mauve/20 to-rose-gold/25', true, '{"legacy_id":"ph-man","date":"2026-03"}'::jsonb),

  ('Chennai Sisters in Faith',     'Chennai',        'India',        'Asia',          '🇮🇳', 0.700, 0.580, 20, 20,
   'A small, devoted community in Chennai — twenty veils for twenty sisters, each chosen by lot during morning prayer.',
   'from-gold/15 via-champagne/25 to-blush/25', true, '{"legacy_id":"in-che","date":"2026-04"}'::jsonb)
on conflict ((metadata->>'legacy_id')) where metadata ? 'legacy_id' do nothing;
