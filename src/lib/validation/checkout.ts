import { z } from "zod";

/** Indian mobile: 10 digits starting 6–9, optional +91/0 prefix. */
export const indianPhone = z
  .string()
  .trim()
  .regex(/^(?:\+91|0)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

/** Indian PIN code: 6 digits, first digit 1–9. */
export const indianPin = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");

export const paymentMethodSchema = z.enum(["upi", "card", "netbanking", "wallet", "cod"]);

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  phone: indianPhone,
  addressLine1: z.string().trim().min(4, "Address is required").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  postalCode: indianPin,
  country: z.string().trim().min(2, "Country is required"),
  paymentMethod: paymentMethodSchema,
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** A single cart line as sent to the server (price is NOT trusted). */
export const orderLineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const createOrderSchema = z.object({
  customer: checkoutSchema,
  items: z.array(orderLineSchema).min(1, "Your cart is empty"),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
