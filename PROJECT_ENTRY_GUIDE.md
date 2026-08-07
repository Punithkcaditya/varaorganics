# Vara Organics: Main File and Application Start

## Is there one main file?

This project does not have a traditional `main.ts` or `index.js` file.
It uses **Next.js App Router**, where folders and special filenames inside
`src/app` define the application.

For the public homepage, the important rendering chain is:

```text
src/app/layout.tsx
  └── src/app/(store)/layout.tsx
        └── src/app/(store)/page.tsx
```

- `src/app/layout.tsx` is the required root layout for the entire application.
- `src/app/(store)/layout.tsx` adds the common storefront header and footer.
- `src/app/(store)/page.tsx` is the homepage shown at `/`.

The parentheses in `(store)` make it a **route group**. They organize files
without adding `/store` to the URL.

## Starting file 1: `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { cormorant, jost } from "@/config/fonts";
import { site } from "@/config/site";
import { SITE_URL } from "@/lib/validation/env";
import { AnalyticsConsent } from "@/components/layout/AnalyticsConsent";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
```

### What this file does

This layout wraps every page, including the storefront, admin panel, checkout,
and product pages. Next.js requires the root layout to provide the `<html>` and
`<body>` elements.

### Concepts used

#### 1. Root layout

`layout.tsx` is a special Next.js filename. The root layout remains around the
current page when users navigate to another route.

#### 2. `children`

`children` is the page or nested layout that Next.js places inside this layout:

```tsx
{children}
```

For the homepage, `children` eventually contains the storefront layout and
homepage.

#### 3. Server Component

There is no `"use client"` directive, so this is a **React Server Component**.
It is rendered on the server and does not send unnecessary layout JavaScript to
the browser.

Interactive Client Components can still be included inside it. For example,
`AnalyticsConsent` handles browser-side consent behavior.

#### 4. Global CSS

```tsx
import "./globals.css";
```

This loads the global Tailwind styles, colors, typography, resets, and shared
utility rules for the complete application.

#### 5. Font configuration

```tsx
className={`${cormorant.variable} ${jost.variable} h-full`}
```

The project loads Cormorant Garamond and Jost through the font configuration.
Their CSS variables become available to the application.

#### 6. Metadata and SEO

The exported `metadata` object defines the default browser title, description,
application name, and base URL:

```tsx
export const metadata: Metadata = { ... };
```

Individual pages can override the title. The title template then produces a
value such as:

```text
Products | Vara Organics
```

#### 7. Environment configuration

`SITE_URL` comes from the validated environment configuration instead of being
hard-coded. This allows local, staging, and production deployments to use the
correct canonical domain.

#### 8. Accessibility

The “Skip to content” link allows keyboard and screen-reader users to bypass
repeated navigation and jump to the element with `id="main"`.

## Storefront wrapper: `src/app/(store)/layout.tsx`

Before reaching the homepage, Next.js passes it through this nested layout:

```tsx
export default async function StoreLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <>
      <AnnouncementBar text={settings.announcement} />
      <Navbar />
      <CartAnnouncer />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
```

It supplies the announcement bar, navigation, cart accessibility messages,
main content container, and footer shared by public store pages. It is
asynchronous because it loads site settings on the server.

## Starting file 2: `src/app/(store)/page.tsx`

This file represents the `/` URL and contains the homepage composition.

### Data imports

```tsx
import {
  getStoreProducts,
  getFeaturedProducts,
  getBundle,
} from "@/features/products/queries";
import { getSiteSettings } from "@/features/settings/queries";
```

The page does not access Supabase directly. It uses query functions from the
feature/data layer. This separation keeps database logic out of the UI.

### Component imports

The homepage is divided into focused components such as:

- `Hero`
- `BenefitsBar`
- `PainPoints`
- `ProductGrid`
- `WhyVara`
- `QRProof`
- `Process`
- `Bundle`
- `FirstOrderCTA`
- `StickyCart`

This is **component composition**: the page decides the order and supplies
data, while each component controls its own section markup and styling.

### Incremental Static Regeneration

```tsx
export const revalidate = 60;
```

Next.js can generate and cache the homepage as static HTML. After 60 seconds,
the cached version becomes eligible for regeneration so updated prices and
settings can appear without rebuilding the complete application.

This technique is called **Incremental Static Regeneration (ISR)**.

### Server Component and server-side data loading

```tsx
export default async function HomePage() {
```

The page is an asynchronous Server Component. It can query products and
settings on the server without exposing database credentials to the browser.

### Parallel data fetching

```tsx
const [products, featured, bundle, settings] = await Promise.all([
  getStoreProducts(),
  getFeaturedProducts(),
  getBundle("wellness-starter"),
  getSiteSettings(),
]);
```

`Promise.all` starts independent queries together. This is faster than waiting
for each query to finish before beginning the next one.

### Selecting the hero product safely

```tsx
const heroProduct =
  featured.find((product) => product.category === "ghee") ?? products[0]!;
```

The code prefers a featured ghee product. The nullish coalescing operator
(`??`) falls back to the first store product when no featured ghee exists.

The next expression selects an active 500 ml variant when available, otherwise
it selects the first active variant.

### React fragments

```tsx
return (
  <>
    ...
  </>
);
```

The empty `<>...</>` syntax is a React Fragment. It groups multiple elements
without adding an unnecessary wrapper element to the generated HTML.

### Passing props

```tsx
<Hero
  product={heroProduct}
  variant={heroVariant}
  headline={settings.heroHeadline}
  headlineEm={settings.heroHeadlineEm}
/>
```

The page passes server-loaded data into reusable components through props.

### Conditional rendering

```tsx
{bundle && <Bundle bundle={bundle} />}
```

The bundle section renders only when bundle data exists.

### In-page navigation

```tsx
const PRODUCTS_ANCHOR = "home-products";

<div id={PRODUCTS_ANCHOR} className="scroll-mt-[68px]">
  <ProductGrid products={products} />
</div>
```

The hero button links to `#home-products`. The browser scrolls to this element,
and `scroll-mt-[68px]` prevents the sticky navbar from covering the section.

### Structured data

```tsx
<JsonLd data={organizationSchema()} />
<JsonLd data={websiteSchema()} />
```

These components add JSON-LD structured data for search engines. They describe
the business and website in a machine-readable format.

### Preparing cart data

`StickyCart` receives a smaller object containing only the product and variant
fields needed by the cart. This keeps the cart interface explicit and avoids
passing the complete database product object.

## How a homepage request flows

When a visitor opens `/`, the simplified execution flow is:

1. Next.js selects `src/app/(store)/page.tsx` for the `/` route.
2. `src/app/layout.tsx` creates the document and global wrapper.
3. `src/app/(store)/layout.tsx` adds storefront navigation and the footer.
4. The homepage queries products, bundle data, and site settings.
5. The homepage passes that data to its section components.
6. Next.js sends prerendered HTML to the browser.
7. Interactive Client Components hydrate for menus, cart state, and buttons.

## Where to start when making changes

| Goal | File or folder |
|---|---|
| Change global HTML, fonts, or default SEO | `src/app/layout.tsx` |
| Change navbar/footer around store pages | `src/app/(store)/layout.tsx` |
| Reorder homepage sections | `src/app/(store)/page.tsx` |
| Change homepage section design | `src/components/home/` |
| Change product database queries | `src/features/products/queries.ts` |
| Change global styles | `src/app/globals.css` |
| Change admin pages | `src/app/admin/` |
| Change API endpoints | `src/app/api/` |

