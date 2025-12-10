import type { PRODUCT_DETAILS } from "@/types/Product";
import ProductBid from "./product-bid/ProductBid";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePlaceABid } from "@/hooks/bid-hooks";
import { toastError, toastSuccess } from "@/components/toast/toast-ui";

const ProductInfo = ({ data }: { data: Omit<PRODUCT_DETAILS, "images"> }) => {
  const { mutate, isPending } = usePlaceABid();

  const handleSubmitBid = (productId: number, buyNowPrice: number) => {
    mutate(
      {
        productId: productId,
        amount: buyNowPrice,
        maxAutoBidAmount: null,
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message);
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  return (
    <div>
      <div className="flex justify-end">
        <p className="text-2xl">{data.name}</p>
        <Button
          variant="default"
          className="ml-auto"
          onClick={() => handleSubmitBid(data.id, data.buyNowPrice)}
        >
          {isPending ? "Buying..." : "Buy Now"}
        </Button>
      </div>
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
      <p className="mb-4 text-lg">
        Posted Time: {formatDateTime(data.startTime)}
      </p>
      <p className="mb-4 text-lg">End Time: {formatDateTime(data.endTime)}</p>
      <p className="mb-4 text-lg">Time Remaining: {data.timeRemaining}</p>

      <div className="border-b border-gray-200 my-4" />
      <p className="mb-4 text-lg">Step Price: {data.stepPrice}</p>
      <ProductBid
        productId={data.id}
        currentPrice={data.currentPrice}
        stepPrice={data.stepPrice}
      />
      <div className="border-b border-gray-200 my-4" />

      <p className="mb-4 text-lg">Seller Name: {data.sellerName}</p>
      <p className="mb-4 text-lg">Seller Rating: {data.sellerRating}</p>
    </div>
  );
};

export default ProductInfo;
