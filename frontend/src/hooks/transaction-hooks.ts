import apiClient from "@/query/api-client";
import type {
  BUYER_PURCHASES_TRANSACTION_RESPONSE,
  CANCEL_TRANSACTION_RESPONSE,
  CONFITM_DELIVERY_RESPONSE,
  INITIATE_PAYMENT_RESPONSE,
  SELLER_SALES_TRANSACTION_RESPONSE,
  SHIP_TRACKING_RESPONSE,
  TRANSACTION_RATE_PAYLOAD,
  TRANSACTION_RATE_RESPONSE,
  TRANSACTION_RESPONSE,
  UPDATE_SHIPPING_ADDRESS_RESPONSE,
} from "@/types/Transaction";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";
import { queryClient } from "@/lib/utils";

export const useGetTransactionByProductId = (productId: number) => {
  return useQuery<{
    data: TRANSACTION_RESPONSE["data"];
    transactionId: number;
  }>({
    queryKey: ["transaction-by-product-id", productId],
    queryFn: async () => {
      const { data } = await apiClient.get<TRANSACTION_RESPONSE>(
        API_ENDPOINTS.TRANSACTION_DETAILS_BY_PRODUCT(productId)
      );

      return {
        data: data.data,
        transactionId: data.data.transaction.id,
      };
    },
  });
};

export const useFetchTransactionById = (transactionId: number) => {
  return useQuery<TRANSACTION_RESPONSE>({
    queryKey: ["transaction-by-id", transactionId],
    queryFn: async () => {
      const { data } = await apiClient.get<TRANSACTION_RESPONSE>(
        API_ENDPOINTS.TRANSACTION_BY_ID(transactionId)
      );

      return data;
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation<
    INITIATE_PAYMENT_RESPONSE["data"],
    AxiosError<ApiResponseError>,
    {
      transactionId: number;
      currency: string;
    }
  >({
    mutationKey: ["initiate-payment"],
    mutationFn: async ({ transactionId, currency }) => {
      const { data } = await apiClient.post<INITIATE_PAYMENT_RESPONSE>(
        API_ENDPOINTS.INITIATE_PAYMENT(transactionId),
        undefined,
        {
          params: { currency },
        }
      );

      return data.data;
    },
  });
};

export const useUpdateShippingAddress = (productId?: number) => {
  return useMutation<
    UPDATE_SHIPPING_ADDRESS_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      transactionId: number;
      shippingAddress: string;
    }
  >({
    mutationKey: ["update-shipping-address"],
    mutationFn: async ({ transactionId, shippingAddress }) => {
      const { data } = await apiClient.put<UPDATE_SHIPPING_ADDRESS_RESPONSE>(
        API_ENDPOINTS.UPDATE_SHIPPING_ADDRESS(transactionId),
        {
          shippingAddress,
        }
      );

      return data;
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["transaction-by-product-id", Number(productId)],
        });
      }
    },
  });
};

export const useTrackingShipment = (productId?: number) => {
  return useMutation<
    SHIP_TRACKING_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      transactionId: number;
      trackingNumber: string;
    }
  >({
    mutationKey: ["track-shipment"],
    mutationFn: async ({ transactionId, trackingNumber }) => {
      const { data } = await apiClient.post<SHIP_TRACKING_RESPONSE>(
        API_ENDPOINTS.SHIP_TRACKING(transactionId),
        {
          trackingNumber,
        }
      );

      return data;
    },
    onSuccess: (_data, _variables) => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["transaction-by-product-id", Number(productId)],
        });
      }
    },
  });
};

export const useConfirmDelivery = (productId?: number) => {
  return useMutation<
    CONFITM_DELIVERY_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      transactionId: number;
    }
  >({
    mutationKey: ["confirm-delivery"],
    mutationFn: async ({ transactionId }) => {
      const { data } = await apiClient.post<CONFITM_DELIVERY_RESPONSE>(
        API_ENDPOINTS.CONFIRM_DELIVERY(transactionId)
      );

      return data;
    },
    onSuccess: (_data, _variables) => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["transaction-by-product-id", Number(productId)],
        });
      }
    },
  });
};

export const useCancelTransaction = (page?: number) => {
  return useMutation<
    CANCEL_TRANSACTION_RESPONSE,
    AxiosError<ApiResponseError>,
    {
      transactionId: number;
      reason: string;
    }
  >({
    mutationKey: ["cancel-transaction"],
    mutationFn: async ({ transactionId, reason }) => {
      const { data } = await apiClient.post<CANCEL_TRANSACTION_RESPONSE>(
        API_ENDPOINTS.CANCEL_TRANSACTION(transactionId),
        {
          reason,
        }
      );

      return data;
    },
    onSuccess: (_data, _variables) => {
      if (page === undefined || isNaN(page)) return;

      queryClient.invalidateQueries({
        queryKey: ["seller-sales-transactions", page],
      });
    },
  });
};

export const useFetchSellerSales = (page: number, size: number = 20) => {
  return useQuery<SELLER_SALES_TRANSACTION_RESPONSE["data"]>({
    queryKey: ["seller-sales-transactions", page],
    queryFn: async () => {
      const { data } = await apiClient.get<SELLER_SALES_TRANSACTION_RESPONSE>(
        API_ENDPOINTS.SELLER_SALES,
        {
          params: {
            page,
            size,
          },
        }
      );

      return data.data;
    },
  });
};

export const useFetchBuyerPurchases = (page: number, size: number = 20) => {
  return useQuery<BUYER_PURCHASES_TRANSACTION_RESPONSE["data"]>({
    queryKey: ["buyer-purchases-transactions", page],
    queryFn: async () => {
      const { data } =
        await apiClient.get<BUYER_PURCHASES_TRANSACTION_RESPONSE>(
          API_ENDPOINTS.BUYER_PURCHASES,
          {
            params: {
              page,
              size,
            },
          }
        );
      return data.data;
    },
  });
};

export const useRateTransaction = () => {
  return useMutation<
    TRANSACTION_RATE_RESPONSE["data"],
    AxiosError<ApiResponseError>,
    TRANSACTION_RATE_PAYLOAD
  >({
    mutationKey: ["rate-transaction"],
    mutationFn: async (payload: TRANSACTION_RATE_PAYLOAD) => {
      const { data } = await apiClient.post<TRANSACTION_RATE_RESPONSE>(
        API_ENDPOINTS.RATE_TRANSACTION,
        payload
      );

      return data.data;
    },
  });
};
