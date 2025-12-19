import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/toast/toast-ui";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { usePlaceABid } from "@/hooks/bid-hooks";
import type { PRODUCT_DETAILS } from "@/types/Product";

import ProductBid from "./product-bid/ProductBid";

const ProductInfo = ({ data }: { data: Omit<PRODUCT_DETAILS, "images"> }) => {
  const productStatus = data.status;
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
      <p className="text-2xl mr-auto">{data.name}</p>
      <div className="border-b border-gray-200 my-4" />
      <div className="flex justify-between mb-4 text-lg">
        <p>Current Price: {formatCurrency(data.currentPrice)}</p>
        <p>Buy Now Price: {formatCurrency(data.buyNowPrice)}</p>
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

      <div className="flex items-center justify-end">
        <p
          className={cn(
            "mr-4 py-2 px-4 rounded-md",
            productStatus === "COMPLETED"
              ? "bg-[#E30B5C] text-white text-sm"
              : "bg-[#50C878] text-white text-sm"
          )}
        >
          {productStatus}
        </p>
        {productStatus !== "COMPLETED" && (
          <Button
            variant="default"
            onClick={() => handleSubmitBid(data.id, data.buyNowPrice)}
          >
            {isPending ? "Buying..." : "Buy Now"}
          </Button>
        )}
      </div>

      {productStatus !== "COMPLETED" && (
        <>
          <div className="border-b border-gray-200 my-4" />
          <p className="mb-4 text-lg">
            Step Price: {formatCurrency(data.stepPrice)}
          </p>
          <ProductBid
            productId={data.id}
            currentPrice={data.currentPrice}
            stepPrice={data.stepPrice}
          />
        </>
      )}
      <div className="border-b border-gray-200 my-4" />

      <p className="mb-4 text-lg">Seller Name: {data.sellerName}</p>
      <p className="mb-4 text-lg">
        Seller Rating: {data.sellerRating.toFixed(2) + "%"}
      </p>
    </div>
  );
};

export default ProductInfo;
