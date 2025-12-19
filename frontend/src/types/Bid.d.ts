import { ApiResponse, Pagination } from "./ApiResponse";

export type MY_BID_HISTORY = {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  maskedUserName: string;
  amount: number;
  isAutoBid: boolean;
  createdAt: string;
};

export type MY_BID_HISTORY_RESPONSE = ApiResponse<Pagination<MY_BID_HISTORY>>;

export type PLACE_A_BID = {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  maskedUserName: string;
  amount: number;
  isAutoBid: boolean;
  createdAt: string;
};

export type PLACE_A_BID_RESPONSE = ApiResponse<PLACE_A_BID>;

export type BID_HISTORY_OF_A_PRODUCT = {
  userId: number;
  maskedUserName: string;
  amount: number;
  blocked: boolean;
  createdAt: string;
};

export type BID_HISTORY_OF_A_PRODUCT_RESPONSE = ApiResponse<
  BID_HISTORY_OF_A_PRODUCT[]
>;
