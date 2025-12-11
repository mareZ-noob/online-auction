import type { ApiResponse, Pagination } from "./ApiResponse";

export type SUB_CATEGORY = {
  id: number;
  name: string;
  description: string;
  parentId: number;
  parentName: string;
};

export type CATEGORY = {
  id: number;
  name: string;
  description: string;
  children: SUB_CATEGORY[];
};

export type CATEGORY_RESPONSE = ApiResponse<CATEGORY[]>;

export type PRODUCTS_BY_SUB_CATEGORY_ID = {
  id: number;
  name: string;
  description: string;
  currentPrice: number;
  buyNowPrice: number;
  thumbnailImage: string;
  currentBidderName: string;
  endTime: string;
  timeRemaining: string;
  bidCount: number;
  isNew: boolean;
  categoryName: string;
  createdAt: string;
};

export type PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE = ApiResponse<
  Pagination<PRODUCTS_BY_SUB_CATEGORY_ID>
>;

export type TOP_PRODUCTS_BY_CONDITION = ApiResponse<
  PRODUCTS_BY_SUB_CATEGORY_ID[]
>;

export type PRODUCTS_IN_WATCHLIST = ApiResponse<
  Pagination<PRODUCTS_BY_SUB_CATEGORY_ID>
>;

export type SELLER_PUBLISHED_PRODUCTS = ApiResponse<
  Pagination<PRODUCTS_BY_SUB_CATEGORY_ID>
>;

export enum PRODUCT_DETAILS_STATUS {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export type PRODUCT_DETAILS = {
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
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  timeRemaining: string;
  autoExtend: boolean;
  allowUnratedBidders: boolean;
  status: PRODUCT_DETAILS_STATUS;
  bidCount: number;
  images: string[];
  isNew: boolean;
  isWatched: boolean;
  createdAt: string; // ISO datetime
};

export type PRODUCT_DETAILS_RESPONSE = ApiResponse<PRODUCT_DETAILS>;
