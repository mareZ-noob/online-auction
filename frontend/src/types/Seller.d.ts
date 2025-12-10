import type { ApiResponse } from "./ApiResponse";
import type { USER_QUESTIONS } from "./User";

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

export type POST_ANSWER_TO_QUESTION_RESPONSE = ApiResponse<USER_QUESTIONS>;
