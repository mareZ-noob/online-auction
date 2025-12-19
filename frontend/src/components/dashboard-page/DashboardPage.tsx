import { CarouselPlugin } from "@/components/dashboard-page/CarouselPlugin.tsx";
import Products from "@/components/dashboard-page/Products.tsx";
import CarouselCardItem from "@/components/dashboard-page/CarouselCardItem.tsx";
import {
  useFetchEndingSoonProducts,
  useFetchTopHighestPriceProducts,
  useFetchTopMostBidProducts,
} from "@/hooks/product-hooks";
import { CardItemInformationMapper } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function DashboardPage() {
  const { t } = useTranslation();

  const { data: endingSoonProducts } = useFetchEndingSoonProducts();
  const { data: topMostBidProducts } = useFetchTopMostBidProducts();
  const { data: topHighestPriceProducts } = useFetchTopHighestPriceProducts();

  return (
    <div className="mt-28">
      <section className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Bid with Confidence. Own with Style.
        </h1>

        <p className="mt-4 mb-28 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed text-gray-600">
          {t("dashboard.description")}
        </p>

        <CarouselPlugin>
          {endingSoonProducts &&
            endingSoonProducts.map((product) => (
              <CarouselCardItem
                key={product.id}
                data={CardItemInformationMapper(product)}
              />
            ))}
        </CarouselPlugin>
      </section>
      <section className="mt-24">
        <p className="mb-12 text-4xl uppercase">
          {t("dashboard.top5MostBiddedProducts")}
        </p>
        <Products
          data={
            topMostBidProducts
              ? topMostBidProducts.map(CardItemInformationMapper)
              : []
          }
        />
      </section>

      <section className="mt-24">
        <p className="mb-12 text-4xl uppercase">
          {t("dashboard.top5HighestPricedProducts")}
        </p>
        <Products
          data={
            topHighestPriceProducts
              ? topHighestPriceProducts.map(CardItemInformationMapper)
              : []
          }
        />
      </section>
    </div>
  );
}

export default DashboardPage;
