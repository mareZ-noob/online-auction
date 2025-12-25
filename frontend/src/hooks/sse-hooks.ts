import { createSSE } from "@/config/sse";
import type {
  LATEST_BID,
  LEADERBOARD,
  PRODUCT_NOTIFICATION_RESPONSE,
  PRODUCT_NOTIFICATION_WINNER_RESPONSE,
} from "@/types/SSE";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "./endpoints";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { useAuthStore } from "@/store/auth-store";
import type { MESSAGE_SSE_RESPONSE } from "@/types/Chat";

const BASE_URL = import.meta.env.VITE_API_SSE_BASE_URL;

const isProductNotificationResponse = (
  data: PRODUCT_NOTIFICATION_RESPONSE | PRODUCT_NOTIFICATION_WINNER_RESPONSE
): data is PRODUCT_NOTIFICATION_RESPONSE => {
  return "latestBid" in data && "leaderboard" in data;
};

export const useProductSSE = (productId: string | number) => {
  const [latestBid, setLatestBid] = useState<LATEST_BID | null>(null);
  const [leaderboard, setLeaderboard] = useState<LEADERBOARD[]>([]);

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!productId || !token) return;

    const controller = new AbortController();

    createSSE<
      PRODUCT_NOTIFICATION_RESPONSE | PRODUCT_NOTIFICATION_WINNER_RESPONSE
    >({
      url: `${BASE_URL}${API_ENDPOINTS.PRODUCT_NOTIFICATION_SSE(productId)}`,
      token,
      signal: controller.signal,

      onOpen(response) {
        if (!response.ok) {
          toastError(`SSE connection failed: ${response.status}`);
          throw new Error("SSE connection failed");
        }

        console.log("Product SSE connected");
      },

      onMessage(data) {
        if (isProductNotificationResponse(data)) {
          setLatestBid(data.latestBid);
          setLeaderboard(data.leaderboard);

          toastSuccess(
            `New bid: $${data.latestBid.amount} by ${data.latestBid.bidderName}`
          );
        } else {
          toastSuccess(
            `Auction won by ${data.winnerName} for $${data.finalAmount}`
          );
        }
      },

      onError(err) {
        console.error("SSE error", err);
        toastError("Live updates disconnected");
      },

      onClose() {
        console.log("Product SSE closed");
      },
    });

    return () => {
      controller.abort();
      console.log("Product SSE aborted");
    };
  }, [productId]);

  return {
    latestBid,
    leaderboard,
    leadBidder: leaderboard.length > 0 ? leaderboard[0] : null,
  };
};

export const useChatSSE = (transactionId: number, enabled: boolean) => {
  const [latestMessage, setLatestMessage] = useState<
    MESSAGE_SSE_RESPONSE["data"] | null
  >(null);

  useEffect(() => {
    if (!enabled) return;

    const token = useAuthStore.getState().token;

    if (!transactionId || !token) return;

    const controller = new AbortController();

    createSSE<MESSAGE_SSE_RESPONSE["data"]>({
      url: `${BASE_URL}${API_ENDPOINTS.CHAT_MESSAGE_SSE(transactionId)}`,
      token,
      signal: controller.signal,

      onOpen(response) {
        if (!response.ok) {
          toastError(`SSE connection failed: ${response.status}`);
          throw new Error("SSE connection failed");
        }

        console.log("Chat SSE connected");
      },

      onMessage(data) {
        setLatestMessage(data);
      },

      onError(err) {
        console.error("Chat SSE error", err);
        toastError("Chat live updates disconnected");
      },

      onClose() {
        console.log("Chat SSE closed");
      },
    });

    return () => {
      controller.abort();
      console.log("Chat SSE aborted");
      setLatestMessage(null);
    };
  }, [transactionId, enabled]);

  return latestMessage;
};
