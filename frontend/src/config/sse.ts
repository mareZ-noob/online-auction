import {
  fetchEventSource,
  type EventSourceMessage,
} from "@microsoft/fetch-event-source";

type CreateSSEParams<T> = {
  url: string;
  token?: string;
  signal: AbortSignal;
  onOpen?: (response: Response) => void;
  onMessage: (data: T, raw: EventSourceMessage) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};

export function createSSE<T>({
  url,
  token,
  signal,
  onOpen,
  onMessage,
  onError,
  onClose,
}: CreateSSEParams<T>) {
  return fetchEventSource(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,

    onopen(response) {
      return Promise.resolve(onOpen?.(response));
    },

    onmessage(event) {
      // Ignore connection event
      if (event.event === "connected") {
        console.log(event.data); // "Connected to product stream"
        return;
      }

      // Parse only JSON payloads, ignore keep-alive and other non-JSON messages
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed as T, event);
      } catch (err) {
        // Silently ignore non-JSON messages (like "keep-alive")
        // These are used to keep the connection alive
        if (event.data !== "keep-alive") {
          console.warn("Non-JSON SSE message:", event.data);
        }
      }
    },

    onerror(err) {
      onError?.(err);
      throw err; // stop auto-reconnect unless caller wants it
    },

    onclose() {
      onClose?.();
    },
  });
}
