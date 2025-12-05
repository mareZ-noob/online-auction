import type { PRODUCT_DETAILS } from "@/types/Product";

const ProductInfo = ({
  data,
}: {
  data: Omit<PRODUCT_DETAILS, "id" | "images">;
}) => {
  return (
    <div>
      <p className="text-2xl">{data.name}</p>
      <div className="border-b border-gray-100 my-4" />
      <div className="flex gap-16 mb-4 text-lg">
        <p>Current Price: {data.currentPrice}</p>
        <p>Buy Now Price: {data.buyNowPrice}</p>
      </div>
      <p className="mb-4 text-lg">Seller Name: {data.sellerName}</p>
      <p className="mb-4 text-lg">Seller Rating: {data.sellerRating}</p>
      <p className="mb-4 text-lg">
        Highest Bidder Name:{" "}
        {data.currentBidderName ? data.currentBidderName : "N/A"}
      </p>
      <p className="mb-4 text-lg">
        Highest Bidder Rating:{" "}
        {data.currentBidderRating ? data.currentBidderRating : "N/A"}
      </p>
      <p className="mb-4 text-lg">Posted Time: {data.startTime}</p>
      <p className="mb-4 text-lg">End Time: {data.endTime}</p>
    </div>
  );
};

export default ProductInfo;
