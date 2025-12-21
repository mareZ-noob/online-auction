import type { ApiResponse } from "./ApiResponse";

export type CONVERT_AMOUNT_BETWEEN_CURRENCIES = {
  convertedAmount: number;
  originalAmount: number;
  originalCurrency: "vnd" | "usd";
  convertedCurrency: "vnd" | "usd";
};

export type CONVERT_AMOUNT_BETWEEN_CURRENCIES_RESPONSE =
  ApiResponse<CONVERT_AMOUNT_BETWEEN_CURRENCIES>;

export type CURRENCY = {
  code: string;
  symbol: string;
  name: string;
  amount: number;
};

export type CURRENCY_MAP = Record<string, CURRENCY>;
export type CURRENCY_RESPONSE = ApiResponse<CURRENCY_MAP>;

export type PAYMENT_SESSION_DETAILS = {
  sessionId: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  customerEmail: string;
  expiresAt: number;
};

export type PAYMENT_SESSION_DETAILS_RESPONSE =
  ApiResponse<PAYMENT_SESSION_DETAILS>;

export type VERIFY_PAYMENT = {
  success: boolean;
  transactionId: number;
  sessionId: string;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  message: string;
};

export type VERIFY_PAYMENT_RESPONSE = ApiResponse<VERIFY_PAYMENT>;

export type CANCEL_PAYMENT_SESSION_RESPONSE = ApiResponse<string>;

export type STRIPE_CHECKOUT_SESSION = {
  sessionId: string;
  checkoutUrl: string;
  transactionId: number;
  amount: number;
  currency: string;
};

export type CREATE_STRIPE_CHECKOUT_SESSION_RESPONSE =
  ApiResponse<STRIPE_CHECKOUT_SESSION>;
