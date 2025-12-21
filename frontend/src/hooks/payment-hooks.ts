import type {
  CANCEL_PAYMENT_SESSION_RESPONSE,
  CONVERT_AMOUNT_BETWEEN_CURRENCIES_RESPONSE,
  CREATE_STRIPE_CHECKOUT_SESSION_RESPONSE,
  CURRENCY_RESPONSE,
  PAYMENT_SESSION_DETAILS_RESPONSE,
  VERIFY_PAYMENT_RESPONSE,
} from "@/types/Payment";
import { useQuery, useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "./endpoints";
import apiClient from "@/query/api-client";
import type { ApiResponseError } from "@/types/ApiResponse";
import type { AxiosError } from "axios";

export const useFetchCurrenciesConvertion = (
  from: "vnd" | "usd",
  to: "vnd" | "usd",
  amount: number
) => {
  return useQuery<CONVERT_AMOUNT_BETWEEN_CURRENCIES_RESPONSE>({
    queryKey: ["convert-currency", from, to, amount],
    queryFn: async () => {
      const { data } =
        await apiClient.get<CONVERT_AMOUNT_BETWEEN_CURRENCIES_RESPONSE>(
          API_ENDPOINTS.GET_CURRENCIES_CONVERSION,
          {
            params: {
              amount,
              from,
              to,
            },
          }
        );

      return data;
    },
  });
};

export const useFetchSupportedCurrenciesWithExchangeRates = (
  transactionId: number
) => {
  return useQuery<CURRENCY_RESPONSE>({
    queryKey: ["supported-currencies-with-exchange-rates", transactionId],
    queryFn: async () => {
      const { data } = await apiClient.get<CURRENCY_RESPONSE>(
        API_ENDPOINTS.GET_SUPPORT_CURRENCIES(transactionId)
      );

      return data;
    },
  });
};

export const useFetchPaymentSessionDetails = (sessionId: string) => {
  return useQuery<PAYMENT_SESSION_DETAILS_RESPONSE>({
    queryKey: ["payment-session-details", sessionId],
    queryFn: async () => {
      const { data } = await apiClient.get<PAYMENT_SESSION_DETAILS_RESPONSE>(
        API_ENDPOINTS.GET_PAYMENT_SESSION_DETAILS(sessionId)
      );

      return data;
    },
  });
};

export const useFetchStripeVerification = (
  sessionId: string,
  transactionId: number,
  options = {}
) => {
  return useQuery<VERIFY_PAYMENT_RESPONSE>({
    queryKey: ["stripe-verification", sessionId, transactionId],
    queryFn: async () => {
      const { data } = await apiClient.get<VERIFY_PAYMENT_RESPONSE>(
        API_ENDPOINTS.VERIFY_AFTER_REDIRECT_FROM_STRIPE,
        {
          params: {
            sessionId,
            transactionId,
          },
        }
      );

      return data;
    },
    enabled: !!sessionId,
    ...options,
  });
};

export const useCancelPaymentSession = () => {
  return useMutation<
    CANCEL_PAYMENT_SESSION_RESPONSE["data"],
    AxiosError<ApiResponseError>,
    { transactionId: number }
  >({
    mutationKey: ["cancel-payment-session"],
    mutationFn: async ({ transactionId }) => {
      const { data } = await apiClient.post<CANCEL_PAYMENT_SESSION_RESPONSE>(
        API_ENDPOINTS.CANCEL_PAYMENT_SESSION(transactionId)
      );

      return data.data;
    },
  });
};

export const useCreateStripeCheckoutSession = () => {
  return useMutation<
    CREATE_STRIPE_CHECKOUT_SESSION_RESPONSE["data"],
    AxiosError<ApiResponseError>,
    { transactionId: number; currency: string }
  >({
    mutationKey: ["create-stripe-checkout-session"],
    mutationFn: async ({ transactionId, currency }) => {
      const { data } =
        await apiClient.post<CREATE_STRIPE_CHECKOUT_SESSION_RESPONSE>(
          API_ENDPOINTS.CREATE_STRIPE_CHECKOUT_SESSION,
          {
            transactionId,
            currency,
          }
        );
      return data.data;
    },
  });
};
