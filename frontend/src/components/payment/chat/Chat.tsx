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
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import type { SEND_CHAT } from "@/types/Chat";
import { useEffect, useState } from "react";

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
  const [message, setMessage] = useState("");

  const isSeller = useUserStore((state) => state.isSeller);

  const { mutate: sendMessage } = useSendChat();
  const { data: chats } = useFetchAllChatsByTransactionId(transactionId);

  const latestMessage = useChatSSE(transactionId, open);
  const [messages, setMessages] = useState<SEND_CHAT[]>([]);

  useEffect(() => {
    if (!chats?.content) return;

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
  }, [chats?.content]);

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

  const currentUserName = isSeller ? sellerName : buyerName;

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

        {/* messages */}
        <div className="h-full overflow-y-auto px-2 py-3 space-y-2">
          {/* Chat history */}
          {messages.map((chat) => {
            const isOwn =
              chat.isOwnMessage && chat.senderName === currentUserName;

            return (
              <div
                key={chat.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2 rounded-2xl wrap-break-word",
                    isOwn
                      ? "bg-black text-white rounded-br-sm"
                      : "bg-gray-200 text-gray-900 rounded-bl-sm"
                  )}
                >
                  {!isOwn && (
                    <div className="text-xs font-semibold mb-1">
                      {chat.senderName}
                    </div>
                  )}
                  {chat.message} {chat.senderName} {currentUserName}
                </div>
              </div>
            );
          })}
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
