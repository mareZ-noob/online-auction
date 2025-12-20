import apiClient from "@/query/api-client";
import type {
	DASHBOARD_LIVE_STATS_RESPONSE,
	DASHBOARD_MONTHLY_OR_YEARLY_STATISTICS_RESPONSE,
	DASHBOARD_STATISTICS_RESPONSE,
} from "@/types/Dashboard";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";

// Short Polling per 3 seconds
export const useFetchDashboardStatistics = () => {
	return useQuery<DASHBOARD_STATISTICS_RESPONSE["data"]>({
		queryKey: ["dashboard-statistics"],
		queryFn: async () => {
			const { data } = await apiClient.get<DASHBOARD_STATISTICS_RESPONSE>(
				API_ENDPOINTS.GET_DASHBOARD_STATISTICS,
			);
			return data.data;
		},
		refetchInterval: 3000,
		refetchIntervalInBackground: true,
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

export const useFetchLiveStats = () => {
	return useQuery<DASHBOARD_LIVE_STATS_RESPONSE["data"]>({
		queryKey: ["dashboard-live-stats"],
		queryFn: async () => {
			const { data } = await apiClient.get<DASHBOARD_LIVE_STATS_RESPONSE>(
				API_ENDPOINTS.DASHBOARD_STATS_SSE,
			);
			return data.data;
		},
	});
}