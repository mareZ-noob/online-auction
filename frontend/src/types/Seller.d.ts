import type { ApiResponse } from "./ApiResponse";

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
