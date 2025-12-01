export type SUB_CATEGORY = {
	id: number;
	name: string;
	description: string;
	parentId: number;
	parentName: string;
};

export type CATEGORY = {
	id: number;
	name: string;
	description: string;
	children: SUB_CATEGORY[];
};

export type CATEGORY_RESPONSE = {
	success: boolean;
	message: string;
	data: CATEGORY[];
	timestamp: string;
};

export type PRODUCTS_BY_SUB_CATEGORY_ID = {
	id: number;
	name: string;
	currentPrice: number;
	buyNowPrice: number;
	thumbnailImage: string;
	endTime: string;
	timeRemaining: string;
	bidCount: number;
	isNew: boolean;
	categoryName: string;
	createAt: string;
};

export type PRODUCTS_BY_SUB_CATEGORY_ID_RESPONSE = {
	success: boolean;
	message: string;
	data: {
		content: PRODUCTS_BY_SUB_CATEGORY_ID[];
		page: number;
		size: number;
		totalElements: number;
		totalPages: number;
		last: boolean;
	};
	timestamp: string;
};
