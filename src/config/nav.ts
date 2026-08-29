import { LAB_REPORTS_PATH } from "@/config/routes";

export interface NavLink {
  label: string;
  href: string;
}

/** Primary navigation (Dev Kit design: Shop / Our Story / Lab Reports / B2B). */
export const primaryNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Combos", href: "/combos" },
  { label: "Our Story", href: "/our-story" },
  { label: "Lab Reports", href: LAB_REPORTS_PATH },
  { label: "Learn", href: "/learn" },
  { label: "B2B / Export", href: "/b2b" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "A2 Gir Cow Ghee", href: "/ghee/a2-gir-cow-bilona-ghee-500ml" },
      { label: "Wild Forest Honey", href: "/honey/raw-wild-forest-honey-500g" },
      { label: "Wood Pressed Oils", href: "/shop/oils" },
      { label: "Combos", href: "/combos" },
      { label: "Bundles", href: "/bundles/wellness-starter" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Lab Reports", href: LAB_REPORTS_PATH },
      { label: "Our Story", href: "/our-story" },
      { label: "Learn", href: "/learn" },
      { label: "B2B / Export", href: "/b2b" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];
