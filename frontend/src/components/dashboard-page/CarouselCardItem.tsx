import { Button } from "@/components/ui/button.tsx";
import type { CardItemInformation } from "@/types/CardItem";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { CarouselItem } from "@/components/ui/carousel.tsx";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function CarouselCardItem({ data }: { data: CardItemInformation }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                    <p>
                      {t("product.currentPrice")}:{" "}
                      {formatCurrency(data.currentPrice)}
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
                      {t("product.bidPrice")}:{" "}
                      {formatCurrency(data.bidderPrice)}
                    </p>
                  </div>
                  <p className="mb-4">
                    {t("product.publishedDate")}:{" "}
                    {formatDateTime(data.publishedDate)}
                  </p>
                  <p className="mb-4">
                    {t("product.remainingTime")}: {data.remainingTime}
                  </p>
                  <p>
                    {t("product.bidCount")}: {data.bidCount}
                  </p>

                  <div className="ml-auto">
                    <Button
                      variant="default"
                      className=" mt-4 size-12 px-12 mr-4"
                      onClick={() => handleViewDetails(data.id)}
                    >
                      {t("product.viewDetails")}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted relative blockk">
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
