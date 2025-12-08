import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type {
  CHANGE_PASSWORD_RESPONSE,
  UPDATE_USER_PROFILE_RESPONSE,
  USER_BY_ID_RESPONSE,
  USER_RATINGS_RESPONSE,
} from "@/types/User";
import { API_ENDPOINTS } from "./endpoints";
import { queryClient } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import type { PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE } from "@/types/Product";

export const useFetchUser = (id: number) => {
  return useQuery<USER_BY_ID_RESPONSE["data"]>({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data } = await apiClient.get<USER_BY_ID_RESPONSE>(
        API_ENDPOINTS.USER_BY_ID(id)
      );
      return data.data;
    },
  });
};

export const useChangeProfile = () => {
  const id = useUserStore((state) => state.id);

  return useMutation<
    UPDATE_USER_PROFILE_RESPONSE,
    Error,
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
  });
};

export const useChangePassword = () => {
  const id = useUserStore((state) => state.id);

  return useMutation<
    CHANGE_PASSWORD_RESPONSE,
    Error,
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
