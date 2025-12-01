import apiClient from "@/query/api-client";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import type {
	CATEGORY,
	CATEGORY_RESPONSE,
	PRODUCTS_BY_SUB_CATEGORY_ID,
	PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE,
} from "@/types/Product";

export const useFetchCategories = () => {
	return useQuery<CATEGORY[]>({
		queryKey: ["all_categories"],
		queryFn: async () => {
			const { data } = await apiClient.get<CATEGORY_RESPONSE>(
				API_ENDPOINTS.PARENT_CATEGORIES,
			);
			return data.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useFetchProductsyBySubCategoryId = (
	id: number,
	page: number,
	size: number,
) => {
	return useQuery<PRODUCTS_BY_SUB_CATEGORY_ID[]>({
		queryKey: ["category", id, page, size],
		queryFn: async () => {
			const { data } =
				await apiClient.get<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE>(
					API_ENDPOINTS.PRODUCTS_BY_SUB_CATEGORY_ID(id) +
						`?page=${page}&size=${size}`,
				);
			return data.data.content;
		},
		staleTime: 0,
	});
};
