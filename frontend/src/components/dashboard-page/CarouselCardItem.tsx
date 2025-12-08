import { Button } from "@/components/ui/button.tsx";
import type { CardItemInformation } from "@/types/CardItem";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { CarouselItem } from "@/components/ui/carousel.tsx";
import { useNavigate } from "react-router-dom";

function CarouselCardItem({ data }: { data: CardItemInformation }) {
  const navigate = useNavigate();

  const handleViewDetails = (id: number) => {
    navigate(`/products/${id}`);
  };

  return (
    <CarouselItem className="w-full p-0">
      <div className="p-1">
        <Card className="p-0 rounded-none border-none shadow-none">
          <CardContent className="flex aspect-21/9 items-center justify-center p-0">
            <div className="w-full h-full flex items-center justify-center bg-white">
              <div className="grid w-full min-h-full grid-cols-2">
                <div className="flex flex-col justify-end text-left ml-[20%] mb-[10%] max-w-md">
                  <p className="text-4xl mb-4">{data.productName}</p>
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

                  <div className="ml-auto">
                    <Button
                      variant="default"
                      className=" mt-4 size-12 px-12 mr-4"
                      onClick={() => handleViewDetails(data.id)}
                    >
                      View details
                    </Button>
                    {/* <Button variant="default" className=" mt-4 size-12 px-12">
                      Bid
                    </Button> */}
                  </div>
                </div>
                <div className="bg-muted relative block">
                  <img
                    src={data.productImage}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  );
}

export default CarouselCardItem;
