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

export type MONTHLY_OR_YEARLY_STATISTICS = {
	label: string;
	newUsers: number;
	newProducts: number;
	revenue: number;
};

export type DASHBOARD_MONTHLY_OR_YEARLY_STATISTICS_RESPONSE = ApiResponse<
	MONTHLY_OR_YEARLY_STATISTICS[]
>;
