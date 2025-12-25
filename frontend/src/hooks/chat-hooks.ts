import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/query/api-client";
import type {
  GET_ALL_CHATS_RESPONSE,
  SEND_CHAT_PAYLOAD,
  SEND_CHAT_RESPONSE,
} from "@/types/Chat";
import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";
import { API_ENDPOINTS } from "./endpoints";

export const useSendChat = () => {
  return useMutation<
    SEND_CHAT_RESPONSE,
    AxiosError<ApiResponseError>,
    SEND_CHAT_PAYLOAD
  >({
    mutationKey: ["send-chat"],
    mutationFn: async (payload: SEND_CHAT_PAYLOAD) => {
      const { data } = await apiClient.post<SEND_CHAT_RESPONSE>(
        API_ENDPOINTS.SEND_CHAT,
        payload
      );
      return data;
    },
  });
};

export const useFetchAllChatsByTransactionId = (
  transactionId: number,
  page: number,
  size: number = 15
) => {
  return useQuery<GET_ALL_CHATS_RESPONSE["data"], AxiosError<ApiResponseError>>(
    {
      queryKey: ["all-chats", transactionId, page],
      queryFn: async () => {
        const { data } = await apiClient.get<GET_ALL_CHATS_RESPONSE>(
          API_ENDPOINTS.GET_ALL_CHATS(transactionId),
          {
            params: {
              page,
              size,
            },
          }
        );
        return data.data;
      },
      enabled: !!transactionId,
    }
  );
};
