import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type { ApiResponse, ApiResponseError } from "@/types/ApiResponse";
import type { PRODUCTS_IN_WATCHLIST } from "@/types/Product";
import { API_ENDPOINTS } from "./endpoints";
import { queryClient } from "@/lib/utils";
import type { AxiosError } from "axios";

export const useFetchMyWatchList = (page: number = 0, size: number = 9) => {
	return useQuery<PRODUCTS_IN_WATCHLIST["data"]>({
		queryKey: ["my-watchlist", page, size],
		queryFn: async () => {
			const { data } = await apiClient.get<PRODUCTS_IN_WATCHLIST>(
				`${API_ENDPOINTS.GET_MY_WATCHLIST}?page=${page}&size=${size}`,
			);
			return data.data;
		},
	});
};

export const useCheckAProductInWatchList = (productId: number) => {
	return useQuery<boolean>({
		queryKey: ["check-watchlist", productId],
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<boolean>>(
				API_ENDPOINTS.CHECK_A_PRODUCT_IN_WATCHLIST(productId),
			);
			return data.data;
		},
	});
};

export const useAddAProductToWatchList = (productId: number) => {
	return useMutation<ApiResponse<string>, AxiosError<ApiResponseError>>({
		mutationKey: ["add-watchlist", productId],
		mutationFn: async () => {
			const { data } = await apiClient.post<ApiResponse<string>>(
				API_ENDPOINTS.ADD_A_PRODUCT_TO_WATCHLIST(productId),
			);
			return data;
		},
		onError: (error) => {
			const apiError = error.response?.data;

			if (apiError) {
				return Promise.reject(new Error(apiError.message));
			} else {
				console.error("Unexpected error:", error.message);
			}
		},
	});
};

export const useRemoveAProductFromWatchList = (productId: number) => {
	return useMutation<ApiResponse<string>, AxiosError<ApiResponseError>>({
		mutationKey: ["remove-watchlist", productId],
		mutationFn: async () => {
			const { data } = await apiClient.delete<ApiResponse<string>>(
				API_ENDPOINTS.REMOVE_A_PRODUCT_FROM_WATCHLIST(productId),
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-watchlist"] });
		},
		onError: (error) => {
			const apiError = error.response?.data;

			if (apiError) {
				return Promise.reject(new Error(apiError.message));
			} else {
				console.error("Unexpected error:", error.message);
			}
		},
	});
};
