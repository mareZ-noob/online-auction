import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddAProductToWatchList,
  useCheckAProductInWatchList,
  useRemoveAProductFromWatchList,
} from "@/hooks/watch-list-hooks";
import { Button } from "@/components/ui/button.tsx";
import type { CardItemInformation } from "@/types/CardItem";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animation.tsx";

export type AnimationProps = {
  reveal?: boolean;
};

function ProductItemCard({
  data,
  height = 400,
  isWatchList = false,
  className,
  animation,
}: {
  data: CardItemInformation;
  height?: number;
  isWatchList?: boolean;
  className?: string;
  animation?: AnimationProps;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: removeFromWatchList } = useRemoveAProductFromWatchList(
    data.id
  );
  const { mutate: addToWatchList } = useAddAProductToWatchList(data.id);
  const isAddedToWatchList = useCheckAProductInWatchList(data.id);

  const [watchListButton, setWatchListButton] = useState("Follow");

  const handleViewDetails = (id: number) => {
    navigate(`/products/${id}`);
  };

  const handleAddToWatchList = () => {
    setWatchListButton("Following");
    addToWatchList(undefined, {
      onSuccess: (result) => {
        toastSuccess(result.message);
      },
      onError: (error) => {
        toastError(error);
      },
    });
  };

  const handleRemoveFromWatchList = () => {
    removeFromWatchList();
  };

  useEffect(() => {
    if (isAddedToWatchList.data) {
      setWatchListButton("Following");
    } else {
      setWatchListButton("Follow");
    }
  }, [isAddedToWatchList.data]);

  return (
    <motion.div
      className={cn(
        "flex flex-col w-sm border border-gray-100 rounded-lg p-4 bg-white",
        className
      )}
      variants={cardVariants}
      initial={animation?.reveal ? "initial" : undefined}
      whileInView={animation?.reveal ? "visible" : undefined}
      viewport={{ once: true, amount: 0.3 }}
      whileHover="hover"
    >
      <div
        className="bg-white flex items-center justify-center overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <img
          src={data.productImage}
          alt="Image"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          style={{ height: `${height}px` }}
        />
      </div>

      <div className="flex flex-col justify-end text-left max-w-full mt-4">
        <p className="line-clamp-2 text-2xl mb-4 min-h-16 ">
          {data.productName}
        </p>
        <div className="flex mb-4 justify-between">
          <p>
            {t("product.currentPrice")}: {formatCurrency(data.currentPrice)}
          </p>
          <p>
            {t("product.buyNow")}: {formatCurrency(data.buyNowPrice)}
          </p>
        </div>
        <div className="flex mb-4 justify-between">
          <p>
            {t("product.highestBidder")}:{" "}
            {data.bidderName || t("product.notAvailable")}
          </p>
          <p>
            {t("product.bidPrice")}: {formatCurrency(data.bidderPrice)}
          </p>
        </div>
        <p className="mb-4">
          {t("product.publishedDate")}: {formatDateTime(data.publishedDate)}
        </p>
        <p className="mb-4">
          {t("product.remainingTime")}: {data.remainingTime}
        </p>
        <p>
          {t("product.bidCount")}: {data.bidCount}
        </p>

        <div className="flex items-center justify-end">
          {isWatchList ? (
            <Button
              variant="outline"
              className=" mt-4 size-12 px-12 mr-4"
              onClick={handleRemoveFromWatchList}
            >
              {t("product.unfollow")}
            </Button>
          ) : (
            <Button
              variant="outline"
              className=" mt-4 size-12 px-12 mr-4"
              onClick={handleAddToWatchList}
            >
              {t("product." + watchListButton.toLowerCase())}
            </Button>
          )}
          <Button
            variant="default"
            className=" mt-4 size-12 px-12"
            onClick={() => handleViewDetails(data.id)}
          >
            {t("product.viewDetails")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductItemCard;
