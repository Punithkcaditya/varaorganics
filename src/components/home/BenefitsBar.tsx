import { Container } from "@/components/ui/layout-primitives";
import {
  CreditCardIcon,
  FlaskIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/Icons";

const benefits = [
  { Icon: CreditCardIcon, title: "Secure Payments", sub: "UPI, cards, net banking & COD" },
  // Website Changes §02: replaced generic "Here to Help".
  { Icon: FlaskIcon, title: "70-Parameter Tested", sub: "NABL accredited lab, every batch" },
  { Icon: TagIcon, title: "Honest Pricing", sub: "Direct from source, no middlemen" },
  { Icon: TruckIcon, title: "Free Bengaluru Delivery", sub: "On orders over ₹999" },
];

/** Benefits strip below the promo banner (design reference). */
export function BenefitsBar() {
  return (
    <section aria-label="Why shop with us" className="border-y border-navy/10 bg-white">
      <Container>
        <ul className="grid gap-x-6 gap-y-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ Icon, title, sub }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/10 text-amber">
                <Icon width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{title}</p>
                <p className="text-xs font-light text-navy/55">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
