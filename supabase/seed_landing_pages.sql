-- Vara Organics — ad landing pages (Landing Page Copy doc).
-- Run AFTER 0001_init.sql and 0003_ops.sql. Mirrors src/data/landing-pages.ts.
--
-- ⚠️ CONFIRM BEFORE LAUNCH:
--  * Variant prices in this copy (250ml ₹749, 1L ₹2,599) differ from the
--    catalog (₹799 / ₹2,699). The catalog is authoritative for anything
--    charged — reconcile before these pages go live.
--  * The comparison table names competitors with prices and "Not published"
--    claims. Comparative advertising requires dated evidence on file.
--  * Lab/accreditation and farm details are owner-supplied and must be
--    substantiated (Jagdamba Laboratories, ISO 9001:2015, GLP, FSSAI 2017).

-- ── LP 1: Google Search traffic ──
insert into public.landing_pages (
  slug, announcement, eyebrow_text, headline, subheadline, hero_image,
  trust_bullets, product_slug, variant_size, cta_label, cta_button_color,
  secondary_cta_label, variant_note, campaign_id, active, noindex, meta_title,
  show_lab_card, show_comparison, comparison_rows, faqs
) values (
  'ghee-bangalore',
  'Free delivery in Bangalore on orders above ₹999 · Lab report on every batch',
  'Farm to kitchen · Gau Organics, Kota, Rajasthan',
  'A2 Gir Cow Bilona Ghee. Delivered to Bangalore in 48 hours.',
  'NABL tested across 70 parameters. Batch-traced to a single farm. No middlemen. No shortcuts.',
  null,
  array[
    'A2 Gir cow — own farm, Rajasthan',
    '70-parameter NABL tested',
    'Bilona hand-churned — not machine made',
    'QR batch traceability on every jar'
  ],
  'a2-gir-cow-bilona-ghee-500ml', '500ml',
  'Add to Cart — ₹1,399 / 500ml', 'navy',
  'Add to Cart — ₹1,399 / 500ml',
  'Also available: 250ml (₹749) · 1L (₹2,599)',
  'google-search-ghee-bangalore', true, true,
  'A2 Gir Cow Bilona Ghee — Bangalore Delivery',
  true, true,
  '[{"brand":"Vara Organics","price":"₹1,999","labTested":"70 parameters — NABL verified","isUs":true},
    {"brand":"Two Brothers","price":"₹3,999","labTested":"Not published"},
    {"brand":"Anveshan","price":"₹3,699","labTested":"Not published"},
    {"brand":"Farmse (actual selling price)","price":"₹1,540","labTested":"Not published"}]',
  '[{"question":"Is this really from a single farm?","answer":"Yes. A family-owned farm in Kota, Rajasthan — FSSAI licensed since 2017. 29 Gir cows, 10 hectares, Bilona method only. No brokers, no aggregators."},
    {"question":"How do I know the lab report is real?","answer":"Scan the QR code on your jar. It links to the actual Jagdamba Laboratories report for your exact batch — not a generic certificate. You see the numbers, not just a claim."},
    {"question":"What if I don''t like it?","answer":"7-day no-questions return. Full refund if the ghee doesn''t taste like the best you''ve had. We mean this."},
    {"question":"How quickly does it arrive?","answer":"Orders placed before 2pm are dispatched same day. Bangalore delivery in 24–48 hours via Delhivery or Xpressbees."}]'
) on conflict (slug) do nothing;

-- ── LP 2: Meta / Instagram traffic ──
insert into public.landing_pages (
  slug, announcement, eyebrow_text, headline, headline_em, subheadline, opening_copy,
  hero_image, trust_bullets, product_slug, variant_size, cta_label, cta_button_color,
  secondary_cta_label, variant_note, campaign_id, active, noindex, meta_title,
  show_lab_card, show_pain_points, pain_points, show_story, story_heading, story_copy,
  story_attribution, show_process, process_steps, show_honest, honest_copy
) values (
  'pure-ghee-truth',
  'Lab report on every batch · Free Bangalore delivery ₹999+ · 7-day return guarantee',
  'What we found when we looked closely',
  'The ghee your grandmother knew.',
  'Proved, not claimed.',
  'NABL tested across 70 parameters. Batch-traced to a single farm. No middlemen. No shortcuts.',
  E'When we looked for genuinely pure A2 ghee — the kind made the right way, from cows you can trace, tested by a real laboratory — we couldn''t find it. Every label said pure. Nobody showed the proof.\n\nSo we built Vara.',
  null,
  array[
    'Bilona hand-churned — curd to butter to ghee',
    'NABL lab tested across 70+ parameters',
    'Direct from the farm — Kota, Rajasthan'
  ],
  'a2-gir-cow-bilona-ghee-500ml', '500ml',
  'Try Vara — ₹1,399 / 500ml', 'gold',
  'Add to Cart — ₹1,399 / 500ml',
  '250ml (₹749) also available · 1L (₹2,599)',
  'meta-pure-ghee-truth', true, true,
  'The ghee your grandmother knew. Proved, not claimed.',
  true, true,
  '[{"problem":"Machine-separated cream — not bilona churned","answer":"Bilona hand-churned — curd to butter to ghee, slowly"},
    {"problem":"Never independently tested — or tested on 5 parameters only","answer":"NABL lab tested across 70+ parameters every single batch"},
    {"problem":"Sourced through multiple middlemen","answer":"Direct from Gau Organics own farm, Kota, Rajasthan"},
    {"problem":"No way to verify any claim on the label","answer":"Scan QR on any jar — see your exact test results"}]',
  true, 'Why we started',
  E'When our daughter was born, we started looking for ghee we could completely trust. Not marketing-trust — proof-trust. A lab report. A named farm. A batch number we could check.\n\nWe found the farm in Rajasthan. We found the laboratory in Jaipur. We asked one question to every supplier: will you let us publish the test results on the jar?\n\nThe ones who said yes became Vara.',
  '— Founder, Vara Organics',
  true,
  '[{"title":"Farm, Kota, Rajasthan","body":"Gir cows. Own herd. A2 milk collected at dawn."},
    {"title":"Bilona method","body":"Curd churned into butter by hand. Slow-cooked on wood fire. No machines."},
    {"title":"NABL lab tested","body":"70+ parameters. Every batch. Released only on full clearance."},
    {"title":"Delivered to you","body":"QR on every jar. 48-hour Bangalore delivery. Your batch report, scannable."}]',
  true,
  E'We are a new brand.\n\nWe won''t pretend to have hundreds of reviews yet. What we do have is a lab report for every batch — accessible by scanning the QR on your jar. If the ghee does not taste like the best you have had, we will refund you. No questions.\n\nThat is the only promise we need to make.'
) on conflict (slug) do nothing;
