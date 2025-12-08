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
