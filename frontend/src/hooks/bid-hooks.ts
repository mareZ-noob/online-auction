import { useMutation, useQuery } from "@tanstack/react-query";

import apiClient from "@/query/api-client";
import type {
  BID_HISTORY_OF_A_PRODUCT_RESPONSE,
  MY_BID_HISTORY_RESPONSE,
  PLACE_A_BID_RESPONSE,
} from "@/types/Bid";

import { API_ENDPOINTS } from "./endpoints";
import { queryClient } from "@/lib/utils";
import type { ApiResponseError } from "@/types/ApiResponse";
import type { AxiosError } from "axios";

export const useFetchMyBidHistory = () => {
  return useQuery<MY_BID_HISTORY_RESPONSE, Error>({
    queryKey: ["myBidHistory"],
    queryFn: async () => {
      const response = await apiClient.get<MY_BID_HISTORY_RESPONSE>(
        API_ENDPOINTS.GET_MY_BID_HISTORY
      );
      return response.data;
    },
  });
};

export const usePlaceABid = () => {
  return useMutation<
    PLACE_A_BID_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      productId: number;
      amount: number | null;
      maxAutoBidAmount: number | null;
    }
  >({
    mutationKey: ["placeABid"],
    mutationFn: async (credentials: {
      productId: number;
      amount: number | null;
      maxAutoBidAmount: number | null;
    }) => {
      const response = await apiClient.post<PLACE_A_BID_RESPONSE>(
        API_ENDPOINTS.PLACE_A_BID,
        credentials
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bidHistoryOfAProduct"] });
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

export const useFetchBidHistoryOfAProduct = (productId: number) => {
  return useQuery<BID_HISTORY_OF_A_PRODUCT_RESPONSE, Error>({
    queryKey: ["bidHistoryOfAProduct", productId],
    queryFn: async () => {
      const response = await apiClient.get<BID_HISTORY_OF_A_PRODUCT_RESPONSE>(
        API_ENDPOINTS.GET_BID_HISTORY_OF_A_PRODUCT(productId)
      );
      return response.data;
    },
    enabled: !!productId,
  });
};
