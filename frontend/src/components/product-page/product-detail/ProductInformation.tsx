import { Button } from "@/components/ui/button";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { usePlaceABid } from "@/hooks/bid-hooks";
import type { PRODUCT_DETAILS } from "@/types/Product";

import ProductBid from "./product-bid/ProductBid";
import { useTranslation } from "react-i18next";

const ProductInfo = ({ data }: { data: Omit<PRODUCT_DETAILS, "images"> }) => {
  const productStatus = data.status;
  const isCurrentUserBlocked = data.isCurrentUserBlocked;

  const { mutate, isPending } = usePlaceABid();
  const { t } = useTranslation();

  const bidderName = data.currentBidderName ?? t("product.notAvailable");
  const bidderRating =
    data.currentBidderRating !== null && data.currentBidderRating !== undefined
      ? String(data.currentBidderRating)
      : t("product.notAvailable");
  const postedTime = formatDateTime(data.startTime);
  const endTime = formatDateTime(data.endTime);
  const sellerRating = data.sellerRating
    ? `${data.sellerRating.toFixed(2)}%`
    : "N/A";

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
      {isCurrentUserBlocked && (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-16">
            <p className="text-destructive text-sm">
              Your are blocked by the seller of this product. You can not place
              a bid or comment in this product.
            </p>
            <p className="uppercase text-sm bg-destructive px-4 py-2 rounded-sm text-accent">
              Blocked
            </p>
          </div>
          <div className="border-b border-gray-200 my-4" />
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl">{data.name}</p>
        <p
          className={cn(
            "py-2 px-4 rounded-md",
            productStatus === "COMPLETED"
              ? "bg-[#E30B5C] text-white text-sm"
              : "bg-[#50C878] text-white text-sm"
          )}
        >
          {productStatus}
        </p>
      </div>
      <div className="border-b border-gray-200 my-4" />

      <div className="flex justify-between mb-4 text-lg">
        <p>
          {t("productDetail.info.currentPrice", {
            value: formatCurrency(data.currentPrice),
          })}
        </p>
        <p>
          {t("productDetail.info.buyNowPrice", {
            value: formatCurrency(data.buyNowPrice),
          })}
        </p>
      </div>

      <div className="flex justify-between text-lg">
        <p className="mb-4 text-lg">
          {t("productDetail.info.highestBidder", { value: bidderName })}
        </p>
        <p className="mb-4 text-lg">
          {t("productDetail.info.bidderRating", {
            value: Number(bidderRating)
              ? Number(bidderRating).toFixed(2) + "%"
              : "N/A",
          })}
        </p>
      </div>

      <p className="mb-4 text-lg">
        {t("productDetail.info.postedTime", { value: postedTime })}
      </p>
      <p className="mb-4 text-lg">
        {t("productDetail.info.endTime", { value: endTime })}
      </p>
      <p className="mb-4 text-lg">
        {t("productDetail.info.timeRemaining", { value: data.timeRemaining })}
      </p>

      <div className="flex items-center justify-end">
        {productStatus !== "COMPLETED" && (
          <Button
            variant="default"
            onClick={() => handleSubmitBid(data.id, data.buyNowPrice)}
            disabled={isCurrentUserBlocked || isPending}
          >
            {isPending
              ? t("productDetail.actions.buying")
              : t("productDetail.actions.buyNow")}
          </Button>
        )}
      </div>

      {productStatus !== "COMPLETED" && (
        <>
          <div className="border-b border-gray-200 my-4" />
          <p className="mb-4 text-lg">
            {t("productDetail.info.stepPrice", {
              value: formatCurrency(data.stepPrice),
            })}
          </p>
          <ProductBid
            isCurrentUserBlocked={isCurrentUserBlocked}
            productId={data.id}
            currentPrice={data.currentPrice}
            stepPrice={data.stepPrice}
          />
        </>
      )}

      <div className="border-b border-gray-200 my-4" />

      <p className="mb-4 text-lg">
        {t("productDetail.info.sellerName", { value: data.sellerName })}
      </p>
      <p className="mb-4 text-lg">
        {t("productDetail.info.sellerRating", { value: sellerRating })}
      </p>
    </div>
  );
};

export default ProductInfo;
