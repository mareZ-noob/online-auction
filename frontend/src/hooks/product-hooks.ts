import { API_ENDPOINTS } from "./endpoints";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type {
  CATEGORY,
  CATEGORY_RESPONSE,
  PRODUCT_DETAILS_RESPONSE,
  PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE,
  TOP_PRODUCTS_BY_CONDITION,
} from "@/types/Product";

export const useFetchCategories = () => {
  return useQuery<CATEGORY[]>({
    queryKey: ["all_categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<CATEGORY_RESPONSE>(
        API_ENDPOINTS.PARENT_CATEGORIES
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFetchEndingSoonProducts = () => {
  return useQuery<TOP_PRODUCTS_BY_CONDITION["data"] | undefined>({
    queryKey: ["ending_soon_products"],
    queryFn: async () => {
      const { data } = await apiClient.get<TOP_PRODUCTS_BY_CONDITION>(
        API_ENDPOINTS.ENDING_SOON_PRODUCTS
      );
      return data.data;
    },
    staleTime: 0,
  });
};

export const useFetchTopMostBidProducts = () => {
  return useQuery<TOP_PRODUCTS_BY_CONDITION["data"] | undefined>({
    queryKey: ["most_bid_products"],
    queryFn: async () => {
      const { data } = await apiClient.get<TOP_PRODUCTS_BY_CONDITION>(
        API_ENDPOINTS.MOST_BID_PRODUCTS
      );
      return data.data;
    },
    staleTime: 0,
  });
};

export const useFetchTopHighestPriceProducts = () => {
  return useQuery<TOP_PRODUCTS_BY_CONDITION["data"] | undefined>({
    queryKey: ["highest_price_products"],
    queryFn: async () => {
      const { data } = await apiClient.get<TOP_PRODUCTS_BY_CONDITION>(
        API_ENDPOINTS.HIGHEST_PRICE_PRODUCTS
      );
      return data.data;
    },
    staleTime: 0,
  });
};

export const useFetchRelatedProducts = (id: number) => {
  return useQuery<TOP_PRODUCTS_BY_CONDITION["data"] | undefined>({
    queryKey: ["related_products", id],
    queryFn: async () => {
      const { data } = await apiClient.get<TOP_PRODUCTS_BY_CONDITION>(
        API_ENDPOINTS.RELATED_PRODUCTS(id)
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useFetchProductDetailsById = (id: number) => {
  return useQuery<PRODUCT_DETAILS_RESPONSE["data"] | undefined>({
    queryKey: ["product_details", id],
    queryFn: async () => {
      const { data } = await apiClient.get<PRODUCT_DETAILS_RESPONSE>(
        API_ENDPOINTS.PRODUCT_DETAIL_BY_ID(id)
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useFetchProductsyBySubCategoryId = (
  id: number,
  page: number,
  size: number
) => {
  return useQuery<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE["data"] | undefined>({
    queryKey: ["category", id, page, size],
    queryFn: async () => {
      const { data } =
        await apiClient.get<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE>(
          API_ENDPOINTS.PRODUCTS_BY_SUB_CATEGORY_ID(id) +
            `?page=${page}&size=${size}`
        );
      return data.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useSearchProdutcs = (
  keyword: string,
  page: number,
  size: number,
  categoryId?: number | null,
  sortBy?: string,
  sortDirection?: string
) => {
  if (!categoryId) categoryId = null;
  if (!sortBy) sortBy = "price";
  if (!sortDirection) sortDirection = "asc";

  return useQuery<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE["data"] | undefined>({
    queryKey: [
      "search_products",
      keyword,
      categoryId,
      page,
      size,
      sortBy,
      sortDirection,
    ],
    queryFn: async () => {
      const body = {
        keyword,
        categoryId,
        page,
        size,
        sortBy,
        sortDirection,
      } as const;

      const { data } =
        await apiClient.post<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE>(
          API_ENDPOINTS.SEARCH_PRODUCTS,
          body
        );

      return data.data;
    },
    enabled: !!keyword,
    staleTime: 0,
  });
};
