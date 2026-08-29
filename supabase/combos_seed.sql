-- Vara Organics — combos seed. Run AFTER 0006_combos.sql (and the base seed).
-- Idempotent via stable slugs/SKUs. Rows start unpublished so the brand owner
-- can review the names, prices and contents in Admin before making them live.
--
-- Creates, per combo: a backing is_bundle product + one variant priced at the
-- combo price (so checkout charges correctly), then the combos metadata row.

-- ── backing bundle products (is_bundle → never shown in /shop) ──
insert into public.products (slug, product_name, category, route_prefix, short_description, long_description, active, featured, is_bundle)
values
  ('mane-ruchi-combo','Mane Ruchi (Starter Combo)','ghee','ghee','Two things every Indian kitchen needs. Both pure. Both proved.','## Mane Ruchi (Starter Combo)',true,false,true),
  ('belagge-chinna-combo','Belagge Chinna (Morning Ritual)','ghee','ghee','Start your morning the way your grandmother did.','## Belagge Chinna (Morning Ritual)',true,false,true),
  ('mane-adige-set-combo','Mane Adige Set (Complete Kitchen)','ghee','ghee','Three oils. Three traditional methods. Three lab reports.','## Mane Adige Set (Complete Kitchen)',true,false,true),
  ('mane-tumba-arogya-combo','Mane Tumba Arogya (Family Wellness)','ghee','ghee','For the family that cooks together.','## Mane Tumba Arogya (Family Wellness)',true,false,true),
  ('ajji-kai-ruchi-combo','Ajji Kai Ruchi (Grandmothers Kitchen)','ghee','ghee','The ghee she made. The oils she pressed. The honey she trusted.','## Ajji Kai Ruchi (Grandmothers Kitchen)',true,false,true),
  ('ammana-madilu-combo','Ammana Madilu (New Mother)','ghee','ghee','For the new mother who deserves only the purest.','## Ammana Madilu (New Mother)',true,false,true),
  ('namma-nadina-ruchi-combo','Namma Nadina Ruchi (Export Special)','ghee','ghee','Two of India''s finest traditional foods. NABL certified.','## Namma Nadina Ruchi (Export Special)',true,false,true)
on conflict (slug) do update set
  product_name = excluded.product_name,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  active = excluded.active,
  is_bundle = excluded.is_bundle;

