export type Seller = {
	id: string;
	name: string;
	rating: number;
	totalReviews?: number;
};

export type Bidder = {
	id: string;
	name: string;
	rating: number;
	totalReviews?: number;
};

export type ProductImage = {
	url: string;
	alt?: string;
};

export type ProductTimeInfo = {
	postedAt: string;
	endsAt: string;
};

export type ProductDetail = {
	id: string;

	mainImage: ProductImage;
	subImages: ProductImage[];

	productName: string;
	currentPrice: number;
	buyNowPrice?: number;

	seller: Seller;

	highestBidder?: Bidder;

	timeInfo: ProductTimeInfo;

	description: string;
};
