import type { FaqItem } from "@/types";

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "about-vara-organics",
    title: "What is Vara Organics",
    items: [
      {
        question: "What is Vara Organics?",
        answer:
          "Vara Organics is a direct-to-consumer food brand by Varixa Global Ventures Private Limited, Bengaluru. We source A2 Gir Cow Bilona Ghee, Raw Wild Forest Honey, and traditional Wood Pressed Oils from family-owned farms across India and deliver them to your kitchen. Every product is independently tested at a NABL-certified laboratory before it ships.",
      },
      {
        question: "Where is Vara Organics based?",
        answer:
          "We are based in Bengaluru, Karnataka. Our ghee and honey are sourced from Kota, Rajasthan. Our wood pressed oils come from a traditional wooden ghani facility in Bengaluru.",
      },
      {
        question: "Who started Vara Organics and why?",
        answer:
          "I started Vara Organics because I could not find what I was looking for during my pregnancy. When I was expecting my daughter, I became very careful about everything I ate. Ghee was the one food every doctor, every elder, every article agreed on — good ghee, made the right way, is genuinely nourishing. So I went looking for it. What I found was labels: Pure A2, Bilona method, Farm fresh. All of it was printed with confidence, but none of it was verifiable. I asked brands for lab reports. Most did not have them. I asked where the cows were. Nobody could tell me. I visited stores in Bengaluru, ordered online, and read every ingredient panel — but I still could not answer the most basic question a pregnant woman should be able to answer about the food she is eating: is what is on this label actually in this jar? That question stayed with me after my daughter was born. I started tracing the supply chain myself. I found farms and a government-approved laboratory in Jaipur that tests across 70 parameters. I asked one question to every supplier — will you let me publish the lab report on the jar? The ones who said yes became Vara. Vara means gift in Sanskrit. It started as a gift to my daughter — the certainty that what she was eating was exactly what the label said. It became a brand because I was not the only mother asking the same question.",
      },
      {
        question: "What does Vara mean?",
        answer:
          "Vara is a Sanskrit word meaning gift or boon. It was chosen because the brand started as a gift — a promise to one child that her food was pure. It became a brand because many families were asking the same question.",
      },
      {
        question: "Is Vara Organics a registered company?",
        answer:
          "Yes. Vara Organics is the consumer brand of Varixa Global Ventures Private Limited — a registered private limited company in Karnataka. We hold FSSAI Central Licence No. 11226998000505, valid until 02 August 2027.",
      },
    ],
  },
  {
    id: "why-vara",
    title: "Why Vara",
    items: [
      {
        question: "Why should I choose Vara over other A2 ghee brands?",
        answer:
          "Every A2 ghee brand makes similar claims — bilona method, farm sourced, pure. Vara shows you the actual lab report for your product. Scan the QR code on any Vara jar to see the Jagdamba Laboratories report, including moisture content, butyric acid levels, antibiotic test results, heavy metal levels, and adulteration markers.",
      },
      {
        question: "How is Vara different from other A2 ghee brands?",
        answer:
          "The established brands have better recognition than us. We are new and we acknowledge that openly. The difference is one thing — verifiability. Most brands say lab tested, claim the bilona method, and say A2 Gir cow. We say these things too, but we also show you the actual numbers. Every Vara product carries a QR code on the label. Scan it to open the latest laboratory test report for that product — moisture content, butyric acid levels, antibiotic test results, heavy metal levels, and adulteration markers — tested by Jagdamba Laboratories, Jaipur, a Government-approved ISO 9001:2015 and GLP-certified laboratory. Every production batch is tested before it reaches you. When a new batch report is available, we update the page the QR links to. Real data, visible to anyone before or after they buy. If purity proof matters to you, scan the QR and decide for yourself.",
      },
      {
        question: "Why is Vara more expensive than regular supermarket ghee?",
        answer:
          "Three reasons. First, the bilona method: hand-churning curd into butter and slow-cooking on wood fire takes significantly more time and labour than machine-separated cream processing. Second, independent laboratory testing: every batch is tested across 70+ parameters at Jagdamba Laboratories before it ships. Third, direct sourcing: we work directly with the farm with no brokers or aggregators, and the farm charges fairly for genuine quality.",
      },
      {
        question: "Is Vara certified organic?",
        answer:
          "Our ghee and honey supplier — a family farm in Kota, Rajasthan — is currently in organic conversion under India's National Programme for Organic Production Standards (NPOP), certified by the Rajasthan State Organic Certification Agency (RSOCA). In-conversion means the farm is transitioning to certified organic but has not yet received final certification. We do not claim or print the words Certified Organic on our labels or website because that would be inaccurate.",
      },
      {
        question: "Why should I trust a new brand with no reviews yet?",
        answer:
          "You should not trust us just because we say so. Trust us because you can verify us. Scan the QR code on your jar to see the laboratory report, and check our FSSAI licence at foscos.fssai.gov.in using number 11226998000505. We are new, and we will not pretend otherwise. What we have is verified supply and published lab reports. Judge us on that.",
      },
    ],
  },
  {
    id: "how-vara-works",
    title: "How Vara works",
    items: [
      {
        question: "How do I verify my product?",
        answer:
          "Every Vara product carries a QR code on the label. Scan it with your phone camera — no app is needed. It opens the verify page for that product at varaorganic.com/verify, where you can see the latest Jagdamba Laboratories test report, including all tested parameters and a link to download the full PDF report.",
      },
      {
        question: "What does the QR code on the jar link to?",
        answer:
          "The QR code links to the verify page for that product — varaorganic.com/verify/ghee, for example. This page shows the most recent Jagdamba Laboratories batch report, including moisture content, butyric acid, antibiotic test results, heavy metal levels, adulteration markers, and fatty acid profile. The page is updated every time a new batch report is available from our supplier.",
      },
      {
        question: "How often is the lab report updated?",
        answer:
          "Every time we receive a new production batch from our suppliers — which typically happens every 4 to 8 weeks — we update the verify page with the latest Jagdamba Laboratories report. The date of the last update is shown on the verify page so you always know how current the data is.",
      },
      {
        question: "What laboratory tests your products?",
        answer:
          "Jagdamba Laboratories (OPC) Pvt. Ltd., Jaipur — a Government-approved, ISO 9001:2015 and GLP-certified laboratory. The laboratory holds NABL accreditation TC-11837 and tests under FSSR 2011 standards.",
      },
      {
        question: "How do I place an order?",
        answer:
          "Go to varaorganic.com, choose your product and size, add it to your cart, and proceed to checkout. We accept UPI, credit and debit cards, net banking, and Cash on Delivery. Orders are dispatched within 24 to 48 hours of confirmation.",
      },
      {
        question: "How do I track my order?",
        answer:
          "You will receive a WhatsApp message and email with your tracking number as soon as your order is dispatched. Click the link to track it in real time. You can also track it at varaorganic.com/order/[your order ID].",
      },
    ],
  },
  {
    id: "a2-gir-cow-bilona-ghee",
    title: "A2 Gir Cow Bilona Ghee",
    items: [
      {
        question: "What is bilona ghee?",
        answer:
          "Bilona ghee is made by the traditional method — curd is first churned by hand into butter using a wooden churner called a bilona, and this butter is then slow-cooked on wood fire to produce ghee. This is the method described in Ayurvedic texts. It is fundamentally different from commercial ghee, where cream is mechanically separated from milk and then clarified — a faster, cheaper method that skips the curd and churning steps entirely.",
      },
      {
        question: "What is A2 milk and why does it matter?",
        answer:
          "All cow milk contains beta-casein protein. A2 cows — including native Indian breeds such as Gir, Sahiwal, and Rathi — produce milk with only A2 beta-casein. Most commercial dairy cows in India today are crossbred Holstein-Friesian varieties that produce A1 beta-casein. Research suggests A2 milk may be easier to digest for some people. Our ghee is made from A2 milk from Gir, Sahiwal, and Marwadi cows raised on the farm in Kota, Rajasthan.",
      },
      {
        question: "What does butyric acid content of 3.82% mean?",
        answer:
          "Butyric acid (C4:0) is a short-chain fatty acid found naturally in ghee. It is an important marker used when assessing ghee quality. Our current batch report shows 3.82%. Scan the QR on the jar to review the complete report and the latest verified batch values.",
      },
      {
        question: "What does moisture content of 0.09% mean?",
        answer:
          "FSSAI standards require ghee moisture to be below 0.5%. A result of 0.09% is well below that limit. Lower moisture supports longer shelf life and indicates that the ghee was cooked without excess water remaining. Scan the QR on your jar for the latest batch value.",
      },
      {
        question: "Why does Vara ghee smell different from supermarket ghee?",
        answer:
          "Genuine bilona ghee made from A2 curd has a stronger, nuttier, more complex aroma than commercial ghee. The bilona process and wood-fire cooking preserve flavour compounds differently from machine processing. A stronger aroma is not necessarily a defect; it is a natural characteristic of traditionally made ghee.",
      },
      {
        question: "How should I store ghee?",
        answer:
          "Store it in a cool, dry place away from direct sunlight. Ghee does not need refrigeration and should ideally be kept at room temperature. Always use a dry spoon, because introducing moisture shortens shelf life. Properly stored Vara ghee has a shelf life of 12 months from the manufacturing date.",
      },
      {
        question: "Why is my ghee granular or semi-solid?",
        answer:
          "Ghee naturally transitions between liquid and solid states depending on temperature. In cooler weather or air-conditioned rooms it becomes granular or fully solid; in warm weather it becomes liquid. This is normal and does not indicate a quality issue. Gently warm the jar in warm water if you prefer liquid ghee.",
      },
      {
        question: "Is Vara ghee suitable during pregnancy?",
        answer:
          "This question is what started Vara. Our founder could not find ghee she could trust during her pregnancy, so she built this brand. A2 bilona ghee is a traditional food, but individual dietary needs differ. Always consult your doctor for specific dietary guidance during pregnancy.",
      },
      {
        question: "Is Vara ghee suitable for lactose-intolerant people?",
        answer:
          "Ghee is made by clarifying butter — removing milk solids and water — leaving behind almost pure fat. The clarification process removes most lactose and casein, and many people who are lactose intolerant can tolerate ghee. Individual tolerance varies, so consult your doctor before use if you are severely lactose intolerant.",
      },
    ],
  },
  {
    id: "raw-wild-forest-honey",
    title: "Raw Wild Forest Honey",
    items: [
      {
        question: "What is raw honey and how is it different from regular honey?",
        answer:
          "Raw honey is collected from natural forest beehives and is not heated above ambient temperature or fine-filtered. Regular commercial honey may be heated for bottling, fine-filtered to remove pollen and wax, or blended. Our honey is unheated, minimally strained to remove debris, and bottled as close to its natural state as possible.",
      },
      {
        question: "Why does my honey look dark and thick?",
        answer:
          "Natural raw forest honey is often darker and thicker than commercial honey because it is unfiltered and unheated. The colour and thickness vary with the flowers the bees feed on. Forest honey from diverse wildflowers is typically darker than single-source honey, and this natural variation does not indicate lower quality.",
      },
      {
        question: "Why is my honey crystallised?",
        answer:
          "Crystallisation is a natural process in raw honey as glucose separates from water over time. To re-liquefy it, place the jar in warm water below 40°C and stir gently. Never microwave honey.",
      },
      {
        question: "Is this honey suitable for infants?",
        answer:
          "No. Honey of any kind — raw or processed — should not be given to children under 12 months old because of the risk of infant botulism. This recommendation applies regardless of the honey's quality or source.",
      },
      {
        question: "Does the honey contain added sugar?",
        answer:
          "No. Our honey contains only wild forest honey, with no added sugar, glucose syrup, corn syrup, preservatives, or additives. The laboratory report linked from the jar's QR code includes Brix and HMF values used when assessing honey quality and possible adulteration.",
      },
    ],
  },
  {
    id: "wood-pressed-oils",
    title: "Wood Pressed Oils",
    items: [
      {
        question: "What is wood pressed oil?",
        answer:
          "Wood pressed oil — also called wooden ghani oil — is extracted by slowly crushing oilseeds in a traditional wooden mortar and pestle. The process keeps extraction temperatures relatively low and preserves the oilseed's natural flavour, colour, and nutritional compounds.",
      },
      {
        question: "Why does wood pressed oil look darker than refined oil?",
        answer:
          "Wood pressed oil is not refined, bleached, or deodorised. Those industrial processes remove colour and aroma to produce a pale, neutral-smelling product. The darker colour and stronger aroma of wood pressed oil are natural characteristics of an unrefined product, not quality problems.",
      },
      {
        question: "Why does my wood pressed oil have sediment?",
        answer:
          "Wood pressed oil may have natural sediment from the oilseed. This is normal and safe. It indicates that the oil has not been filtered to the degree that removes all natural compounds. Shake gently before use, or allow the sediment to settle and pour the clear oil.",
      },
      {
        question: "Is wood pressed sesame oil the same as gingelly oil?",
        answer:
          "Yes. Sesame oil, til oil, and gingelly oil all refer to oil from sesame seeds. The name varies by region. Our wood pressed sesame oil is the same type of traditional gingelly oil used in South Indian cooking.",
      },
      {
        question: "Can I use these oils for high-heat cooking?",
        answer:
          "Wood pressed groundnut oil has a reasonably high smoke point and is suitable for most cooking, including stir-frying and shallow frying. Wood pressed sesame oil has a lower smoke point and is best used for tempering, dressings, and light cooking. Our wood pressed oils are best suited to everyday home cooking at moderate heat.",
      },
    ],
  },
  {
    id: "orders-and-delivery",
    title: "Orders and Delivery",
    items: [
      {
        question: "Where do you deliver?",
        answer:
          "We currently deliver across India. Bengaluru deliveries are our primary focus, with free delivery on orders above ₹999. We also ship internationally to the UAE — contact hello@varaorganic.com for export orders.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Bengaluru: 24 to 48 hours from dispatch. Rest of Karnataka: 2 to 3 days. Rest of India: 3 to 5 days. Orders placed before 2pm are dispatched the same day.",
      },
      {
        question: "Is there a minimum order value?",
        answer:
          "There is no minimum order value for individual products. Combo orders and wholesale orders have minimum values as shown on their relevant pages.",
      },
      {
        question: "What happens if I am not available when delivery is attempted?",
        answer:
          "The courier may make up to three delivery attempts on different days. You should receive a message or call from the courier before each attempt. If all attempts are unsuccessful, the order is returned to us.",
      },
      {
        question: "What if I am not reachable and the order is returned to Vara?",
        answer:
          "If the courier cannot reach you after its delivery attempts, the order is returned to our Bengaluru facility. We will contact you by WhatsApp and email after receiving the return. We can redeliver to the same or a different address at a redelivery charge of ₹70 for Bengaluru orders, or refund the product value minus the original and return shipping costs. Prepaid refunds are processed within 5 to 7 business days to the original payment method. COD orders for which payment was not collected are cancelled and restocked.",
      },
      {
        question: "What if I refuse the order at the door?",
        answer:
          "If you refuse a prepaid order at delivery, it is returned to us and treated as a standard return. The refund is processed minus the original and return shipping costs, approximately ₹120 to ₹150. Please contact hello@varaorganic.com before refusing delivery so we can try to resolve your concern directly.",
      },
      {
        question: "My order shows delivered but I have not received it. What do I do?",
        answer:
          "Contact us immediately at hello@varaorganic.com with your order number. We investigate these cases with the courier within 24 hours. If the delivery is confirmed as lost or falsely marked delivered, we will reship the order or refund it in full, according to your preference.",
      },
      {
        question: "Can I change my delivery address after ordering?",
        answer:
          "Yes, if the order has not yet been dispatched. Contact us by email within two hours of placing the order. Once the order has been dispatched and is with the courier, we cannot change the delivery address.",
      },
    ],
  },
  {
    id: "returns-and-replacements",
    title: "Returns and Replacements",
    items: [
      {
        question: "What is Vara Organics' return policy?",
        answer:
          "We accept returns for damaged packaging on arrival, signs of spoilage or fungal growth, an unusual odour not characteristic of the product, or any condition that makes the product unfit for consumption. We do not accept returns for personal preferences such as taste, colour, aroma, or texture. Traditional foods such as bilona ghee, raw honey, and wood pressed oils naturally vary in colour, aroma, and texture. If your product meets an accepted return condition, email hello@varaorganic.com within 24 hours of delivery. Our team will verify the issue, arrange a return pickup, and dispatch a replacement of the same product after the return is received and inspected.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Email hello@varaorganic.com within 24 hours of delivery. Include your order number, a clear photograph of the issue, and a brief description of what you received. If your return is accepted, we will arrange pickup from your address and dispatch a replacement product.",
      },
      {
        question: "What counts as a valid return reason?",
        answer:
          "Valid reasons include damaged packaging, a broken seal, visible fungal growth, an unusual spoilage odour, a leaking or cracked jar, or another condition that makes the product genuinely unfit for consumption. Personal taste preference, natural colour variation, honey crystallisation, ghee becoming more solid or liquid with temperature, a stronger natural aroma, or oil darker than refined oil are not valid return reasons.",
      },
      {
        question: "What if the product arrived damaged?",
        answer:
          "Take a clear photograph of the damage immediately and email hello@varaorganic.com within 24 hours of delivery with your order number and photos. If the damage is confirmed, we will arrange return pickup and dispatch a replacement of the same product.",
      },
      {
        question: "What if I believe the product is adulterated or impure?",
        answer:
          "Contact us immediately at hello@varaorganic.com with your order number. We will share the complete Jagdamba Laboratories report for the relevant batch. You are also welcome to send a sample to a NABL-accredited laboratory of your choice for independent testing. If an independent test finds adulteration or a quality issue that contradicts our report, we will replace your order and cover your testing cost.",
      },
      {
        question: "Can I return ghee if I do not like the taste?",
        answer:
          "No. We do not accept returns for taste or personal preference. Bilona ghee, raw forest honey, and wood pressed oils naturally differ in flavour, aroma, colour, and texture from commercial processed products. We encourage you to read the product descriptions carefully and begin with a smaller size if you are trying a traditional product for the first time.",
      },
      {
        question: "How long does a replacement take?",
        answer:
          "Once your return request is approved and pickup is arranged, we dispatch the replacement within 48 hours of receiving the returned item. You will receive a notification with the new tracking number.",
      },
    ],
  },
  {
    id: "payments-and-pricing",
    title: "Payments and Pricing",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept UPI, credit cards, debit cards, net banking, and Cash on Delivery. Online payments are processed through Razorpay, a secure payment gateway.",
      },
      {
        question: "Is Cash on Delivery available?",
        answer:
          "Yes. Cash on Delivery is available for orders across India with no additional COD fee.",
      },
      {
        question: "Is my payment information safe?",
        answer:
          "Yes. We do not store card or payment information on our servers. Payments are processed by Razorpay. We receive confirmation that a payment was successful, but we do not see or store your card details.",
      },
      {
        question: "Why does the price differ from what I saw last week?",
        answer:
          "We review pricing periodically based on raw material costs and market conditions. The price displayed on the website when you place the order is the price you pay. We do not change prices on orders already placed.",
      },
      {
        question: "Do you offer discounts or coupon codes?",
        answer:
          "We occasionally offer first-order discounts and seasonal offers. Subscribe to our updates to be notified. We do not run constant discount campaigns; our goal is straightforward pricing without inflated MRPs or misleading discounts.",
      },
    ],
  },
  {
    id: "wholesale-b2b-and-export",
    title: "Wholesale, B2B and Export",
    items: [
      {
        question: "Do you supply to hotels and restaurants?",
        answer:
          "Yes. We supply to HoReCa customers in Bengaluru with special pricing for regular orders. The minimum order is ₹15,000. Contact hello@varaorganic.com with your requirements.",
      },
      {
        question: "Do you offer wholesale pricing?",
        answer:
          "Yes. Wholesale pricing is available for retailers, distributors, and bulk buyers. The minimum order is ₹25,000, with price slabs from 10 units to 100+ units. Full laboratory documentation is provided with every wholesale order.",
      },
      {
        question: "Do you export?",
        answer:
          "Yes. Varixa Global Ventures Private Limited holds a Central FSSAI licence (No. 11226998000505) covering trade, retail, and export. We currently export to the UAE, and EU documentation is in progress. Contact hello@varaorganic.com for export enquiries.",
      },
      {
        question: "Can you do private-label or white-label products?",
        answer:
          "Yes, for orders above 500 units. Contact hello@varaorganic.com for custom label requirements and pricing.",
      },
    ],
  },
  {
    id: "sustainability-and-sourcing",
    title: "Sustainability and Sourcing",
    items: [
      {
        question: "Are your products plastic-free?",
        answer:
          "Ghee and honey are packed in glass jars with metal lids, and the outer packaging is recyclable cardboard. We are working towards eliminating all single-use plastic from our packaging by the end of 2026.",
      },
      {
        question: "Are your cows treated humanely?",
        answer:
          "Our ghee and honey supplier operates a family farm in Kota, Rajasthan, with Gir, Sahiwal, and Marwadi cows raised on 10 hectares of land. We have personally verified the farm. The animals are stall-fed and pasture-fed, with no artificial hormones or antibiotics; antibiotic screening is included in batch testing.",
      },
      {
        question: "Do you use child labour or exploit farm workers?",
        answer:
          "No. We work directly with a family-owned farm and a traditional wooden ghani facility. Both are small operations where the owners are directly involved in production. We have visited both facilities and are confident in their working conditions.",
      },
    ],
  },
  {
    id: "other-questions",
    title: "Other Questions",
    items: [
      {
        question: "I have a health condition. Is Vara ghee safe for me?",
        answer:
          "We are a food brand, not a healthcare provider, and cannot give medical advice. Vara ghee is a traditional food product. If you have a health condition such as heart disease, high cholesterol, or diabetes, please consult your doctor about dietary fat intake before adding ghee to your diet.",
      },
      {
        question: "How do I contact Vara Organics?",
        answer:
          "Email hello@varaorganic.com or use the form on our Contact page. We aim to respond within four hours during business hours, 9am to 7pm IST, Monday to Saturday.",
      },
      {
        question: "I found a problem with your website or QR code. What do I do?",
        answer:
          "Please contact us at hello@varaorganic.com with the details. Website and QR code issues are central to our brand promise, and we aim to fix technical issues within 24 hours.",
      },
      {
        question: "Can I visit your facility or farm?",
        answer:
          "The farm is in Kota, Rajasthan and is not open for casual visits. The wooden ghani oil facility is in Bengaluru. We are exploring a future farm-visit programme for customers who want to see where their food comes from. Email hello@varaorganic.com if you would like to join the waitlist.",
      },
    ],
  },
];

export const siteFaqs: FaqItem[] = faqGroups.flatMap((group) => group.items);
