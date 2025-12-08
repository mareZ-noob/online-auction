export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_EMAIL_VERIFICATION: "/auth/resend-verification",
  REFRESH_TOKEN: "/auth/refresh-token",
  EXCHANGE_TOKEN: "/auth/exchange",

  // Categories
  ALL_CATEGORIES: "/public/categories",
  PARENT_CATEGORIES: "/public/categories/root",
  CATEGORIES_BY_ID: (id: string | number) => `/public/categories/${id}`,
  SUB_CATEGORIES: (id: string | number) => `/public/categories/${id}/children`,

  // Products
  ALL_PRODUCTS: "/public/products",
  PRODUCT_DETAIL_BY_ID: (id: string | number) => `/public/products/${id}`,
  RELATED_PRODUCTS: (id: string | number) => `/public/products/${id}/related`,
  MOST_BID_PRODUCTS: "/public/products/top/most-bids",
  HIGHEST_PRICE_PRODUCTS: "/public/products/top/highest-price",
  ENDING_SOON_PRODUCTS: "/public/products/top/ending-soon",
  PRODUCTS_BY_SUB_CATEGORY_ID: (categoryId: string | number) =>
    `/public/products/category/${categoryId}`,
  SEARCH_PRODUCTS: "/public/products/search",

  // User
  USER_BY_ID: (id: string | number) => `/user/${id}`,
  UPDATE_USER_PROFILE: "/user/profile",
  UPDATE_USER_PASSWORD: "/user/change-password",
  USER_RATINGS: (userId: string | number, page: number, size: number) =>
    `/user/${userId}/ratings?page=${page}&size=${size}`,

  // Watch List
  ADD_A_PRODUCT_TO_WATCHLIST: (productId: string | number) =>
    `bidder/watchlist/${productId}`,
  REMOVE_A_PRODUCT_FROM_WATCHLIST: (productId: string | number) =>
    `bidder/watchlist/${productId}`,
  GET_WATCHLIST_PRODUCTS: "/bidder/watchlist",
  GET_MY_WATCHLIST: "/bidder/watchlist",
  CHECK_A_PRODUCT_IN_WATCHLIST: (productId: string | number) =>
    `bidder/watchlist/check/${productId}`,

  // Comment
  POST_QUESTION_ON_A_PRODUCT: "bidder/questions",
  GET_QUESTIONS: (page: number, size: number) =>
    `/bidder/questions?page=${page}&size=${size}`,
  GET_QUESTIONS_OF_A_PRODUCT: (
    productId: string | number,
    page: number,
    size: number
  ) => `/public/products/${productId}/comments?page=${page}&size=${size}`,

  // Bid
  PLACE_A_BID: "/bidder/bids",
  GET_BID_HISTORY_OF_A_PRODUCT: (productId: string | number) =>
    `/bidder/products/${productId}/bids`,

  // Bidder
  GET_MY_BID_HISTORY: "/bidder/bids",
  GET_MY_PURCHASES: "/bidder/purchases",
  GET_PRODUCTS_WON: (page: number, size: number) =>
    `/bidder/products/won?page=${page}&size=${size}`,
  GET_CURRENT_BIDS: (page: number, size: number) =>
    `/bidder/products/bidding?page=${page}&size=${size}`,
};
