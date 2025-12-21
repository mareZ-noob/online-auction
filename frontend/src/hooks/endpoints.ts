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
  UPGRADE_TO_SELLER: "/bidder/upgrade-request",
  GET_REQUESTS_TO_BECOME_SELLER: "/bidder/upgrade-requests",
  RATE_A_SELLER: "/bidder/ratings",
  CHECK_RATED_SELLER_ON_A_PRODUCT: (productId: string | number) =>
    `/bidder/ratings/check/${productId}`,

  // Seller
  CREATE_NEW_PRODUCT: "/seller/products",
  GET_MY_PRODUCTS: (page: number, size: number) =>
    `/seller/products?page=${page}&size=${size}`,
  UPDATE_PRODUCT_DESCRIPTION: (id: string | number) =>
    `/seller/products/${id}/description`,
  ANSWER_A_QUESTION_ON_PRODUCT: (questionId: string | number) =>
    `/seller/questions/${questionId}/answer`,
  BLOCK_A_BIDDER_FROM_A_PRODUCT: (
    productId: string | number,
    bidderId: string | number
  ) => `/seller/products/${productId}/block-bidder/${bidderId}`,
  GET_UNANSWERED_QUESTIONS: (page: number, size: number) =>
    `/seller/questions/unanswered?page=${page}&size=${size}`,
  GET_ALL_SALES: (page: number, size: number) =>
    `/seller/sales?page=${page}&size=${size}`,
  RATE_A_BIDDER: "/seller/ratings",
  CHECK_RATED_BIDDER_ON_A_PRODUCT: (productId: string | number) =>
    `/seller/ratings/check/${productId}`,

  // SSE
  PRODUCT_NOTIFICATION_SSE: (productId: string | number) =>
    `/notifications/stream/product/${productId}`,

  // Transaction
  TRANSACTION_DETAILS_BY_PRODUCT: (productId: string | number) =>
    `/transactions/product/${productId}`,
  TRANSACTION_BY_ID: (transactionId: string | number) =>
    `/transactions/${transactionId}`,
  SELLER_SALES: "/transactions/my-sales",
  BUYER_PURCHASES: "/transactions/my-purchases",

  INITIATE_PAYMENT: (transactionId: string | number) =>
    `/transactions/${transactionId}/payment/initiate`,
  UPDATE_SHIPPING_ADDRESS: (transactionId: string | number) =>
    `/transactions/${transactionId}/shipping-address`,
  SHIP_TRACKING: (transactionId: string | number) =>
    `/transactions/${transactionId}/ship`,
  CONFIRM_DELIVERY: (transactionId: string | number) =>
    `/transactions/${transactionId}/confirm-delivery`,

  CANCEL_TRANSACTION: (transactionId: string | number) =>
    `/transactions/${transactionId}/cancel`,

  RATE_TRANSACTION: "/transactions/rate",

  // Payment
  CREATE_STRIPE_CHECKOUT_SESSION: "/payment/create-checkout-session",
  CANCEL_PAYMENT_SESSION: (transactionId: string | number) =>
    `/payment/cancel/${transactionId}`,
  VERIFY_AFTER_REDIRECT_FROM_STRIPE: "/payment/verify",
  GET_PAYMENT_SESSION_DETAILS: (sessionId: string) =>
    `/payment/session/${sessionId}`,
  GET_SUPPORT_CURRENCIES: (transctionId: string | number) =>
    `/payment/currencies/${transctionId}`,
  GET_CURRENCIES_CONVERSION: "/payment/convert",
};
