import type { ApiResponse, Pagination } from "./ApiResponse";

export type UPGRADE_REQUESTS = {
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

export type UPGRADE_REQUESTS_RESPONSE = ApiResponse<
	Pagination<UPGRADE_REQUESTS>
>;
export type REVIEW_UPGRADE_REQUEST_RESPONSE = ApiResponse<UPGRADE_REQUESTS>;

export type USER = {
	id: number;
	email: string;
	fullName: string;
	address: string;
	dateOfBirth: string;
	role: string;
	linkedProviders: string[];
	emailVerified: boolean;
	isActive: boolean;
	positiveRatings: number;
	negativeRatings: number;
	region: string;
	preferredLanguage: string;
	ratingPercentage: number;
	createdAt: string;
};

export type USER_RESPONSE = ApiResponse<Pagination<USER>>;
export type USER_BY_ID_RESPONSE = ApiResponse<USER>;
export type ENABLE_USER_RESPONSE = ApiResponse<string>;
export type DISABLE_USER_RESPONSE = ApiResponse<string>;

export type RESET_PASSWORD_USER_RESPONSE = ApiResponse<{ temporaryPassword: string }>;
