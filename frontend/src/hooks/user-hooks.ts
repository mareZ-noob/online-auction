import { useMutation, useQuery, useQueries } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type {
  RATE_A_USER_PAYLOAD,
  CHANGE_PASSWORD_RESPONSE,
  RATE_A_USER_RESPONSE,
  UPDATE_USER_PROFILE_RESPONSE,
  USER_BY_ID_RESPONSE,
  USER_RATINGS_RESPONSE,
  USER_UPGRADE_TO_SELLER_PAYLOAD,
  USER_UPGRADE_TO_SELLER_REQUESTS_RESPONSE,
  USER_UPGRADE_TO_SELLER_RESPONSE,
  CHECK_A_RATED_SELLER_ON_A_PRODUCT_RESPONSE,
} from "@/types/User";
import { API_ENDPOINTS } from "./endpoints";
import { queryClient } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import type {
  PRODUCTS_BY_SUB_CATEGORY_ID,
  PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE,
} from "@/types/Product";
import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";

export const useFetchUser = (id: number | null) => {
  return useQuery<USER_BY_ID_RESPONSE["data"]>({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await apiClient.get<USER_BY_ID_RESPONSE>(
        API_ENDPOINTS.USER_BY_ID(id!)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useChangeProfile = () => {
  const id = useUserStore((state) => state.id);

  return useMutation<
    UPDATE_USER_PROFILE_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      fullName: string;
      address: string;
      dateOfBirth: string;
    }
  >({
    mutationKey: ["change-profile"],
    mutationFn: async (payload) => {
      const { data } = await apiClient.put<UPDATE_USER_PROFILE_RESPONSE>(
        API_ENDPOINTS.UPDATE_USER_PROFILE,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
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

export const useChangePassword = () => {
  const id = useUserStore((state) => state.id);

  return useMutation<
    CHANGE_PASSWORD_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      oldPassword: string;
      newPassword: string;
    }
  >({
    mutationKey: ["change-password"],
    mutationFn: async (payload) => {
      const { data } = await apiClient.put<CHANGE_PASSWORD_RESPONSE>(
        API_ENDPOINTS.UPDATE_USER_PASSWORD,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
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

export const useFetchUserRatings = (page: number = 0, size: number = 20) => {
  const userId = useUserStore((state) => state.id ?? 0);

  return useQuery<USER_RATINGS_RESPONSE["data"]>({
    queryKey: ["user-ratings", userId, page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<USER_RATINGS_RESPONSE>(
        API_ENDPOINTS.USER_RATINGS(userId, page, size)
      );
      return data.data;
    },
  });
};

export const useFetchBiddingProducts = (
  page: number = 0,
  size: number = 20
) => {
  const userId = useUserStore((state) => state.id ?? 0);

  return useQuery<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE["data"]>({
    queryKey: ["user-bidding-products", userId, page, size],
    queryFn: async () => {
      const { data } =
        await apiClient.get<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE>(
          API_ENDPOINTS.GET_CURRENT_BIDS(page, size)
        );
      return data.data;
    },
  });
};

export const useFetchWonProducts = (page: number = 0, size: number = 20) => {
  const userId = useUserStore((state) => state.id ?? 0);

  return useQuery<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE["data"]>({
    queryKey: ["user-won-products", userId, page, size],
    queryFn: async () => {
      const { data } =
        await apiClient.get<PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE>(
          API_ENDPOINTS.GET_PRODUCTS_WON(page, size)
        );
      return data.data;
    },
  });
};

export const useUpgradeToSeller = () => {
  return useMutation<
    USER_UPGRADE_TO_SELLER_RESPONSE,
    AxiosError<ApiResponseError>,
    USER_UPGRADE_TO_SELLER_PAYLOAD
  >({
    mutationKey: ["upgrade-to-seller"],
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<USER_UPGRADE_TO_SELLER_RESPONSE>(
        API_ENDPOINTS.UPGRADE_TO_SELLER,
        payload
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

export const useFetchRequestsToBecomeSeller = () => {
  return useQuery<USER_UPGRADE_TO_SELLER_REQUESTS_RESPONSE["data"]>({
    queryKey: ["requests-to-become-seller"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<USER_UPGRADE_TO_SELLER_REQUESTS_RESPONSE>(
          API_ENDPOINTS.GET_REQUESTS_TO_BECOME_SELLER
        );
      return data.data;
    },
  });
};

export const useRateASeller = () => {
  return useMutation<
    RATE_A_USER_RESPONSE,
    AxiosError<ApiResponseError>,
    RATE_A_USER_PAYLOAD
  >({
    mutationKey: ["rate-a-seller"],
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<RATE_A_USER_RESPONSE>(
        API_ENDPOINTS.RATE_A_SELLER,
        payload
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

export function useCheckRatedProducts(
  wonProducts: PRODUCTS_BY_SUB_CATEGORY_ID[]
) {
  const queries =
    useQueries<CHECK_A_RATED_SELLER_ON_A_PRODUCT_RESPONSE[]>({
      queries:
        wonProducts.map((product) => ({
          queryKey: ["check-rated-seller-on-products", product.id],
          queryFn: async () => {
            const { data } =
              await apiClient.get<CHECK_A_RATED_SELLER_ON_A_PRODUCT_RESPONSE>(
                API_ENDPOINTS.CHECK_RATED_SELLER_ON_A_PRODUCT(product.id)
              );
            return data.data;
          },
          enabled: !!wonProducts,
        })) || [],
    }) ?? [];

  // Build list of unrated product IDs
  const ratedProducts =
    queries
      .map((result, index) => {
        const product = wonProducts[index];
        if (!product) return null;

        if (result.data?.productId) {
          return product.id;
        }

        return null;
      })
      .filter(Boolean) ?? [];

  return {
    ratedProducts,
    queries,
  };
}

export const useCheckARatedProductOfBidder = (productId: number) => {
  return useQuery<CHECK_A_RATED_SELLER_ON_A_PRODUCT_RESPONSE>({
    queryKey: ["check-rated-seller-on-a-product", productId],
    queryFn: async () => {
      const { data } =
        await apiClient.get<CHECK_A_RATED_SELLER_ON_A_PRODUCT_RESPONSE>(
          API_ENDPOINTS.CHECK_RATED_SELLER_ON_A_PRODUCT(productId)
        );

      return data;
    },
    enabled: !!productId,
  });
};
