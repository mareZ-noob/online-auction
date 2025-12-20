import { createSSE } from "@/config/sse";
import type {
  LATEST_BID,
  LEADERBOARD,
  PRODUCT_NOTIFICATION_RESPONSE,
} from "@/types/SSE";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "./endpoints";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { useAuthStore } from "@/store/auth-store";

const BASE_URL = import.meta.env.VITE_API_SSE_BASE_URL;

export const useProductSSE = (productId: string | number) => {
  const [latestBid, setLatestBid] = useState<LATEST_BID | null>(null);
  const [leaderboard, setLeaderboard] = useState<LEADERBOARD[]>([]);

  useEffect(() => {
    const token = useAuthStore.getState().token;

    if (!productId || !token) return;

    const controller = new AbortController();

    createSSE<PRODUCT_NOTIFICATION_RESPONSE>({
      url: `${BASE_URL}${API_ENDPOINTS.PRODUCT_NOTIFICATION_SSE(productId)}`,
      token,
      signal: controller.signal,

      onOpen(response) {
        if (!response.ok) {
          toastError(`SSE connection failed: ${response.status}`);
          throw new Error("SSE connection failed");
        }
      },

      onMessage(data) {
        setLatestBid(data.latestBid);
        setLeaderboard(data.leaderboard);

        toastSuccess(
          `New bid: $${data.latestBid.amount} by ${data.latestBid.bidderName}`
        );
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
    };
  }, [productId]);

  return { latestBid, leaderboard, leadBidder: leaderboard[0] };
};
