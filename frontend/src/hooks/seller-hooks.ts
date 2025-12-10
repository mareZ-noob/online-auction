import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import apiClient from "@/query/api-client";
import type { ApiResponseError } from "@/types/ApiResponse";
import type {
  BLOCK_A_BIDDER_FROM_A_PRODUCT_PAYLOAD,
  BLOCK_A_BIDDER_FROM_A_PRODUCT_RESPONSE,
  CREATE_PRODUCT_PAYLOAD,
  CREATE_PRODUCT_RESPONSE,
  GET_UNANSWERED_QUESTIONS_RESPONSE,
  POST_ANSWER_TO_QUESTION_PAYLOAD,
  UPDATE_PRODUCT_DESCRIPTION_PAYLOAD,
  UPDATE_PRODUCT_DESCRIPTION_RESPONSE,
} from "@/types/Seller";
import { API_ENDPOINTS } from "./endpoints";
import type { SELLER_PUBLISHED_PRODUCTS } from "@/types/Product";
import { queryClient } from "@/lib/utils";
import type { POST_ANSWER_TO_QUESTION_RESPONSE } from "@/types/Seller";

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

export const usePostAnswerToAQuestionProduct = (
  questionId: number | string
) => {
  return useMutation<
    POST_ANSWER_TO_QUESTION_RESPONSE,
    AxiosError<ApiResponseError>,
    POST_ANSWER_TO_QUESTION_PAYLOAD
  >({
    mutationKey: ["post_answer_to_a_question_product", questionId],
    mutationFn: async (payload: POST_ANSWER_TO_QUESTION_PAYLOAD) => {
      const { data } = await apiClient.post<POST_ANSWER_TO_QUESTION_RESPONSE>(
        API_ENDPOINTS.ANSWER_A_QUESTION_ON_PRODUCT(questionId),
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_questions_of_a_product"],
      });
    },
  });
};

export const useBlockABidderFromAProduct = () => {
  return useMutation<
    BLOCK_A_BIDDER_FROM_A_PRODUCT_RESPONSE,
    AxiosError<ApiResponseError>,
    BLOCK_A_BIDDER_FROM_A_PRODUCT_PAYLOAD
  >({
    mutationKey: ["block_a_bidder_from_a_product"],
    mutationFn: async (payload: BLOCK_A_BIDDER_FROM_A_PRODUCT_PAYLOAD) => {
      const { data } =
        await apiClient.post<BLOCK_A_BIDDER_FROM_A_PRODUCT_RESPONSE>(
          API_ENDPOINTS.BLOCK_A_BIDDER_FROM_A_PRODUCT(
            payload.productId,
            payload.bidderId
          )
        );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bidHistoryOfAProduct", variables.productId],
      });
    },
  });
};

export const useFetchUnansweredQuestions = (
  page: number = 0,
  size: number = 20
) => {
  return useQuery({
    queryKey: ["unanswered-questions", page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<GET_UNANSWERED_QUESTIONS_RESPONSE>(
        API_ENDPOINTS.GET_UNANSWERED_QUESTIONS(page, size)
      );
      return data.data;
    },
  });
};
