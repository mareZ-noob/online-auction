import apiClient from "@/query/api-client";
import type {
	DASHBOARD_MONTHLY_OR_YEARLY_STATISTICS_RESPONSE,
	DASHBOARD_STATISTICS_RESPONSE,
} from "@/types/Dashboard";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";

export const useFetchDashboardStatistics = () => {
	return useQuery<DASHBOARD_STATISTICS_RESPONSE["data"]>({
		queryKey: ["dashboard-statistics"],
		queryFn: async () => {
			const { data } = await apiClient.get<DASHBOARD_STATISTICS_RESPONSE>(
				API_ENDPOINTS.GET_DASHBOARD_STATISTICS,
			);
			return data.data;
		},
	});
};

export const useFetchDashboardMonthlyOrYearlyStatistics = (
	type: "MONTHLY" | "YEARLY",
) => {
	return useQuery<DASHBOARD_MONTHLY_OR_YEARLY_STATISTICS_RESPONSE["data"]>({
		queryKey: ["dashboard-monthly-or-yearly-statistics", type],
		queryFn: async () => {
			const { data } =
				await apiClient.get<DASHBOARD_MONTHLY_OR_YEARLY_STATISTICS_RESPONSE>(
					API_ENDPOINTS.GET_DASHBOARD_STATISTICS_MONTHLY_OR_YEARLY,
					{
						params: {
							type,
						},
					},
				);
			return data.data;
		},
	});
};
