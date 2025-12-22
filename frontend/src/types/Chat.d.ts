import type { ApiResponse, Pagination } from "./ApiResponse";

export type SEND_CHAT_PAYLOAD = {
  transactionId: number;
  message: string;
  messageType: "TEXT";
  attachmentUrl: string;
};

export type SEND_CHAT = {
  id: number;
  transactionId: number;
  senderId: number;
  senderName: string;
  message: string;
  messageType: string;
  isRead: boolean;
  attachmentUrl: string;
  createdAt: string;
  isOwnMessage: boolean;
};

export type SEND_CHAT_RESPONSE = ApiResponse<SEND_CHAT>;
export type GET_ALL_CHATS_RESPONSE = ApiResponse<Pagination<SEND_CHAT>>;

export type MESSAGE_SSE_RESPONSE = ApiResponse<SEND_CHAT>;
