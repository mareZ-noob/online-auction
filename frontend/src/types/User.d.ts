import type { ApiResponse } from "./ApiResponse";

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
