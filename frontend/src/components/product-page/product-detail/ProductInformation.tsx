import type { ProductDetail } from "@/types/ProductDetail";

const ProductInfo = ({
	data,
}: {
	data: Omit<ProductDetail, "id" | "mainImage" | "subImages">;
}) => {
	return (
		<div>
			<p className="text-2xl">{data.productName}</p>
			<div className="border-b border-gray-100 my-4" />
			<div className="flex gap-16 mb-4 text-lg">
				<p>Current Price: {data.currentPrice}</p>
				<p>Buy Now Price: {data.buyNowPrice}</p>
			</div>
			<p className="mb-4 text-lg">Seller Name: {data.seller.name}</p>
			<p className="mb-4 text-lg">Seller Rating: {data.seller.rating}</p>
			<p className="mb-4 text-lg">
				Highest Bidder Name:{" "}
				{data.highestBidder ? data.highestBidder.name : "N/A"}
			</p>
			<p className="mb-4 text-lg">
				Highest Bidder Rating:{" "}
				{data.highestBidder ? data.highestBidder.rating : "N/A"}
			</p>
			<p className="mb-4 text-lg">Posted Time: {data.timeInfo.postedAt}</p>
			<p className="mb-4 text-lg">End Time: {data.timeInfo.endsAt}</p>
		</div>
	);
};

export default ProductInfo;
