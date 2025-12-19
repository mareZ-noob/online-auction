import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import { API_ENDPOINTS } from "./endpoints";
import type {
	DELETE_A_PRODUCT_RESPONSE,
	DELETE_A_PRODUCT_PAYLOAD,
	PRODUCT_RESPONSE,
	UPDATE_AUCTION_SETTINGS_RESPONSE,
	AUCTION_SETTINGS_PAYLOAD,
	GET_AUCTION_SETTINGS_RESPONSE,
} from "@/types/Products";
import { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";
import { queryClient } from "@/lib/utils";

export const useFetchProducts = (page: number | null, size: number = 10) => {
	return useQuery<PRODUCT_RESPONSE["data"]>({
		queryKey: ["products", page],
		queryFn: async () => {
			if (page === null) {
				const { data } = await apiClient.get<PRODUCT_RESPONSE>(
					API_ENDPOINTS.ALL_PRODUCTS,
				);
				return data.data;
			}

			const { data } = await apiClient.get<PRODUCT_RESPONSE>(
				API_ENDPOINTS.ALL_PRODUCTS,
				{
					params: {
						page,
						size,
					},
				},
			);
			return data.data;
		},
	});
};

export const useRemoveAProduct = (page: number | null) => {
	return useMutation<
		DELETE_A_PRODUCT_RESPONSE,
		AxiosError<ApiResponseError>,
		DELETE_A_PRODUCT_PAYLOAD
	>({
		mutationKey: ["remove-a-product"],
		mutationFn: async (payload) => {
			const { data } = await apiClient.delete<DELETE_A_PRODUCT_RESPONSE>(
				API_ENDPOINTS.REMOVE_PRODUCT(payload.id),
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["products", page],
			});
		},
	});
};

export const useUpdateAuctionSettings = () => {
	return useMutation<
		UPDATE_AUCTION_SETTINGS_RESPONSE,
		AxiosError<ApiResponseError>,
		AUCTION_SETTINGS_PAYLOAD
	>({
		mutationKey: ["update-auction-settings"],
		mutationFn: async (payload) => {
			const { data } = await apiClient.put<UPDATE_AUCTION_SETTINGS_RESPONSE>(
				API_ENDPOINTS.AUCTION_SETTINGS,
				undefined,
				{
					params: {
						thresholdMinutes: payload.thresholdMinutes,
						durationMinutes: payload.durationMinutes,
					},
				}
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-auction-settings"],
			})
		}
	})
}

export const useFetchAuctionSettings = () => {
	return useQuery<GET_AUCTION_SETTINGS_RESPONSE["data"]>({
		queryKey: ["get-auction-settings"],
		queryFn: async () => {
			const { data } = await apiClient.get<GET_AUCTION_SETTINGS_RESPONSE>(
				API_ENDPOINTS.GET_AUCTION_SETTINGS,
			);
			return data.data;
		},
	})
}
