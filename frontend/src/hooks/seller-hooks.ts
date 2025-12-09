import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "@/query/api-client";
import type { ApiResponseError } from "@/types/ApiResponse";
import type {
  CREATE_PRODUCT_PAYLOAD,
  CREATE_PRODUCT_RESPONSE,
  UPDATE_PRODUCT_DESCRIPTION_PAYLOAD,
  UPDATE_PRODUCT_DESCRIPTION_RESPONSE,
} from "@/types/Seller";
import { API_ENDPOINTS } from "./endpoints";
import type { SELLER_PUBLISHED_PRODUCTS } from "@/types/Product";
import { queryClient } from "@/lib/utils";

export const usePublishNewProduct = () => {
  return useMutation<
    CREATE_PRODUCT_RESPONSE,
    AxiosError<ApiResponseError>,
    CREATE_PRODUCT_PAYLOAD
  >({
    mutationKey: ["publish-new-product"],
    mutationFn: async (payload: CREATE_PRODUCT_PAYLOAD) => {
      const { data } = await apiClient.post<CREATE_PRODUCT_RESPONSE>(
        API_ENDPOINTS.CREATE_NEW_PRODUCT,
        payload
      );
      return data;
    },
  });
};

export const useFetchMyPublishedProducts = (
  page: number = 0,
  size: number = 20
) => {
  return useQuery({
    queryKey: ["my-published-products", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<SELLER_PUBLISHED_PRODUCTS>(
        API_ENDPOINTS.GET_MY_PRODUCTS(page, size)
      );
      return data.data;
    },
  });
};

export const useUpdateProductDescription = (id: number) => {
  return useMutation<
    UPDATE_PRODUCT_DESCRIPTION_RESPONSE,
    AxiosError<ApiResponseError>,
    UPDATE_PRODUCT_DESCRIPTION_PAYLOAD
  >({
    mutationKey: ["update-product-description"],
    mutationFn: async (payload: UPDATE_PRODUCT_DESCRIPTION_PAYLOAD) => {
      const { data } = await apiClient.put<UPDATE_PRODUCT_DESCRIPTION_RESPONSE>(
        API_ENDPOINTS.UPDATE_PRODUCT_DESCRIPTION(id),
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product_details", id],
      });
    },
  });
};
