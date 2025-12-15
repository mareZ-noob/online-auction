import apiClient from "@/query/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import type { CATEGORY_PAYLOAD, CATEGORY_RESPONSE } from "@/types/Categories";
import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";

export const useFetchCategories = () => {
	return useQuery<CATEGORY_RESPONSE["data"]>({
		queryKey: ["categories"],
		queryFn: async () => {
			const { data } = await apiClient.get<CATEGORY_RESPONSE>(
				API_ENDPOINTS.PARENT_CATEGORIES,
			);
			return data.data;
		},
	});
};

export const useCreateCategory = () => {
	return useMutation<
		CATEGORY_RESPONSE,
		AxiosError<ApiResponseError>,
		CATEGORY_PAYLOAD
	>({
		mutationFn: async (payload) => {
			const { data } = await apiClient.post<CATEGORY_RESPONSE>(
				API_ENDPOINTS.CREATE_CATEGORY,
				payload,
			);
			return data;
		},
	});
};
