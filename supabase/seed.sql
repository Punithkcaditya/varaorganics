-- Vara Organics — seed data (Dev Kit §11).
-- Mirrors src/data/catalog.ts + src/data/articles.ts. Prices/batches flagged
-- CONFIRM in ASSUMPTIONS.md are placeholders. Design-only extras are active=false.
-- Idempotent via stable slugs/SKUs (on conflict do nothing).

-- ── site settings ──
insert into public.site_settings (key, value) values
  ('announcement', to_jsonb('Lab report on every batch · Free Bangalore delivery ₹999+ · Scan QR on any jar — see your exact test results'::text)),
  ('freeShippingThreshold', to_jsonb(999)),
  ('heroHeadline', to_jsonb('The ghee your grandmother knew.'::text)),
  ('heroHeadlineEm', to_jsonb('Proved, not claimed.'::text))
on conflict (key) do nothing;

-- ══════════════ PRODUCTS ══════════════

-- Ghee
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, nutritional_info, faqs, learn_links, active, featured, is_bundle)
values (
  'a2-gir-cow-bilona-ghee', 'A2 Gir Cow Bilona Ghee', 'ghee', 'ghee',
  'Slow-churned by the traditional bilona method from A2 Gir cow milk. NABL lab-tested, batch-traced, nothing added.',
  $md$## Made the way it always should be

Vara's A2 Gir Cow Bilona Ghee is hand-churned from cultured curd into butter, then slow-cooked on a wood fire into golden ghee.

## Why bilona matters

Industrial ghee is separated by machine from cream. Bilona ghee begins with curd, is hand-churned, and slow-simmered.

### Testing

Every batch is independently NABL lab-tested before it ships.$md$,
  '100% A2 Gir cow milk ghee. Nothing else. No preservatives, no colour, no additives.',
  '{"servingSize":"per 100 g (approx. — CONFIRM with Label Spec)","rows":[{"label":"Energy","value":"900 kcal"},{"label":"Total Fat","value":"100 g"},{"label":"Saturated Fat","value":"62 g"}]}',
  '[{"question":"What is bilona ghee?","answer":"Cultured curd hand-churned into butter, then slow-cooked into ghee."},{"question":"Is this A2 ghee?","answer":"Yes, made from A2 Gir cow milk."}]',
  array['what-is-bilona-ghee','a2-vs-a1-ghee-difference'], true, true, false
) on conflict (slug) do nothing;

-- Honey
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, nutritional_info, faqs, learn_links, active, featured, is_bundle)
values (
  'raw-wild-forest-honey', 'Raw Wild Forest Honey', 'honey', 'honey',
  'Wild-harvested, unheated and pollen-rich. Raw honey the way bees make it — never processed, never blended.',
  $md$## Raw, unheated, unblended

Collected from wild colonies and bottled without heating or filtering out the pollen. Raw honey crystallises naturally over time.$md$,
  '100% raw wild forest honey. Nothing added.',
  '{"servingSize":"per 100 g (approx. — CONFIRM)","rows":[{"label":"Energy","value":"304 kcal"},{"label":"Carbohydrate","value":"82 g"}]}',
  '[{"question":"Why has my honey crystallised?","answer":"Natural for raw, unheated honey — a sign of purity."}]',
  array['how-to-check-honey-is-pure','what-is-raw-honey'], true, false, false
) on conflict (slug) do nothing;

-- Sesame oil
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, nutritional_info, faqs, learn_links, active, featured, is_bundle)
values (
  'wood-pressed-sesame-oil', 'Wood Pressed Sesame Oil', 'oils', 'oils',
  'Extracted on a traditional wooden ghani — not steel cold-press. Unrefined, full-flavoured sesame oil.',
  $md$## Wooden ghani, not steel press

Extracted on a wooden ghani (kolhu). Unrefined, retaining aroma and character.$md$,
  '100% wood-pressed (ghani) sesame oil. Unrefined. No additives.',
  '{"servingSize":"per 100 ml (approx. — CONFIRM)","rows":[{"label":"Energy","value":"884 kcal"},{"label":"Total Fat","value":"100 g"}]}',
  '[{"question":"What is wood-pressed oil?","answer":"Oil extracted on a traditional wooden ghani at lower temperatures."}]',
  array['wood-pressed-vs-cold-pressed','what-is-ghani-pressing'], true, false, false
) on conflict (slug) do nothing;

