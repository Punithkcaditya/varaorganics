/** Domain types — the shapes the app works with (mapped from DB rows). */

export type Category = "ghee" | "honey" | "oils";
export type LabStatus = "Pass" | "Premium" | "Fail";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "cod_pending" | "refunded";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "failed"
  | "cancelled";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // e.g. "500ml"
  sku: string;
  price: number; // paise-free rupees (integer INR)
  compareAtPrice: number | null;
  stock: number;
  unitLabel: string; // e.g. "500ml"
  /** Denominator for unit-price context, in base units (ml or g). */
  unitBase: number;
  /** "ml" | "g" — the unit shown in ₹/unit context. */
  unitType: "ml" | "g";
  active: boolean;
  /**
   * Fixed indexable slug for this variant, when the URL structure gives it its
   * own page (e.g. ghee 500ml and 1L). Null variants are switched inline only.
   */
  routeSlug: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface LabParameter {
  id: string;
  name: string;
  result: string;
  status: LabStatus;
  position: number;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  mfgDate: string; // ISO date
  bestBefore: string; // ISO date
  labReportUrl: string | null;
  active: boolean;
  labParameters: LabParameter[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NutritionInfo {
  servingSize: string; // e.g. "per 100g"
  rows: { label: string; value: string }[];
}

export interface Product {
  id: string;
  productName: string;
  slug: string; // base slug
  category: Category;
  routePrefix: Category; // /ghee | /honey | /oils
  shortDescription: string;
  longDescription: string; // markdown
  ingredients: string | null;
  nutritionalInfo: NutritionInfo | null;
  metaTitle: string | null;
  metaDescription: string | null;
  faqs: FaqItem[];
  /** Slugs of related /learn articles to surface on the product page. */
  learnLinks: string[];
  active: boolean;
  featured: boolean;
  isBundle: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  currentBatch: ProductBatch | null;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  coverImage: string | null;
  bodyMarkdown: string;
  faqs: FaqItem[];
  metaTitle: string | null;
  metaDescription: string | null;
  readTime: number;
  relatedProduct: string | null;
  published: boolean;
  enableHowtoSchema: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  routePrefix: Category | "bundles";
  productName: string;
  size: string;
  price: number;
  unitLabel: string;
  image: string | null;
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productName: string;
  size: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shiprocketShipmentId: string | null;
  awbNumber: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  /** Batch dispatched with this order — lets us trace a recall to customers. */
  batchNumber: string | null;
  /** Campaign attribution carried through checkout from the landing page. */
  utm: { source: string | null; medium: string | null; campaign: string | null };
  notes: string | null;
  createdAt: string;
}

export interface ShipmentEvent {
  status: string;
  statusDetail: string | null;
  occurredAt: string;
}

export interface InventoryStatus {
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  stock: number;
  reorderPoint: number;
  needsReorder: boolean;
}

export interface ComparisonRow {
  brand: string;
  price: string;
  labTested: string;
  isUs?: boolean;
}

export interface PainPointPair {
  problem: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  body: string;
}

/**
 * Ad landing page. Section toggles let the marketer compose a page from the
 * database without a deploy (Landing Page Copy doc §03).
 */
export interface LandingPage {
  slug: string;
  announcement: string | null;
  eyebrow: string | null;
  headline: string;
  /** Rendered in gold italic after the main headline, e.g. "Proved, not claimed." */
  headlineEm: string | null;
  subheadline: string;
  openingCopy: string | null;
  heroImage: string | null;
  trustBullets: string[];
  productSlug: string;
  variantSize: string;
  ctaLabel: string;
  ctaButtonColor: "navy" | "gold";
  secondaryCtaLabel: string | null;
  variantNote: string | null;
  campaignId: string | null;
  active: boolean;
  noindex: boolean;
  metaTitle: string | null;
  // Section toggles + their content
  showLabCard: boolean;
  showComparison: boolean;
  comparisonRows: ComparisonRow[];
  showPainPoints: boolean;
  painPoints: PainPointPair[];
  showStory: boolean;
  storyHeading: string | null;
  storyCopy: string | null;
  storyAttribution: string | null;
  showProcess: boolean;
  processSteps: ProcessStep[];
  showHonest: boolean;
  honestCopy: string | null;
  faqs: FaqItem[];
}