-- ── backing variants (priced at combo price) ──
insert into public.product_variants (product_id, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
select p.id, v.size, v.sku, v.price, v.compare_at_price, v.stock, v.unit_label, v.unit_base, v.unit_type, v.route_slug, v.active, v.position
from public.products p
join (values
  ('mane-ruchi-combo','Combo','VARA-COMBO-1',1299,1548,999,'combo',1,'ml',null,true,0),
  ('belagge-chinna-combo','Combo','VARA-COMBO-2',1549,1848,999,'combo',1,'ml',null,true,0),
  ('mane-adige-set-combo','Combo','VARA-COMBO-3',2499,2897,999,'combo',1,'ml',null,true,0),
  ('mane-tumba-arogya-combo','Combo','VARA-COMBO-4',3199,3747,999,'combo',1,'ml',null,true,0),
  ('ajji-kai-ruchi-combo','Combo','VARA-COMBO-5',3599,4246,999,'combo',1,'ml',null,true,0),
  ('ammana-madilu-combo','Combo','VARA-COMBO-6',1599,1848,999,'combo',1,'ml',null,true,0),
  ('namma-nadina-ruchi-combo','Combo','VARA-COMBO-7',2799,3398,999,'combo',1,'ml',null,true,0)
) as v(pslug, size, sku, price, compare_at_price, stock, unit_label, unit_base, unit_type, route_slug, active, position)
  on p.slug = v.pslug
on conflict (sku) do update set
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  active = excluded.active;

-- ── combos metadata rows ──
insert into public.combos
  (slug, name_english, name_kannada, name_hindi, name_telugu, name_tamil, tagline, contents, mrp_individual, combo_price, badge_text, badge_color, cta_text, is_gift_wrapped, is_export, checkout_sku, sort_order, published)
values
  ('mane-ruchi','Mane Ruchi (Starter Combo)','ಮನೆ ರುಚಿ','रसोई किट','వంట జత','சமையல் இணை',
   'Two things every Indian kitchen needs. Both pure. Both proved.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"500ml","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"250g","qty":1}]',
   1548,1299,null,'amber','ADD TO CART',false,false,'VARA-COMBO-1',1,false),

  ('belagge-chinna','Belagge Chinna (Morning Ritual)','ಬೆಳಗ್ಗೆ ಚಿನ್ನ','सुबह की थाली','ఉదయం రుచి','காலை அமுது',
   'Start your morning the way your grandmother did. Warm ghee on rotis. Raw honey in warm water.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"500ml","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"500g","qty":1}]',
   1848,1549,null,'amber','ADD TO CART',false,false,'VARA-COMBO-2',2,false),

  ('mane-adige-set','Mane Adige Set (Complete Kitchen)','ಮನೆ ಅಡಿಗೆ ಸೆಟ್','रसोई का खजाना','వంట నిధి','சமையல் கஜானா',
   'Three oils. Three traditional methods. Three lab reports. One kitchen sorted.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"500ml","qty":1},{"product_slug":"wood-pressed-sesame-oil","product_name":"Wood Pressed Sesame Oil","variant":"1L","qty":1},{"product_slug":"wood-pressed-groundnut-oil","product_name":"Wood Pressed Groundnut Oil","variant":"1L","qty":1}]',
   2897,2499,'MOST ORDERED','amber','ADD TO CART',false,false,'VARA-COMBO-3',3,false),

  ('mane-tumba-arogya','Mane Tumba Arogya (Family Wellness)','ಮನೆ ತುಂಬ ಆರೋಗ್ಯ','परिवार की थाली','కుటుంబ పోషణ','குடும்ப வளம்',
   'For the family that cooks together. Everything pure. Everything verified.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"1L","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"500g","qty":1},{"product_slug":"wood-pressed-sesame-oil","product_name":"Wood Pressed Sesame Oil","variant":"1L","qty":1}]',
   3747,3199,null,'amber','ADD TO CART',false,false,'VARA-COMBO-4',4,false),

  ('ajji-kai-ruchi','Ajji Kai Ruchi (Grandmothers Kitchen)','ಅಜ್ಜಿ ಕೈ ರುಚಿ','नानी की रसोई','అమ్మమ్మ వంట','பாட்டி சமையல்',
   'The ghee she made. The oils she pressed. The honey she trusted. All four. All proved.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"1L","qty":1},{"product_slug":"wood-pressed-sesame-oil","product_name":"Wood Pressed Sesame Oil","variant":"1L","qty":1},{"product_slug":"wood-pressed-groundnut-oil","product_name":"Wood Pressed Groundnut Oil","variant":"1L","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"250g","qty":1}]',
   4246,3599,'BEST VALUE','green','ADD TO CART',false,false,'VARA-COMBO-5',5,false),

  ('ammana-madilu','Ammana Madilu (New Mother)','ಅಮ್ಮನ ಮಡಿಲು','माँ की देखभाल','అమ్మ ప్రేమ','அம்மா அன்பு',
   'For the new mother who deserves only the purest. Gift-wrapped with love.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"500ml","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"500g","qty":1},{"product_slug":"gift-wrap","product_name":"Gift wrapping","variant":"1","qty":1},{"product_slug":"gift-card","product_name":"Handwritten card","variant":"1","qty":1}]',
   1848,1599,'GIFT READY','gold','GIFT THIS COMBO',true,false,'VARA-COMBO-6',6,false),

  ('namma-nadina-ruchi','Namma Nadina Ruchi (Export Special)','ನಮ್ಮ ನಾಡಿನ ರುಚಿ','भारत का उपहार','భారత బహుమతి','இந்தியாவின் பரிசு',
   'Two of India''s finest traditional foods. NABL certified. Gift-ready. Perfect for family abroad.',
   '[{"product_slug":"a2-gir-cow-bilona-ghee","product_name":"A2 Gir Cow Bilona Ghee","variant":"1L","qty":1},{"product_slug":"raw-wild-forest-honey","product_name":"Raw Wild Forest Honey","variant":"1kg","qty":1}]',
   3398,2799,'SHIPS INTERNATIONALLY','blue','ORDER NOW',false,true,'VARA-COMBO-7',7,false)
on conflict (slug) do update set
  name_english = excluded.name_english,
  name_kannada = excluded.name_kannada,
  name_hindi = excluded.name_hindi,
  name_telugu = excluded.name_telugu,
  name_tamil = excluded.name_tamil,
  tagline = excluded.tagline,
  contents = excluded.contents,
  mrp_individual = excluded.mrp_individual,
  combo_price = excluded.combo_price,
  badge_text = excluded.badge_text,
  badge_color = excluded.badge_color,
  cta_text = excluded.cta_text,
  is_gift_wrapped = excluded.is_gift_wrapped,
  is_export = excluded.is_export,
  checkout_sku = excluded.checkout_sku,
  sort_order = excluded.sort_order;
