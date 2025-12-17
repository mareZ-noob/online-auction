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
	CREATE_CATEGORY: "/admin/categories",
	UPDATE_CATEGORY: (id: string | number) => `/admin/categories/${id}`,

	// Products
	ALL_PRODUCTS: "/public/products",
	PRODUCT_DETAIL_BY_ID: (id: string | number) => `/public/products/${id}`,
	RELATED_PRODUCTS: (id: string | number) => `/public/products/${id}/related`,
	PRODUCTS_BY_SUB_CATEGORY_ID: (categoryId: string | number) =>
		`/public/products/category/${categoryId}`,
	REMOVE_PRODUCT: (id: string | number) => `/admin/products/${id}`,

	// Users
	GET_UPGRADE_REQUESTS: (page: number, size: number) =>
		`admin/upgrade-requests?page=${page}&size=${size}`,
	REVIEW_UPGRADE_REQUEST: (id: string | number | null) =>
		`admin/upgrade-requests/${id}/review`,
	GET_USERS: "/admin/users",
	GET_USER_BY_ID: (id: string | number) => `/admin/users/${id}`,

	// Dashboard
	GET_DASHBOARD_STATISTICS: "/admin/dashboard",
};
