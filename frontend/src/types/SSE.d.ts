export type LATEST_BID = {
  amount: number;
  productId: number;
  bidderName: string;
  timestamp: string;
};

export type LEADERBOARD = {
  userId: number;
  maskedUserName: string;
  amount: number;
  blocked: boolean;
  createdAt: string;
};

export type PRODUCT_NOTIFICATION_RESPONSE = {
  latestBid: LATEST_BID;
  leaderboard: LEADERBOARD[];
};
