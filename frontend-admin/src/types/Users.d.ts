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
