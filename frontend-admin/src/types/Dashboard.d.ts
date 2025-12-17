import type { ApiResponse } from "./ApiResponse";

export type DASHBOARD_STATISTICS = {
	totalUsers: number;
	totalBidders: number;
	totalSellers: number;
	totalProducts: number;
	activeProducts: number;
	completedProducts: number;
	totalRevenue: number;
	newUsersThisMonth: number;
	newProductsThisMonth: number;
	upgradeRequestsPending: number;
};

export type DASHBOARD_STATISTICS_RESPONSE = ApiResponse<DASHBOARD_STATISTICS>;
