import type { ApiResponse, Pagination } from "./ApiResponse";

export type TRANSACTION_STATUS =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type TRANSACTION_DATA = {
  id: number;
  productId: number;
  productName: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  status: TRANSACTION_STATUS;
  shippingAddress: string;
  trackingNumber: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  cancelled: boolean;
  cancellationReason: string;
  createdAt: string;
};

export type TRANSACTION_DETAILS = {
  hasAccess: boolean;
  transaction: TRANSACTION_DATA;
  isBuyer: boolean;
  isSeller: boolean;
  chatEnabled: boolean;
  productId: number;
  productName: string;
  finalPrice: number;
  status: TRANSACTION_STATUS;
  message: string;
};

export type TRANSACTION_RESPONSE = ApiResponse<TRANSACTION_DETAILS>;

export type INITIATE_PAYMENT = {
  sessionId: string;
  checkoutUrl: string;
  transactionId: number;
  amount: number;
  currency: string;
};

export type INITIATE_PAYMENT_RESPONSE = ApiResponse<INITIATE_PAYMENT>;
export type UPDATE_SHIPPING_ADDRESS_RESPONSE = ApiResponse<TRANSACTION_DATA>;
export type SHIP_TRACKING_RESPONSE = ApiResponse<TRANSACTION_DATA>;
export type CONFITM_DELIVERY_RESPONSE = ApiResponse<TRANSACTION_DATA>;

export type CANCEL_TRANSACTION_RESPONSE = ApiResponse<TRANSACTION_DATA>;

export type PURCHASES = {
  id: number;
  productId: number;
  productName: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  status: TRANSACTION_STATUS;
  shippingAddress: string;
  trackingNumber: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  cancelled: boolean;
  cancellationReason: string;
  createdAt: string;
};

export type BUYER_PURCHASES_TRANSACTION_RESPONSE = ApiResponse<
  Pagination<PURCHASES>
>;
export type SELLER_SALES_TRANSACTION_RESPONSE = ApiResponse<
  Pagination<PURCHASES>
>;

export type TRANSACTION_RATE_PAYLOAD = {
  userId: number;
  productId: number;
  isPositive: boolean;
  comment: string;
};

export type TRANSACTION_RATE = {
  id: number;
  userId: number;
  userName: string;
  ratedById: number;
  ratedByName: string;
  productId: number;
  productName: string;
  isPositive: boolean;
  comment: string;
  createdAt: string;
};

export type TRANSACTION_RATE_RESPONSE = ApiResponse<TRANSACTION_RATE>;
