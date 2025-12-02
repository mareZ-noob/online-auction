import { Button } from "@/components/ui/button.tsx";
import type { CardItemInformation } from "@/types/CardItem";

function ProductItemCard({
  data,
  height = 400,
  isWatchList = true,
}: {
  data: CardItemInformation;
  height?: number;
  isWatchList?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="bg-muted relative block"
        style={{ height: `${height}px` }}
      >
        <img
          src={data.productImage}
          alt="Image"
          className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
          style={{ height: `${height}px` }}
        />
      </div>

      <div className="flex flex-col justify-end text-left max-w-full mt-4">
        <p className="text-2xl mb-4">{data.productName}</p>
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
          {isWatchList && (
            <Button variant="outline" className=" mt-4 size-12 px-12 mr-4">
              Follow
            </Button>
          )}
          <div className="ml-auto">
            <Button variant="outline" className=" mt-4 size-12 px-12 mr-4">
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
