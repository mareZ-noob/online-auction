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
import DashboardParallex from "./DashboardParallex";

function DashboardPage() {
  const { t } = useTranslation();

  const { data: endingSoonProducts } = useFetchEndingSoonProducts();
  const { data: topMostBidProducts } = useFetchTopMostBidProducts();
  const { data: topHighestPriceProducts } = useFetchTopHighestPriceProducts();

  return (
    <div>
      <DashboardParallex />
      <section className="mt-24">
        <p className="mb-24 pb-8 mx-16 text-4xl uppercase border-b-2 border-black">
          {t("dashboard.endingSoonProducts")}
        </p>
        <CarouselPlugin className="bg-black -mx-16 px-32 py-16">
          {endingSoonProducts &&
            endingSoonProducts.map((product) => (
              <CarouselCardItem
                key={product.id}
                data={CardItemInformationMapper(product)}
              />
            ))}
        </CarouselPlugin>
      </section>
      <section className="mt-24 px-16">
        <p className="mb-24 pb-8 text-4xl uppercase border-b-2 border-black">
          {t("dashboard.top5MostBiddedProducts")}
        </p>
        <Products
          data={
            topMostBidProducts
              ? topMostBidProducts.map(CardItemInformationMapper)
              : []
          }
          animation={{ reveal: true }}
        />
      </section>

      <section className="mt-24 px-16">
        <p className="mb-24 pb-8 text-4xl uppercase border-b-2 border-black">
          {t("dashboard.top5HighestPricedProducts")}
        </p>
        <Products
          data={
            topHighestPriceProducts
              ? topHighestPriceProducts.map(CardItemInformationMapper)
              : []
          }
          animation={{ reveal: true }}
        />
      </section>
    </div>
  );
}

export default DashboardPage;
