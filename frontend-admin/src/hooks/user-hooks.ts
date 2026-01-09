import apiClient from "@/query/api-client";
import type { ApiResponse, ApiResponseError } from "@/types/ApiResponse";
import type {
	DISABLE_USER_RESPONSE,
	ENABLE_USER_RESPONSE,
	RESET_PASSWORD_USER_RESPONSE,
	REVIEW_UPGRADE_REQUEST_RESPONSE,
	UPGRADE_REQUESTS_RESPONSE,
	USER_BY_ID_RESPONSE,
	USER_RESPONSE,
} from "@/types/Users";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import type { AxiosError } from "axios";
import { queryClient } from "@/lib/utils";

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
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["upgrade-requests"],
				exact: false,
			});
		},
	});
};

export const useFetchUsers = (
	page: number,
	size: number = 20,
	search?: string,
	role?: string,
) => {
	return useQuery<USER_RESPONSE["data"]>({
		queryKey: ["users", page, size, search, role],
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<USER_RESPONSE["data"]>>(
				API_ENDPOINTS.GET_USERS,
				{
					params: {
						page,
						size,
						search,
						role,
					},
				},
			);
			return data.data;
		},
	});
};

export const useFetchUserById = (id: string | number) => {
	return useQuery<USER_BY_ID_RESPONSE["data"]>({
		queryKey: ["user", id],
		queryFn: async () => {
			const { data } = await apiClient.get<
				ApiResponse<USER_BY_ID_RESPONSE["data"]>
			>(API_ENDPOINTS.GET_USER_BY_ID(id));
			return data.data;
		},
	});
};

export const useEnableUser = (page: number) => {
	return useMutation<
		ENABLE_USER_RESPONSE,
		AxiosError<ApiResponseError>,
		{
			id: string | number;
		}
	>({
		mutationKey: ["enable-user"],
		mutationFn: async ({ id }) => {
			const { data } = await apiClient.put<ENABLE_USER_RESPONSE>(
				API_ENDPOINTS.ENABLE_USER(id),
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users", page],
			});
		}
	});
};

export const useDisableUser = (page: number) => {
	return useMutation<
		DISABLE_USER_RESPONSE,
		AxiosError<ApiResponseError>,
		{
			id: string | number;
		}
	>({
		mutationKey: ["disable-user"],
		mutationFn: async ({ id }) => {
			const { data } = await apiClient.put<
				DISABLE_USER_RESPONSE
			>(API_ENDPOINTS.DISABLE_USER(id));
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users", page],
			});
		}
	});
};

export const useResetPasswordUser = (page: number) => {
	return useMutation<
		RESET_PASSWORD_USER_RESPONSE,
		AxiosError<ApiResponseError>,
		{
			id: string | number;
		}
	>({
		mutationKey: ["reset-password-user"],
		mutationFn: async ({ id }) => {
			const { data } = await apiClient.post<
				RESET_PASSWORD_USER_RESPONSE
			>(API_ENDPOINTS.RESET_PASSWORD_USER(id));

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users", page],
			});
		}
	});
};