import { ApiResponse, Pagination } from "./ApiResponse";

export type PRODUCT = {
	id: number;
	name: string;
	description: string;
	currentPrice: number;
	buyNowPrice: number;
	thumbnailImage: string;
	currentBidderName: string;
	endTime: string;
	timeRemaining: string;
	bidCount: number;
	isNew: boolean;
	categoryName: string;
	createdAt: string;
	sellerId: number;
	sellerName: string;
};

export type PRODUCT_RESPONSE = ApiResponse<Pagination<PRODUCT>>;

export type DELETE_A_PRODUCT_PAYLOAD = {
	id: number;
};

export type DELETE_A_PRODUCT = {
	data: string;
};

export type DELETE_A_PRODUCT_RESPONSE = ApiResponse<DELETE_A_PRODUCT>;
