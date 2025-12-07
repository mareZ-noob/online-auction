import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddAProductToWatchList,
  useCheckAProductInWatchList,
  useRemoveAProductFromWatchList,
} from "@/hooks/watch-list-hooks";
import { Button } from "@/components/ui/button.tsx";
import type { CardItemInformation } from "@/types/CardItem";

function ProductItemCard({
  data,
  height = 400,
  isWatchList = false,
}: {
  data: CardItemInformation;
  height?: number;
  isWatchList?: boolean;
}) {
  const navigate = useNavigate();

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
    addToWatchList();
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
    <div className="flex flex-col w-sm">
      <div
        className="bg-muted relative block"
        style={{ height: `${height}px` }}
      >
        <img
          src={data.productImage}
          alt="Image"
          className="absolute top-[50%] left-[50%] inset-0 object-cover translate-x-[-50%] translate-y-[-50%] dark:brightness-[0.2] dark:grayscale"
          style={{ height: `${height}px` }}
        />
      </div>

      <div className="flex flex-col justify-end text-left max-w-full mt-4">
        <p className="text-2xl mb-4 min-h-16">{data.productName}</p>
        <div className="flex mb-4 justify-between">
          <p>Current Price: {data.currentPrice}</p>
          <p>Buy Now: {data.buyNowPrice}</p>
        </div>
        <div className="flex mb-4 justify-between">
          <p>Highest Bidder: {data.bidderName}</p>
          <p>Bid Price: {data.bidderPrice}</p>
        </div>
        <p className="mb-4">Published Date: {data.publishedDate}</p>
        <p className="mb-4">Remaining Time: {data.remainingTime}</p>
        <p>Current Bid Count: {data.bidCount}</p>

        <div className="flex items-center justify-between">
          {isWatchList ? (
            <Button
              variant="outline"
              className=" mt-4 size-12 px-12 mr-4"
              onClick={handleRemoveFromWatchList}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant="outline"
              className=" mt-4 size-12 px-12 mr-4"
              onClick={handleAddToWatchList}
            >
              {watchListButton}
            </Button>
          )}
          <div className="ml-auto">
            <Button
              variant="outline"
              className=" mt-4 size-12 px-12 mr-4"
              onClick={() => handleViewDetails(data.id)}
            >
              View details
            </Button>
            <Button variant="default" className=" mt-4 size-12 px-12">
              Bid
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItemCard;
