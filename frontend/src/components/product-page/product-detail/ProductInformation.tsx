import type { PRODUCT_DETAILS } from "@/types/Product";
import ProductBid from "./product-bid/ProductBid";

const ProductInfo = ({
  data,
}: {
  data: Omit<PRODUCT_DETAILS, "id" | "images">;
}) => {
  return (
    <div>
      <p className="text-2xl">{data.name}</p>
      <div className="border-b border-gray-200 my-4" />
      <div className="flex justify-between mb-4 text-lg">
        <p>Current Price: {data.currentPrice}</p>
        <p>Buy Now Price: {data.buyNowPrice}</p>
      </div>
      <div className="flex justify-between text-lg">
        <p className="mb-4 text-lg">
          Highest Bidder Name:{" "}
          {data.currentBidderName ? data.currentBidderName : "N/A"}
        </p>
        <p className="mb-4 text-lg">
          Bidder's Rating:{" "}
          {data.currentBidderRating ? data.currentBidderRating : "N/A"}
        </p>
      </div>
      <p className="mb-4 text-lg">Posted Time: {data.startTime}</p>
      <p className="mb-4 text-lg">End Time: {data.endTime}</p>
      <p className="mb-4 text-lg">Time Remaining: {data.timeRemaining}</p>

      <div className="border-b border-gray-200 my-4" />
      <p className="mb-4 text-lg">Step Price: {data.stepPrice}</p>
      <ProductBid currentPrice={data.currentPrice} stepPrice={data.stepPrice} />
      <div className="border-b border-gray-200 my-4" />

      <p className="mb-4 text-lg">Seller Name: {data.sellerName}</p>
      <p className="mb-4 text-lg">Seller Rating: {data.sellerRating}</p>
    </div>
  );
};

export default ProductInfo;
