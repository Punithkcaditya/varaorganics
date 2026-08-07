import Link from "next/link";
import { footerNav } from "@/config/nav";
import { site } from "@/config/site";

/** Deep-navy footer, 4-column → 2-column on mobile (design). */
export function Footer() {
  const fssai = site.fssaiLicence
    ? `FSSAI Lic. No. ${site.fssaiLicence}`
    : "FSSAI licence — application pending";
  return (
    <footer className="bg-navy-deep px-6 pb-8 pt-16 text-ivory/50 md:px-[8%]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <span className="mb-3 block font-serif text-2xl font-semibold text-ivory">
              {site.name}
            </span>
            <p className="mb-5 max-w-xs text-[13px] font-light leading-relaxed text-ivory/45">
              {site.description}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
              {fssai} · {site.legalName} · Bengaluru
            </p>
          </div>
          {footerNav.map((col) => (
            <div key={col.title}>
              <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-lt">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-light text-ivory/40 transition-colors hover:text-gold-lt"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-[11.5px] font-light">
          <span>
            © {new Date().getFullYear()} {site.name} · By {site.legalName}. All rights reserved.
          </span>
          <span className="text-ivory/30">{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
