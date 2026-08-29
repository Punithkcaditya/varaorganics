import { site } from "@/config/site";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

/**
 * Branded transactional email templates (§10). Inline styles only (email
 * clients strip <style>). The order-confirmation email includes products,
 * amounts, address, payment method, tracking (when available), a
 * batch-verification link, and a short sourcing story.
 */

const NAVY = "#15284C";
const GOLD = "#E8961C";
const IVORY = "#FBF9F4";

/** Escape all customer/admin-controlled values before inserting them in HTML. */
function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function subjectText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function wrap(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:${IVORY};font-family:Arial,Helvetica,sans-serif;color:${NAVY}">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:${NAVY};padding:20px 24px;border-radius:6px 6px 0 0">
      <span style="color:${IVORY};font-size:22px;font-weight:bold">Vara<span style="color:${GOLD}">.</span> Organics</span>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #eee;border-top:none">
      <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
      ${body}
    </div>
    <div style="padding:18px 24px;color:#888;font-size:12px;text-align:center">
      ${site.name} · By ${site.legalName} · Bengaluru<br/>
      Every batch NABL lab-tested and QR-traceable.
    </div>
  </div></body></html>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.productName)} · ${escapeHtml(i.size)} × ${i.quantity}</td>
         <td style="padding:6px 0;text-align:right">${formatPrice(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const taxRow =
    order.taxAmount > 0
      ? `<tr><td>Tax</td><td style="text-align:right">${formatPrice(order.taxAmount)}</td></tr>`
      : "";
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows}
    <tr><td style="padding-top:10px;border-top:1px solid #eee">Subtotal</td><td style="padding-top:10px;border-top:1px solid #eee;text-align:right">${formatPrice(order.subtotal)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right">${order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}</td></tr>
    ${taxRow}
    <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="font-weight:bold;padding-top:6px;text-align:right">${formatPrice(order.totalAmount)}</td></tr>
  </table>`;
}

function addressBlock(order: Order): string {
  const a = order.address;
  return `<p style="font-size:13px;color:#555;line-height:1.6">
    ${escapeHtml(a.fullName)}<br/>${escapeHtml(a.addressLine1)}${a.addressLine2 ? "<br/>" + escapeHtml(a.addressLine2) : ""}${a.landmark ? "<br/>Landmark: " + escapeHtml(a.landmark) : ""}<br/>
    ${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.postalCode)}<br/>${escapeHtml(a.country)} · ${escapeHtml(a.phone)}</p>`;
}

const STORY =
  '<p style="font-size:13px;color:#666;line-height:1.7;margin-top:20px;border-top:1px solid #eee;padding-top:16px">' +
  "Vara Organics brings pure A2 Bilona ghee, wood-pressed oils and raw wild honey from Indian farms to your kitchen — " +
  "traditional methods, small batches, nothing added. Scan the QR on your jar to see the exact lab report for your batch.</p>";

function trackingLine(order: Order): string {
  if (order.trackingUrl) {
    const trackingUrl = escapeHtml(order.trackingUrl);
    return `<p style="font-size:14px"><strong>Track your order:</strong> <a href="${trackingUrl}" style="color:${GOLD}">${trackingUrl}</a></p>`;
  }
  return `<p style="font-size:13px;color:#888">A tracking link will follow once your order ships.</p>`;
}

function verifyLine(): string {
  return `<p style="font-size:13px"><a href="${escapeHtml(site.url)}${LAB_REPORTS_PATH}" style="color:${GOLD}">View lab reports & batch verification →</a></p>`;
}

function orderDetailsLine(order: Order): string {
  return `<p style="font-size:13px"><a href="${escapeHtml(site.url)}/order/${escapeHtml(order.id)}" style="color:${GOLD};font-weight:bold">View your order details →</a></p>`;
}

function paymentMethodLabel(order: Order): string {
  const labels: Record<Order["paymentMethod"], string> = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net banking",
    wallet: "Wallet",
    cod: "Cash on Delivery",
  };
  return labels[order.paymentMethod];
}

export function orderConfirmationEmail(order: Order) {
  const orderNumber = escapeHtml(order.orderNumber);
  return {
    subject: `Order ${order.orderNumber} confirmed — ${site.name}`,
    html: wrap(
      "Thank you for your order",
      `<p style="font-size:14px">Order <strong>${orderNumber}</strong> is confirmed. Payment received.</p>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:22px 0 6px">Delivery address</h2>${addressBlock(order)}
       <p style="font-size:13px">Payment method: ${paymentMethodLabel(order)}</p>
       ${orderDetailsLine(order)}${trackingLine(order)}${verifyLine()}${STORY}`,
    ),
  };
}

export function codConfirmationEmail(order: Order) {
  const orderNumber = escapeHtml(order.orderNumber);
  return {
    subject: `Order ${order.orderNumber} placed (Cash on Delivery) — ${site.name}`,
    html: wrap(
      "Your COD order is placed",
      `<p style="font-size:14px">Order <strong>${orderNumber}</strong> is placed. Please keep
       <strong>${formatPrice(order.totalAmount)}</strong> ready for cash on delivery.</p>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:22px 0 6px">Delivery address</h2>${addressBlock(order)}
       ${orderDetailsLine(order)}${trackingLine(order)}${verifyLine()}${STORY}`,
    ),
  };
}

export function shipmentCreatedEmail(order: Order) {
  const orderNumber = escapeHtml(order.orderNumber);
  return {
    subject: `Your order ${order.orderNumber} has shipped — ${site.name}`,
    html: wrap(
      "Your order is on its way",
      `<p style="font-size:14px">Order <strong>${orderNumber}</strong> has been shipped via
       ${escapeHtml(order.courierName ?? "our courier partner")}.</p>
       ${order.awbNumber ? `<p style="font-size:14px">AWB: <strong>${escapeHtml(order.awbNumber)}</strong></p>` : ""}
       ${trackingLine(order)}${STORY}`,
    ),
  };
}

export function shipmentTrackingEmail(order: Order) {
  const orderNumber = escapeHtml(order.orderNumber);
  return {
    subject: `Tracking update for order ${order.orderNumber} — ${site.name}`,
    html: wrap(
      "Tracking update",
      `<p style="font-size:14px">Here is the latest tracking for order <strong>${orderNumber}</strong>.</p>
       ${trackingLine(order)}`,
    ),
  };
}

export function paymentFailedEmail(order: Order) {
  const orderNumber = escapeHtml(order.orderNumber);
  return {
    subject: `Payment could not be completed for ${order.orderNumber} — ${site.name}`,
    html: wrap(
      "Payment not completed",
      `<p style="font-size:14px">We couldn't confirm payment for order <strong>${orderNumber}</strong>.
       No amount has been captured. You can retry from your cart, or contact us for help.</p>
       <p style="font-size:13px"><a href="${escapeHtml(site.url)}/contact" style="color:${GOLD}">Contact support →</a></p>`,
    ),
  };
}

export function contactAckEmail(name: string) {
  return {
    subject: `We received your message — ${site.name}`,
    html: wrap(
      "Thanks for reaching out",
      `<p style="font-size:14px">Hi ${escapeHtml(name)}, thank you for contacting ${site.name}. We've received your
       message and will get back to you shortly.</p>${STORY}`,
    ),
  };
}

export interface RestockRequestEmailInput {
  name: string;
  email: string;
  phone?: string;
  productName: string;
  variantName: string;
  sku?: string;
  message?: string;
}

/** Confirms that the team received a customer's product-specific restock request. */
export function restockRequestAckEmail(name: string, productName: string, variantName: string) {
  return {
    subject: `Restock request received — ${site.name}`,
    html: wrap(
      "We'll keep you posted",
      `<p style="font-size:14px">Hi ${escapeHtml(name)}, we've recorded your request for
       <strong>${escapeHtml(productName)}</strong>, size <strong>${escapeHtml(variantName)}</strong>.</p>
       <p style="font-size:14px">Our team will email you when this exact size is available again.</p>${STORY}`,
    ),
  };
}

/** Structured internal email so the team can later reply to the waiting customer. */
export function restockRequestAdminEmail(input: RestockRequestEmailInput) {
  const phoneLine = input.phone
    ? `<p style="font-size:14px"><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>`
    : "";
  const skuLine = input.sku
    ? `<p style="font-size:14px"><strong>SKU:</strong> ${escapeHtml(input.sku)}</p>`
    : "";
  const messageLine = input.message
    ? `<p style="font-size:14px"><strong>Customer note:</strong><br/>${escapeHtml(input.message).replace(/\n/g, "<br/>")}</p>`
    : "";

  return {
    subject: `Restock request: ${subjectText(input.productName)} (${subjectText(input.variantName)})`,
    html: wrap(
      "New back-in-stock request",
      `<p style="font-size:14px"><strong>Product:</strong> ${escapeHtml(input.productName)}</p>
       <p style="font-size:14px"><strong>Selected size:</strong> ${escapeHtml(input.variantName)}</p>
       ${skuLine}
       <hr style="border:0;border-top:1px solid #eee;margin:18px 0"/>
       <p style="font-size:14px"><strong>Customer:</strong> ${escapeHtml(input.name)}</p>
       <p style="font-size:14px"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
       ${phoneLine}${messageLine}
       <p style="font-size:13px;color:#666">Reply directly to this email when the selected size is back in stock.</p>`,
    ),
  };
}

/** Customer notice when a delivery attempt fails (NDR). Event #4b. */
export function ndrCustomerEmail(order: Order, reason?: string) {
  const orderNumber = escapeHtml(order.orderNumber);
  const reasonLine = reason
    ? `<p style="font-size:13px;color:#666">Reason noted by the courier: ${escapeHtml(reason)}.</p>`
    : "";
  return {
    subject: `We tried to deliver your Vara order ${order.orderNumber}`,
    html: wrap(
      "We tried to deliver your order",
      `<p style="font-size:14px">Hi ${escapeHtml(order.address.fullName)}, we attempted delivery of your Vara order
       <strong>${orderNumber}</strong> today but couldn't reach you.</p>
       ${reasonLine}
       <p style="font-size:14px">Our courier will try again shortly. If you've changed your address or want to
       reschedule, just reply to this email with your order number and we'll sort it out.</p>
       ${order.trackingUrl ? trackingLine(order) : ""}
       <p style="font-size:13px;color:#666">We want to make sure your order reaches you.</p>`,
    ),
  };
}

/** Auto-acknowledgement for a B2B / export enquiry. Event #9. */
export function b2bAckEmail(name: string, company?: string) {
  const licenceLine = site.fssaiLicence
    ? `<p style="font-size:12px;color:#888;margin-top:16px">FSSAI Central Licence: ${escapeHtml(site.fssaiLicence)}<br/>${escapeHtml(site.legalName)} · Bengaluru, Karnataka, India</p>`
    : "";
  return {
    subject: `Thank you for your enquiry — ${site.name}`,
    html: wrap(
      "Thank you for your enquiry",
      `<p style="font-size:14px">Dear ${escapeHtml(name)}, thank you for your interest in ${site.name}.</p>
       <p style="font-size:14px">We've received your enquiry${company ? ` from <strong>${escapeHtml(company)}</strong>` : ""}.
       Our B2B team will respond within 1 business day with pricing, MOQ details, and lab documentation.</p>
       <p style="font-size:13px"><a href="${escapeHtml(site.url)}/b2b" style="color:${GOLD}">View our B2B / export page →</a></p>
       ${licenceLine}`,
    ),
  };
}
