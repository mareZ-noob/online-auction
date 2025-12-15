import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PRODUCT } from "@/types/Products";

function ProductDetails({ product }: { product: PRODUCT }) {
	return (
		<div className="flex items-start gap-8">
			<img
				src={product.thumbnailImage}
				alt={product.name}
				className="mx-auto mb-4 w-64 h-64 object-contain"
			/>
			<div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">Name:</p>{" "}
					<p className="font-light">{product.name}</p>
				</div>
				<p className="mb-2">
					<p className="font-semibold">Description:</p>{" "}
					<p className="font-light">{product.description}</p>
				</p>
				<div className="flex justify-between">
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Seller Id:</p>{" "}
						<p className="font-light">{product.sellerId}</p>
					</div>
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Seller Name:</p>{" "}
						<p className="font-light">{product.sellerName}</p>
					</div>
				</div>
				<div className="flex justify-between">
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Current Price:</p>{" "}
						<p className="font-light">{formatCurrency(product.currentPrice)}</p>
					</div>
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Buy Now Price:</p>{" "}
						<p className="font-light">{formatCurrency(product.buyNowPrice)}</p>
					</div>
				</div>
				<div className="flex justify-between">
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Current Bidder Name:</p>{" "}
						<p className="font-light">{product.currentBidderName || "N/A"}</p>
					</div>
					<div className="mb-2 flex gap-2">
						<p className="font-semibold">Bid Count:</p>{" "}
						<p className="font-light">{product.bidCount}</p>
					</div>
				</div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">Is New:</p>{" "}
					<p className="font-light">{product.isNew ? "New" : "Old"}</p>
				</div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">Category Name:</p>{" "}
					<p className="font-light">{product.categoryName}</p>
				</div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">Time Remaining:</p>{" "}
					<p className="font-light">{product.timeRemaining}</p>
				</div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">End Time:</p>{" "}
					<p className="font-light">{formatDateTime(product.endTime)}</p>
				</div>
				<div className="mb-2 flex gap-2">
					<p className="font-semibold">Created At:</p>{" "}
					<p className="font-light">{formatDateTime(product.createdAt)}</p>
				</div>
			</div>
		</div>
	);
}

export default ProductDetails;
