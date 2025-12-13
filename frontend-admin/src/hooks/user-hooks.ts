import apiClient from "@/query/api-client";
import type { ApiResponse, ApiResponseError } from "@/types/ApiResponse";
import type {
	REVIEW_UPGRADE_REQUEST_RESPONSE,
	UPGRADE_REQUESTS_RESPONSE,
} from "@/types/Users";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import type { AxiosError } from "axios";

export const useFetchUpgradeRequests = (page: number, size: number = 20) => {
	return useQuery<UPGRADE_REQUESTS_RESPONSE["data"]>({
		queryKey: ["upgrade-requests", page, size],
		queryFn: async () => {
			const { data } = await apiClient.get<
				ApiResponse<UPGRADE_REQUESTS_RESPONSE["data"]>
			>(API_ENDPOINTS.GET_UPGRADE_REQUESTS(page, size));
			return data.data;
		},
	});
};

export const useReviewUpgradeRequest = () => {
	return useMutation<
		REVIEW_UPGRADE_REQUEST_RESPONSE,
		AxiosError<ApiResponseError>,
		{
			id: number;
			approved: boolean;
		}
	>({
		mutationKey: ["review-upgrade-request"],
		mutationFn: async ({ id, approved }) => {
			const { data } = await apiClient.post<REVIEW_UPGRADE_REQUEST_RESPONSE>(
				API_ENDPOINTS.REVIEW_UPGRADE_REQUEST(id),
				{ approved },
			);
			return data;
		},
	});
};
