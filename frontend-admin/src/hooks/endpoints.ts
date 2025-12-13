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
	ROOT_CATEGORIES: "/public/categories/root",
	CREATE_CATEGORY: "/admin/categories",

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
};
