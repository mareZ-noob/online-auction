import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "@/query/api-client";
import type { ApiResponseError } from "@/types/ApiResponse";
import type {
  CREATE_PRODUCT_PAYLOAD,
  CREATE_PRODUCT_RESPONSE,
} from "@/types/Seller";
import { API_ENDPOINTS } from "./endpoints";

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
