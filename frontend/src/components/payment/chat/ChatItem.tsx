import { cn } from "@/lib/utils";
import type { SEND_CHAT } from "@/types/Chat";

function ChatItem({
  messages,
  currentUserName,
}: {
  messages: SEND_CHAT[];
  currentUserName: string;
}) {
  return (
    <div className="px-2 py-3 space-y-2">
      {/* Chat history */}
      {messages
        .slice()
        .reverse()
        .map((chat) => {
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
                {chat.message}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default ChatItem;
