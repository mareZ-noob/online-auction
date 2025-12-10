import type { ApiResponse, Pagination } from "./ApiResponse";

export type USER_BY_ID = {
  id: number;
  email: string;
  fullName: string;
  address: string;
  dateOfBirth?: string;
  role: string;
  linkedProviders: string[];
  emailVerified: boolean;
  positiveRatings: number;
  negativeRatings: number;
  createdAt: string;
};

export type USER_BY_ID_RESPONSE = ApiResponse<USER_BY_ID>;

export type UPDATE_USER_PROFILE = {
  id: number;
  email: string;
  fullName: string;
  address: string;
  dateOfBirth: string;
  role: string;
  linkedProviders: string[];
  emailVerified: boolean;
  positiveRatings: number;
  negativeRatings: number;
  region: string;
  preferredLanguage: string;
  ratingPercentage: number;
  createdAt: string;
};

export type UPDATE_USER_PROFILE_RESPONSE = ApiResponse<UPDATE_USER_PROFILE>;

export type CHANGE_PASSWORD_RESPONSE = ApiResponse<string>;

export type USER_RATINGS = {
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

export type USER_RATINGS_RESPONSE = ApiResponse<Pagination<USER_RATINGS>>;

// Upgrade to seller

export type USER_UPGRADE_TO_SELLER_PAYLOAD = {
  reason: string;
};

export type USER_UPGRADE_TO_SELLER = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: string;
  reason: string;
  reviewedById: number;
  reviewedByName: string;
  reviewedAt: string;
  createdAt: string;
};

export type USER_UPGRADE_TO_SELLER_RESPONSE =
  ApiResponse<USER_UPGRADE_TO_SELLER>;

export type USER_UPGRADE_TO_SELLER_REQUESTS_RESPONSE = ApiResponse<
  USER_UPGRADE_TO_SELLER[]
>;

// Questions asked by user about products

export type USER_QUESTIONS_PAYLOAD = {
  productId: number;
  question: string;
};

export type USER_QUESTIONS = {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  question: string;
  answer: string;
  answeredAt: string;
  createdAt: string;
};

export type USER_QUESTIONS_RESPONSE = ApiResponse<Pagination<USER_QUESTIONS>>;
