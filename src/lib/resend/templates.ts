import { site } from "@/config/site";
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
        `<tr><td style="padding:6px 0">${i.productName} · ${i.size} × ${i.quantity}</td>
         <td style="padding:6px 0;text-align:right">${formatPrice(i.lineTotal)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows}
    <tr><td style="padding-top:10px;border-top:1px solid #eee">Subtotal</td><td style="padding-top:10px;border-top:1px solid #eee;text-align:right">${formatPrice(order.subtotal)}</td></tr>
    <tr><td>Shipping</td><td style="text-align:right">${order.shippingAmount === 0 ? "Free" : formatPrice(order.shippingAmount)}</td></tr>
    <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="font-weight:bold;padding-top:6px;text-align:right">${formatPrice(order.totalAmount)}</td></tr>
  </table>`;
}

function addressBlock(order: Order): string {
  const a = order.address;
  return `<p style="font-size:13px;color:#555;line-height:1.6">
    ${a.fullName}<br/>${a.addressLine1}${a.addressLine2 ? "<br/>" + a.addressLine2 : ""}<br/>
    ${a.city}, ${a.state} ${a.postalCode}<br/>${a.country} · ${a.phone}</p>`;
}

const STORY =
  '<p style="font-size:13px;color:#666;line-height:1.7;margin-top:20px;border-top:1px solid #eee;padding-top:16px">' +
  "Vara Organics brings pure A2 Bilona ghee, wood-pressed oils and raw wild honey from Indian farms to your kitchen — " +
  "traditional methods, small batches, nothing added. Scan the QR on your jar to see the exact lab report for your batch.</p>";

function trackingLine(order: Order): string {
  if (order.trackingUrl) {
    return `<p style="font-size:14px"><strong>Track your order:</strong> <a href="${order.trackingUrl}" style="color:${GOLD}">${order.trackingUrl}</a></p>`;
  }
  return `<p style="font-size:13px;color:#888">A tracking link will follow once your order ships.</p>`;
}

function verifyLine(): string {
  return `<p style="font-size:13px"><a href="${site.url}/lab-reports" style="color:${GOLD}">View lab reports & batch verification →</a></p>`;
}

export function orderConfirmationEmail(order: Order) {
  return {
    subject: `Order ${order.orderNumber} confirmed — ${site.name}`,
    html: wrap(
      "Thank you for your order",
      `<p style="font-size:14px">Order <strong>${order.orderNumber}</strong> is confirmed. Payment received.</p>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:22px 0 6px">Delivery address</h2>${addressBlock(order)}
       <p style="font-size:13px">Payment method: ${order.paymentMethod.toUpperCase()}</p>
       ${trackingLine(order)}${verifyLine()}${STORY}`,
    ),
  };
}

export function codConfirmationEmail(order: Order) {
  return {
    subject: `Order ${order.orderNumber} placed (Cash on Delivery) — ${site.name}`,
    html: wrap(
      "Your COD order is placed",
      `<p style="font-size:14px">Order <strong>${order.orderNumber}</strong> is placed. Please keep
       <strong>${formatPrice(order.totalAmount)}</strong> ready for cash on delivery.</p>
       ${itemsTable(order)}
       <h2 style="font-size:15px;margin:22px 0 6px">Delivery address</h2>${addressBlock(order)}
       ${trackingLine(order)}${verifyLine()}${STORY}`,
    ),
  };
}

export function shipmentCreatedEmail(order: Order) {
  return {
    subject: `Your order ${order.orderNumber} has shipped — ${site.name}`,
    html: wrap(
      "Your order is on its way",
      `<p style="font-size:14px">Order <strong>${order.orderNumber}</strong> has been shipped via
       ${order.courierName ?? "our courier partner"}.</p>
       ${order.awbNumber ? `<p style="font-size:14px">AWB: <strong>${order.awbNumber}</strong></p>` : ""}
       ${trackingLine(order)}${STORY}`,
    ),
  };
}

export function shipmentTrackingEmail(order: Order) {
  return {
    subject: `Tracking update for order ${order.orderNumber} — ${site.name}`,
    html: wrap(
      "Tracking update",
      `<p style="font-size:14px">Here is the latest tracking for order <strong>${order.orderNumber}</strong>.</p>
       ${trackingLine(order)}`,
    ),
  };
}

export function paymentFailedEmail(order: Order) {
  return {
    subject: `Payment could not be completed for ${order.orderNumber} — ${site.name}`,
    html: wrap(
      "Payment not completed",
      `<p style="font-size:14px">We couldn't confirm payment for order <strong>${order.orderNumber}</strong>.
       No amount has been captured. You can retry from your cart, or contact us for help.</p>
       <p style="font-size:13px"><a href="${site.url}/contact" style="color:${GOLD}">Contact support →</a></p>`,
    ),
  };
}

export function contactAckEmail(name: string) {
  return {
    subject: `We received your message — ${site.name}`,
    html: wrap(
      "Thanks for reaching out",
      `<p style="font-size:14px">Hi ${name}, thank you for contacting ${site.name}. We've received your
       message and will get back to you shortly.</p>${STORY}`,
    ),
  };
}