-- Groundnut oil
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, ingredients, nutritional_info, faqs, learn_links, active, featured, is_bundle)
values (
  'wood-pressed-groundnut-oil', 'Wood Pressed Groundnut Oil', 'oils', 'oils',
  'Ghani-pressed groundnut (peanut) oil. No chemical refining, no deodorising — just pressed and filtered.',
  $md$## Traditional groundnut oil

Pressed on a wooden ghani and simply filtered — never chemically refined.$md$,
  '100% wood-pressed (ghani) groundnut oil. Unrefined. No additives.',
  '{"servingSize":"per 100 ml (approx. — CONFIRM)","rows":[{"label":"Energy","value":"884 kcal"},{"label":"Total Fat","value":"100 g"}]}',
  '[{"question":"Is this oil refined?","answer":"No — wood-pressed and filtered only."}]',
  array['wood-pressed-vs-cold-pressed','what-is-ghani-pressing'], true, false, false
) on conflict (slug) do nothing;

-- Wellness Starter bundle
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, faqs, learn_links, active, featured, is_bundle)
values (
  'wellness-starter', 'The Wellness Starter Bundle', 'ghee', 'ghee',
  'A2 Gir Cow Bilona Ghee 500ml + Raw Wild Forest Honey — the perfect start. NABL lab reports for both.',
  $md$## The Wellness Starter

Our hand-churned A2 Gir Cow Bilona Ghee and Raw Wild Forest Honey, both batch-traced with NABL lab reports.$md$,
  '[{"question":"What is included in the bundle?","answer":"A2 Gir Cow Bilona Ghee (500ml) and Raw Wild Forest Honey."}]',
  array['what-is-bilona-ghee','what-is-raw-honey'], true, true, true
) on conflict (slug) do nothing;

-- Design-only extras (active = false)
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, active, is_bundle)
values
  ('extra-virgin-coconut-oil', 'Extra Virgin Coconut Oil', 'oils', 'oils', 'Cold-pressed, unrefined coconut oil from Kerala. (Not part of the launch catalog.)', '## Extra Virgin Coconut Oil', false, false),
  ('mustard-flower-honey', 'Mustard Flower Honey', 'honey', 'honey', 'Single-origin mustard flower honey that crystallises naturally. (Not part of the launch catalog.)', '## Mustard Flower Honey', false, false)
on conflict (slug) do nothing;

