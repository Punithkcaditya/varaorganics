import type { Article } from "@/types";

/**
 * Seven launch Learn Hub articles (Learn Brief §02). Markdown bodies use `#`
 * which renders as H2 (article title is the only H1). Copy is starter content
 * owned by the DM manager — REQUIRES FINAL CONTENT before launch, but valid and
 * non-fabricated (no invented certifications or claims).
 */
export const articles: Article[] = [
  {
    id: "art-bilona",
    slug: "what-is-bilona-ghee",
    title: "What Is Bilona Ghee?",
    excerpt:
      "Bilona is the traditional hand-churned method of making ghee from cultured curd. Here's how it differs from industrial ghee — and why it matters.",
    category: "ghee",
    coverImage: "/placeholders/ghee.svg",
    bodyMarkdown: `Bilona ghee is made the slow, traditional way — from cultured curd, hand-churned into butter, then simmered into ghee.

# The bilona method, step by step

First, milk is cultured into curd. The curd is churned (the "bilona" is the churning staff) into butter. That butter is then slow-cooked over a controlled flame until it becomes golden ghee.

## Why not just separate cream?

Most commercial ghee skips curd entirely: cream is machine-separated from milk and cooked. Bilona starts from curd, which changes the aroma, texture and flavour.

# How to recognise real bilona ghee

Look for a grainy texture, a strong nutty aroma, and — most importantly — a batch-specific lab report you can verify.

You should never have to take "pure" on trust. Scan the QR on the jar and read the report for your exact batch.`,
    faqs: [
      {
        question: "Is bilona ghee better than regular ghee?",
        answer:
          "Bilona ghee is made from cultured curd and hand-churned, which many prefer for flavour and tradition. Nutritionally, quality depends on sourcing and testing regardless of method.",
      },
      {
        question: "Is bilona ghee always A2?",
        answer:
          "No. Bilona refers to the method; A2 refers to the cow breed's milk protein. Vara's bilona ghee is made from A2 Gir cow milk.",
      },
    ],
    metaTitle: "What Is Bilona Ghee? The Traditional Method Explained",
    metaDescription:
      "Bilona ghee is hand-churned from cultured curd, not machine-separated cream. Learn how it's made and how to verify it.",
    readTime: 4,
    relatedProduct: "a2-gir-cow-bilona-ghee-500ml",
    published: true,
    enableHowtoSchema: false,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "art-a2-a1",
    slug: "a2-vs-a1-ghee-difference",
    title: "A2 vs A1 Ghee: What's the Difference?",
    excerpt:
      "A2 and A1 refer to a protein in cow's milk. Here's what that means for ghee and why breed matters.",
    category: "ghee",
    coverImage: "/placeholders/ghee.svg",
    bodyMarkdown: `A2 and A1 describe the type of beta-casein protein in milk, determined by the cow's breed and genetics.

# What is A2 protein?

Indian-origin (desi) breeds like Gir typically produce milk with A2 beta-casein. Many high-yield crossbreeds produce A1 or a mix.

# Does it matter for ghee?

Ghee is almost entirely fat, so protein content is minimal in the final product. People choose A2 primarily for sourcing and breed reasons rather than a proven nutritional difference in ghee.

## What actually matters

Sourcing transparency, the making method, and independent lab testing matter more than marketing labels. Always verify the batch report.`,
    faqs: [
      {
        question: "Is A2 ghee healthier than A1 ghee?",
        answer:
          "Evidence is mixed and ghee contains very little protein. Choose based on sourcing and testing transparency rather than health claims.",
      },
      {
        question: "Which cows give A2 milk?",
        answer: "Desi breeds such as Gir commonly produce A2 beta-casein milk.",
      },
    ],
    metaTitle: "A2 vs A1 Ghee: The Difference Explained",
    metaDescription:
      "A2 and A1 are milk proteins tied to cow breed. Learn what the difference means for ghee.",
    readTime: 3,
    relatedProduct: "a2-gir-cow-bilona-ghee-500ml",
    published: true,
    enableHowtoSchema: false,
    createdAt: "2026-06-03T00:00:00Z",
    updatedAt: "2026-06-03T00:00:00Z",
  },
  {
    id: "art-lab-report",
    slug: "how-to-read-ghee-lab-report",
    title: "How to Read a Ghee Lab Report",
    excerpt:
      "A step-by-step guide to understanding the key parameters on a ghee lab report so you can verify purity yourself.",
    category: "ghee",
    coverImage: "/placeholders/ghee.svg",
    bodyMarkdown: `A lab report turns "pure" from a claim into something you can check. Here's how to read one.

# Step 1: Check the batch number

The report must reference the exact batch printed on your jar. A generic certificate for the brand is not the same as a batch-specific report.

# Step 2: Look for adulteration markers

Check that adulteration and foreign-fat markers read "Not detected" or "Negative".

# Step 3: Review the fatty-acid profile

Butyric acid and Reichert value indicate genuine dairy ghee. Values within expected ranges suggest authenticity.

# Step 4: Confirm contaminants are absent

Antibiotics and heavy metals should read "Not detected".

# Step 5: Match it to your jar

Finally, confirm the accredited lab name and that the batch matches. If anything doesn't line up, ask.`,
    faqs: [
      {
        question: "What should a ghee lab report show?",
        answer:
          "At minimum: batch number, moisture, fatty-acid markers (e.g. butyric acid), adulteration results, and contaminant screening for antibiotics and heavy metals.",
      },
      {
        question: "How do I know the report is for my jar?",
        answer: "The batch number on the report must match the batch printed on your jar.",
      },
    ],
    metaTitle: "How to Read a Ghee Lab Report (Step by Step)",
    metaDescription:
      "Learn to read a ghee lab report: batch number, adulteration markers, fatty-acid profile and contaminants.",
    readTime: 5,
    relatedProduct: "a2-gir-cow-bilona-ghee-500ml",
    published: true,
    enableHowtoSchema: true,
    createdAt: "2026-06-05T00:00:00Z",
    updatedAt: "2026-06-05T00:00:00Z",
  },
  {
    id: "art-wood-cold",
    slug: "wood-pressed-vs-cold-pressed",
    title: "Wood-Pressed vs Cold-Pressed Oil",
    excerpt:
      "The terms sound similar but describe different processes. Here's what separates wood-pressed (ghani) oil from cold-pressed.",
    category: "oils",
    coverImage: "/placeholders/sesame.svg",
    bodyMarkdown: `"Wood-pressed" and "cold-pressed" are often used interchangeably, but they aren't the same.

# Wood-pressed (ghani)

A wooden ghani turns slowly, pressing seeds with a wooden pestle. The wood and slow speed keep temperatures moderate and impart the traditional character.

# Cold-pressed

Cold-pressed usually means a steel expeller run at controlled temperatures. It's still an improvement over refined oil, but the equipment and speed differ from a ghani.

## Which should you choose?

Both are unrefined and preferable to chemically refined oil. Wood-pressed is the traditional choice; pick based on flavour and what your recipes call for.`,
    faqs: [
      {
        question: "Is wood-pressed oil better than cold-pressed?",
        answer:
          "Both are unrefined and retain nutrients. Wood-pressed uses a traditional wooden ghani; cold-pressed typically uses a steel expeller. Preference is largely about flavour and tradition.",
      },
      {
        question: "Is ghani-pressed oil healthier than refined oil?",
        answer:
          "Unrefined oils retain more natural compounds than chemically refined oils, which are stripped and deodorised.",
      },
    ],
    metaTitle: "Wood-Pressed vs Cold-Pressed Oil: The Difference",
    metaDescription:
      "Wood-pressed (ghani) and cold-pressed oils differ in method and equipment. Learn which is which.",
    readTime: 4,
    relatedProduct: "wood-pressed-sesame-oil-1l",
    published: true,
    enableHowtoSchema: false,
    createdAt: "2026-06-07T00:00:00Z",
    updatedAt: "2026-06-07T00:00:00Z",
  },
  {
    id: "art-ghani",
    slug: "what-is-ghani-pressing",
    title: "What Is Ghani Pressing?",
    excerpt:
      "The ghani (kolhu) is a traditional wooden oil press used for thousands of years. Here's how it works.",
    category: "oils",
    coverImage: "/placeholders/groundnut.svg",
    bodyMarkdown: `A ghani (also called kolhu) is a traditional wooden mortar-and-pestle press for extracting oil from seeds.

# How a ghani works

Seeds are placed in a wooden mortar. A wooden pestle, historically driven by bullocks and now often by a slow motor, crushes and presses them, releasing oil gradually.

# Why the wood matters

The slow rotation and wooden contact keep temperatures moderate compared with fast industrial extraction, helping preserve flavour and natural nutrients.

## The trade-off

Ghani pressing yields less oil per batch and takes longer — which is exactly why it produces small-batch, full-flavoured oil.`,
    faqs: [
      {
        question: "What does ghani-pressed mean?",
        answer:
          "Oil extracted using a traditional wooden ghani (kolhu) that presses seeds slowly at moderate temperature.",
      },
      {
        question: "Is ghani-pressed the same as wood-pressed?",
        answer: "Yes — the terms are used interchangeably for oil pressed on a wooden ghani.",
      },
    ],
    metaTitle: "What Is Ghani Pressing? The Traditional Oil Method",
    metaDescription:
      "The ghani or kolhu is a traditional wooden oil press. Learn how ghani (wood) pressing works.",
    readTime: 3,
    relatedProduct: "wood-pressed-groundnut-oil-1l",
    published: true,
    enableHowtoSchema: false,
    createdAt: "2026-06-09T00:00:00Z",
    updatedAt: "2026-06-09T00:00:00Z",
  },
  {
    id: "art-honey-pure",
    slug: "how-to-check-honey-is-pure",
    title: "How to Check If Honey Is Pure",
    excerpt:
      "Simple checks and what a lab report tells you about honey purity. A step-by-step guide.",
    category: "honey",
    coverImage: "/placeholders/honey.svg",
    bodyMarkdown: `Home tests are unreliable on their own — a lab report is the real answer. But here's a practical guide.

# Step 1: Expect crystallisation

Raw, unheated honey crystallises over time. Permanently clear honey may have been heated and filtered.

# Step 2: Check the label

Look for "raw" and "unheated", and avoid added glucose or sugar syrup in the ingredients.

# Step 3: Read the lab report

The reliable check is a lab report screening for added sugar (C4 sugar), moisture and HMF. Verify the batch number matches your jar.

# Step 4: Verify the batch

Scan the QR on the jar to confirm the report is for your exact batch.`,
    faqs: [
      {
        question: "Does pure honey crystallise?",
        answer:
          "Yes. Raw, unheated honey naturally crystallises over time. It's a sign it hasn't been heavily processed.",
      },
      {
        question: "Can I test honey purity at home?",
        answer:
          "Home tests (water, thumb, flame) are unreliable. A lab report screening for added sugar and moisture is the dependable method.",
      },
    ],
    metaTitle: "How to Check If Honey Is Pure (Step by Step)",
    metaDescription:
      "Learn how to check honey purity: crystallisation, labels and — most reliably — a batch lab report.",
    readTime: 4,
    relatedProduct: "raw-wild-forest-honey-500g",
    published: true,
    enableHowtoSchema: true,
    createdAt: "2026-06-11T00:00:00Z",
    updatedAt: "2026-06-11T00:00:00Z",
  },
  {
    id: "art-raw-honey",
    slug: "what-is-raw-honey",
    title: "What Is Raw Honey?",
    excerpt:
      "Raw honey is honey that hasn't been heated or finely filtered. Here's what that means and why it matters.",
    category: "honey",
    coverImage: "/placeholders/honey.svg",
    bodyMarkdown: `Raw honey is extracted and bottled without pasteurising heat or fine filtration.

# Raw vs processed honey

Processed honey is often heated and micro-filtered to stay clear and pourable. This removes pollen and can affect natural enzymes.

# What raw honey keeps

Raw honey retains natural pollen and enzymes, which is why it may set or crystallise over time.

## A note on safety

Raw honey is not recommended for infants under 12 months, in line with standard health guidance.`,
    faqs: [
      {
        question: "What does raw honey mean?",
        answer: "Honey that has not been pasteurised (heated) or finely filtered.",
      },
      {
        question: "Is raw honey better than regular honey?",
        answer:
          "Raw honey retains pollen and enzymes removed by heavy processing. Many prefer it for that reason.",
      },
    ],
    metaTitle: "What Is Raw Honey? Raw vs Processed Explained",
    metaDescription:
      "Raw honey is unheated and unfiltered, retaining natural pollen and enzymes. Learn what that means.",
    readTime: 3,
    relatedProduct: "raw-wild-forest-honey-500g",
    published: true,
    enableHowtoSchema: false,
    createdAt: "2026-06-13T00:00:00Z",
    updatedAt: "2026-06-13T00:00:00Z",
  },
];

/** Hub-level FAQs (Learn Brief §04 — FAQPage schema on the hub). */
export const hubFaqs = [
  {
    question: "How does Vara Organics prove product purity?",
    answer:
      "Every batch is independently lab-tested and each jar carries a batch-specific QR code linking to its report.",
  },
  {
    question: "What is the difference between bilona ghee and regular ghee?",
    answer:
      "Bilona ghee is hand-churned from cultured curd; regular ghee is usually machine-separated from cream.",
  },
  {
    question: "Is wood-pressed oil the same as cold-pressed?",
    answer:
      "Not exactly — wood-pressed uses a traditional wooden ghani, while cold-pressed usually means a steel expeller. Both are unrefined.",
  },
  {
    question: "Why does raw honey crystallise?",
    answer: "Crystallisation is natural for raw, unheated honey and is a sign of minimal processing.",
  },
];
