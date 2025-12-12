import type { ApiResponse, Pagination } from "./ApiResponse";
import type { RATE_A_USER, USER_QUESTIONS } from "./User";

export type CREATE_PRODUCT_PAYLOAD = {
  name: string;
  description: string;
  startingPrice: number;
  stepPrice: number;
  buyNowPrice: number;
  categoryId: number;
  endTime: string;
  autoExtend: boolean;
  allowUnratedBidders: boolean;
  images: string[];
};

export type CREATE_PRODUCT_DATA = {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  stepPrice: number;
  buyNowPrice: number;
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  sellerRating: number;
  currentBidderId: number;
  currentBidderName: string;
  currentBidderRating: number;
  startTime: string;
  endTime: string;
  timeRemaining: string;
  autoExtend: boolean;
  allowUnratedBidders: boolean;
  status: string;
  bidCount: number;
  images: string[];
  isNew: boolean;
  isWatched: boolean;
  createdAt: string;
};

export type CREATE_PRODUCT_RESPONSE = ApiResponse<CREATE_PRODUCT_DATA>;

export type UPDATE_PRODUCT_DESCRIPTION_PAYLOAD = {
  additionalDescription: string;
};

export type UPDATE_PRODUCT_DESCRIPTION_RESPONSE =
  ApiResponse<CREATE_PRODUCT_DATA>;

// Answer a question about a product
export type POST_ANSWER_TO_QUESTION_PAYLOAD = {
  answer: string;
};

export type UNANSWERED_QUESTIONS = {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  question: string;
  createdAt: string;
};

export type POST_ANSWER_TO_QUESTION_RESPONSE = ApiResponse<USER_QUESTIONS>;

export type GET_UNANSWERED_QUESTIONS_RESPONSE = ApiResponse<
  Pagination<UNANSWERED_QUESTIONS>
>;

// Block a bidder from a product
export type BLOCK_A_BIDDER_FROM_A_PRODUCT_PAYLOAD = {
  productId: number;
  bidderId: number;
};

export type BLOCK_A_BIDDER_FROM_A_PRODUCT_RESPONSE = ApiResponse<string>;

// Rate a bidder from a sold product
export type RATE_A_BIDDER_PAYLOAD = {
  userId: number;
  productId: number;
  isPositive: boolean;
  comment: string;
};

export type RATE_A_BIDDER_RESPONSE = ApiResponse<RATE_A_USER>;

export type CHECK_A_RATED_BIDDER_ON_A_PRODUCT_RESPONSE =
  ApiResponse<RATE_A_USER>;

// Get all sales
export type SELLER_SALES = {
  id: number;
  productId: number;
  productName: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  status: string;
  shippingAddress: string;
  trackingNumber: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  cancelled: boolean;
  cancellationReason: string;
  createdAt: string;
};

export type SELLER_SALES_RESPONSE = ApiResponse<Pagination<SELLER_SALES>>;
