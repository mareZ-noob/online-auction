import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type {
  CATEGORY,
  CATEGORY_RESPONSE,
  PRODUCT_DETAILS_RESPONSE,
  PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE,
  TOP_PRODUCTS_BY_CONDITION,
} from "@/types/Product";
import { API_ENDPOINTS } from "./endpoints";
import type {
  USER_QUESTIONS_PAYLOAD,
  USER_QUESTIONS_RESPONSE,
} from "@/types/User";
import { queryClient } from "@/lib/utils";
import type { ApiResponseError } from "@/types/ApiResponse";

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

export const usePostCommentOnAProduct = (page: number) => {
  return useMutation<
    USER_QUESTIONS_RESPONSE,
    AxiosError<ApiResponseError>,
    USER_QUESTIONS_PAYLOAD
  >({
    mutationKey: ["post_question_on_a_product"],
    mutationFn: async (payload: USER_QUESTIONS_PAYLOAD) => {
      const { data } = await apiClient.post<USER_QUESTIONS_RESPONSE>(
        API_ENDPOINTS.POST_QUESTION_ON_A_PRODUCT,
        payload
      );
      return data;
    },
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: ["get_questions_of_a_product", _variables.productId, page],
      });
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

export const useFetchComments = (page: number = 0, size?: number) => {
  if (!size || isNaN(size)) size = 10;

  return useQuery<USER_QUESTIONS_RESPONSE["data"] | undefined>({
    queryKey: ["get_questions", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<USER_QUESTIONS_RESPONSE>(
        API_ENDPOINTS.GET_QUESTIONS(page, size)
      );
      return data.data;
    },
    staleTime: 0,
  });
};

export const useFetchCommentsOfAProduct = (
  productId: number,
  page: number = 0,
  size?: number
) => {
  if (!size || isNaN(size)) size = 10;

  return useQuery<USER_QUESTIONS_RESPONSE["data"] | undefined>({
    queryKey: ["get_questions_of_a_product", productId, page],
    queryFn: async () => {
      const { data } = await apiClient.get<USER_QUESTIONS_RESPONSE>(
        API_ENDPOINTS.GET_QUESTIONS_OF_A_PRODUCT(productId, page, size)
      );
      return data.data;
    },
    enabled: !!productId,
    staleTime: 0,
  });
};
