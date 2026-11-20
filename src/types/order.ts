/**
 * Types relatifs aux échantillons, commandes et paiements
 */

export type SampleKitTier = "decouverte" | "masterclass" | "prestige";

export type SampleKit = {
  id: SampleKitTier;
  title: string;
  tagline: string;
  price: number; // en euros TTC
  originalPrice?: number;
  badge?: string;
  features: string[];
  includes: string[];
  popular?: boolean;
};

export type OlfactoryFormula = {
  id: string;
  code: string;
  name: string;
  character: string;
  head: string[];
  heart: string[];
  base: string[];
  description: string;
};

export type ShippingAddress = {
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

export type PaymentMethod = "card" | "apple_pay" | "invoice";

export type PaymentDetails = {
  method: PaymentMethod;
  cardNumber?: string;
  cardExp?: string;
  cardCvc?: string;
  cardHolder?: string;
  promoCode?: string;
  discountAmount?: number;
};

export type Order = {
  id: string;
  projectId: string;
  createdAt: number;
  kit: SampleKit;
  formulas: OlfactoryFormula[];
  selectedFormulaId?: string;
  shipping: ShippingAddress;
  payment: PaymentDetails;
  total: number;
  status: "paid" | "preparing" | "shipped" | "delivered";
  trackingNumber: string;
};