-- ══════════════ VARIANTS ══════════════
insert into public.product_variants (product_id, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
select p.id, v.size, v.sku, v.price, v.compare_at_price, v.stock, v.unit_label, v.unit_base, v.unit_type, v.route_slug, v.active, v.position
from public.products p
join (values
  ('a2-gir-cow-bilona-ghee', '250ml', 'VARA-GHEE-250', 799, null::int, 40, '250ml', 250, 'ml', null, false, 0),
  ('a2-gir-cow-bilona-ghee', '500ml', 'VARA-GHEE-500', 1399, null, 50, '500ml', 500, 'ml', 'a2-gir-cow-bilona-ghee-500ml', true, 1),
  ('a2-gir-cow-bilona-ghee', '1L', 'VARA-GHEE-1000', 2699, 2798, 30, '1L', 1000, 'ml', 'a2-gir-cow-bilona-ghee-1l', true, 2),
  ('raw-wild-forest-honey', '250g', 'VARA-HONEY-250', 399, null, 60, '250g', 250, 'g', null, false, 0),
  ('raw-wild-forest-honey', '500g', 'VARA-HONEY-500', 749, null, 45, '500g', 500, 'g', 'raw-wild-forest-honey-500g', true, 1),
  ('raw-wild-forest-honey', '1kg', 'VARA-HONEY-1000', 1399, null, 20, '1kg', 1000, 'g', null, false, 2),
  ('wood-pressed-sesame-oil', '500ml', 'VARA-SESAME-500', 599, null, 35, '500ml', 500, 'ml', null, false, 0),
  ('wood-pressed-sesame-oil', '1L', 'VARA-SESAME-1000', 1149, null, 30, '1L', 1000, 'ml', 'wood-pressed-sesame-oil-1l', true, 1),
  ('wood-pressed-groundnut-oil', '1L', 'VARA-GNUT-1000', 849, null, 40, '1L', 1000, 'ml', 'wood-pressed-groundnut-oil-1l', true, 0),
  ('wellness-starter', 'Bundle', 'VARA-BUNDLE-WELLNESS', 1799, 1948, 25, 'bundle', 0, 'g', 'wellness-starter', true, 0),
  ('extra-virgin-coconut-oil', '500ml', 'VARA-COCO-500', 799, null, 0, '500ml', 500, 'ml', null, false, 0),
  ('mustard-flower-honey', '500g', 'VARA-MHONEY-500', 649, null, 0, '500g', 500, 'g', null, false, 0)
) as v(pslug, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
  on p.slug = v.pslug
on conflict (sku) do nothing;

-- ══════════════ IMAGES (placeholders) ══════════════
insert into public.product_images (product_id, url, alt, position)
select p.id, case when img.key in ('ghee','honey','sesame','groundnut') then '/product-images/' || img.key || '.jpg' else '/placeholders/' || img.key || '.svg' end, p.product_name || ' - product photo ' || g.n || case when img.key in ('ghee','honey','sesame','groundnut') then '' else ' (placeholder pending photography)' end, g.n - 1
from public.products p
join (values
  ('a2-gir-cow-bilona-ghee','ghee'),
  ('raw-wild-forest-honey','honey'),
  ('wood-pressed-sesame-oil','sesame'),
  ('wood-pressed-groundnut-oil','groundnut'),
  ('wellness-starter','bundle'),
  ('extra-virgin-coconut-oil','coconut'),
  ('mustard-flower-honey','mustard-honey')
) as img(pslug, key) on p.slug = img.pslug
cross join generate_series(1,4) as g(n);

-- ══════════════ BATCHES + LAB PARAMS ══════════════
insert into public.product_batches (product_id, batch_number, mfg_date, best_before, lab_report_url, active)
select p.id, b.batch_number, b.mfg_date::date, b.best_before::date, null, true
from public.products p
join (values
  ('a2-gir-cow-bilona-ghee', 'GHE-2024-047', '2026-05-10', '2027-05-09'),
  ('raw-wild-forest-honey', 'HON-2024-013', '2026-04-22', '2028-04-21'),
  ('wood-pressed-sesame-oil', 'SES-2024-008', '2026-05-02', '2027-02-01'),
  ('wood-pressed-groundnut-oil', 'GNT-2024-005', '2026-05-06', '2027-02-05')
) as b(pslug, batch_number, mfg_date, best_before) on p.slug = b.pslug
on conflict (batch_number) do nothing;

insert into public.lab_parameters (batch_id, name, result, status, position)
select bt.id, lp.name, lp.result, lp.status, lp.position
from public.product_batches bt
join (values
  ('GHE-2024-047','Moisture content','0.12%','Pass',0),
  ('GHE-2024-047','Butyric acid (C4:0)','3.82%','Premium',1),
  ('GHE-2024-047','Antibiotics','Not detected','Pass',2),
  ('GHE-2024-047','Heavy metals','Not detected','Pass',3),
  ('HON-2024-013','Moisture','17.8%','Pass',0),
  ('HON-2024-013','HMF','12 mg/kg','Pass',1),
  ('HON-2024-013','Added sugar (C4)','Not detected','Pass',2),
  ('HON-2024-013','Antibiotics','Not detected','Pass',3),
  ('SES-2024-008','Free fatty acids','0.9%','Pass',0),
  ('SES-2024-008','Peroxide value','1.8 meq/kg','Pass',1),
  ('SES-2024-008','Argemone oil','Not detected','Pass',2),
  ('SES-2024-008','Mineral oil','Not detected','Pass',3),
  ('GNT-2024-005','Free fatty acids','1.1%','Pass',0),
  ('GNT-2024-005','Peroxide value','2.0 meq/kg','Pass',1),
  ('GNT-2024-005','Aflatoxin','Not detected','Pass',2),
  ('GNT-2024-005','Argemone oil','Not detected','Pass',3)
) as lp(batch_number, name, result, status, position) on bt.batch_number = lp.batch_number;

-- ══════════════ LEARN ARTICLES (7 launch) ══════════════
insert into public.learn_content (slug, title, excerpt, category, cover_image, body_markdown, faqs, meta_title, meta_description, read_time, related_product, published, enable_howto_schema)
values
  ('what-is-bilona-ghee','What Is Bilona Ghee?','Bilona is the traditional hand-churned method of making ghee from cultured curd.','ghee','/placeholders/ghee.svg',
    $md$Bilona ghee is made the slow, traditional way — from cultured curd, hand-churned into butter, then simmered into ghee.

# The bilona method, step by step

Milk is cultured into curd, churned into butter, then slow-cooked into golden ghee.

# How to recognise real bilona ghee

Look for a grainy texture, a nutty aroma, and a batch-specific lab report you can verify.$md$,
    '[{"question":"Is bilona ghee better than regular ghee?","answer":"Many prefer it for flavour and tradition; quality depends on sourcing and testing."}]',
    'What Is Bilona Ghee? The Traditional Method Explained','Bilona ghee is hand-churned from cultured curd, not machine-separated cream.',4,'a2-gir-cow-bilona-ghee-500ml',true,false),

  ('a2-vs-a1-ghee-difference','A2 vs A1 Ghee: What''s the Difference?','A2 and A1 refer to a protein in cow''s milk. Here''s what that means for ghee.','ghee','/placeholders/ghee.svg',
    $md$A2 and A1 describe the beta-casein protein in milk, determined by cow breed.

# What is A2 protein?

Desi breeds like Gir typically produce A2 beta-casein milk.

# Does it matter for ghee?

Ghee is almost entirely fat, so protein content is minimal in the final product.$md$,
    '[{"question":"Is A2 ghee healthier than A1?","answer":"Evidence is mixed; choose on sourcing and testing transparency."}]',
    'A2 vs A1 Ghee: The Difference Explained','A2 and A1 are milk proteins tied to cow breed.',3,'a2-gir-cow-bilona-ghee-500ml',true,false),

  ('how-to-read-ghee-lab-report','How to Read a Ghee Lab Report','A step-by-step guide to understanding the key parameters on a ghee lab report.','ghee','/placeholders/ghee.svg',
    $md$A lab report turns "pure" into something you can check.

# Step 1: Check the batch number

The report must reference the exact batch on your jar.

# Step 2: Look for adulteration markers

Adulteration and foreign-fat markers should read "Not detected".

# Step 3: Review the fatty-acid profile

Butyric acid indicates genuine dairy ghee.

# Step 4: Confirm contaminants are absent

Antibiotics and heavy metals should read "Not detected".$md$,
    '[{"question":"What should a ghee lab report show?","answer":"Batch number, moisture, fatty-acid markers, adulteration and contaminant screening."}]',
    'How to Read a Ghee Lab Report (Step by Step)','Learn to read a ghee lab report.',5,'a2-gir-cow-bilona-ghee-500ml',true,true),

  ('wood-pressed-vs-cold-pressed','Wood-Pressed vs Cold-Pressed Oil','The terms sound similar but describe different processes.','oils','/placeholders/sesame.svg',
    $md$"Wood-pressed" and "cold-pressed" are often used interchangeably, but they aren't the same.

# Wood-pressed (ghani)

A wooden ghani turns slowly, keeping temperatures moderate.

# Cold-pressed

Cold-pressed usually means a steel expeller.$md$,
    '[{"question":"Is wood-pressed better than cold-pressed?","answer":"Both are unrefined; wood-pressed uses a traditional ghani."}]',
    'Wood-Pressed vs Cold-Pressed Oil','Wood-pressed and cold-pressed oils differ in method.',4,'wood-pressed-sesame-oil-1l',true,false),

  ('what-is-ghani-pressing','What Is Ghani Pressing?','The ghani (kolhu) is a traditional wooden oil press used for thousands of years.','oils','/placeholders/groundnut.svg',
    $md$A ghani (kolhu) is a traditional wooden press for extracting oil from seeds.

# How a ghani works

A wooden pestle crushes seeds slowly, releasing oil gradually.

# Why the wood matters

Slow rotation keeps temperatures moderate, preserving flavour.$md$,
    '[{"question":"What does ghani-pressed mean?","answer":"Oil extracted using a traditional wooden ghani at moderate temperature."}]',
    'What Is Ghani Pressing?','The ghani or kolhu is a traditional wooden oil press.',3,'wood-pressed-groundnut-oil-1l',true,false),

  ('how-to-check-honey-is-pure','How to Check If Honey Is Pure','Simple checks and what a lab report tells you about honey purity.','honey','/placeholders/honey.svg',
    $md$Home tests are unreliable on their own — a lab report is the real answer.

# Step 1: Expect crystallisation

Raw, unheated honey crystallises over time.

# Step 2: Check the label

Look for "raw" and "unheated"; avoid added sugar syrup.

# Step 3: Read the lab report

Screen for added sugar (C4), moisture and HMF, and verify the batch number.$md$,
    '[{"question":"Does pure honey crystallise?","answer":"Yes — natural for raw, unheated honey."}]',
    'How to Check If Honey Is Pure (Step by Step)','Learn how to check honey purity.',4,'raw-wild-forest-honey-500g',true,true),

  ('what-is-raw-honey','What Is Raw Honey?','Raw honey is honey that hasn''t been heated or finely filtered.','honey','/placeholders/honey.svg',
    $md$Raw honey is extracted and bottled without pasteurising heat or fine filtration.

# Raw vs processed honey

Processed honey is often heated and micro-filtered.

# What raw honey keeps

Raw honey retains natural pollen and enzymes.$md$,
    '[{"question":"What does raw honey mean?","answer":"Honey that has not been pasteurised or finely filtered."}]',
    'What Is Raw Honey? Raw vs Processed Explained','Raw honey is unheated and unfiltered.',3,'raw-wild-forest-honey-500g',true,false)
on conflict (slug) do nothing;

-- ══════════════ LANDING PAGE ══════════════
insert into public.landing_pages (slug, headline, subheadline, hero_image, trust_bullets, product_slug, variant_size, cta_label, campaign_id, active)
values (
  'ghee-launch', 'The ghee your grandmother knew. Proved, not claimed.',
  'A2 Gir Cow Bilona Ghee — hand-churned, NABL lab-tested, batch-traced. Free Bangalore delivery.',
  '/placeholders/ghee.svg',
  array['70-parameter NABL lab report on every batch','Hand-churned by the traditional bilona method','QR batch traceability — scan and verify'],
  'a2-gir-cow-bilona-ghee-500ml', '500ml', 'Shop Vara Ghee — ₹1,399', 'ghee-launch-2026', true
) on conflict (slug) do nothing;
