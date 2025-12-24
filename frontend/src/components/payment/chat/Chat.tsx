import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useFetchAllChatsByTransactionId,
  useSendChat,
} from "@/hooks/chat-hooks";
import { useChatSSE } from "@/hooks/sse-hooks";
import { useUserStore } from "@/store/user-store";
import type { SEND_CHAT } from "@/types/Chat";
import { useEffect, useState } from "react";

import ChatItem from "./ChatItem";
import InfiniteScroll from "@/components/custom-ui/infinite-scroll/InfiniteScroll";

function Chat({
  triggerElement,
  transactionId,
  sellerName,
  buyerName,
}: {
  triggerElement: React.ReactNode;
  transactionId: number;
  sellerName?: string;
  buyerName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const isSeller = useUserStore((state) => state.isSeller);
  const currentUserName = isSeller ? sellerName : buyerName;

  const { mutate: sendMessage } = useSendChat();
  const { data: chats, isPending } = useFetchAllChatsByTransactionId(
    transactionId,
    page
  );

  const latestMessage = useChatSSE(transactionId, open);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<SEND_CHAT[]>([]);

  useEffect(() => {
    if (!chats?.content) return;

    setPage(chats.page);
    setHasMore(chats.page < chats.totalPages);

    setMessages((prev) => {
      const next = [...chats.content];
      const existingIds = new Set(next.map((chat) => chat.id));

      prev.forEach((chat) => {
        if (!existingIds.has(chat.id)) {
          next.push(chat);
        }
      });

      return next;
    });
  }, [chats]);

  useEffect(() => {
    if (!latestMessage) return;

    setMessages((prev) => {
      if (prev.some((chat) => chat.id === latestMessage.id)) {
        return prev;
      }

      return [...prev, latestMessage];
    });
  }, [latestMessage]);

  const handleSendChat = () => {
    if (!message.trim()) return;

    sendMessage(
      {
        transactionId,
        message,
        messageType: "TEXT",
        attachmentUrl: "",
      },
      {
        onSuccess: () => setMessage(""),
      }
    );
  };

  const handleFetchMore = () => {
    if (isPending) return;

    setPage((prev) => prev + 1);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{triggerElement}</SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat with {isSeller ? buyerName : sellerName}</SheetTitle>
          <SheetDescription>
            {isSeller ? sellerName : buyerName} is chatting with{" "}
            {isSeller ? buyerName : sellerName}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          <InfiniteScroll
            fetchMore={handleFetchMore}
            hasMore={hasMore}
            isLoading={isPending}
            loader={<div className="text-center text-xs py-2">Loading...</div>}
            endMessage={
              <div className="text-center text-xs py-2">No more messages</div>
            }
          >
            <ChatItem
              messages={messages}
              currentUserName={currentUserName || ""}
            />
          </InfiniteScroll>
        </div>

        <SheetFooter className="mt-4">
          <div className="flex w-full gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <Button onClick={handleSendChat}>Send</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default Chat;
