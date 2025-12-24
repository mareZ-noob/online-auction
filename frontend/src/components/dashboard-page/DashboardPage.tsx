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

import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animation";
import ParticleSky from "../custom-ui/particle-sky/ParticleSky";

function DashboardPage() {
  const { t } = useTranslation();

  const { data: endingSoonProducts } = useFetchEndingSoonProducts();
  const { data: topMostBidProducts } = useFetchTopMostBidProducts();
  const { data: topHighestPriceProducts } = useFetchTopHighestPriceProducts();

  return (
    <div>
      <DashboardParallex />
      <section className="-mx-16 relative">
        <div className="absolute inset-0 z-15 pointer-events-none">
          <ParticleSky count={100} />
        </div>

        <div className="relative">
          <p className="mb-24 pb-8 pt-24 mx-32 text-4xl uppercase border-b-2 border-black">
            {t("dashboard.endingSoonProducts")}
          </p>

          <motion.div
            variants={cardVariants}
            initial={"initial"}
            whileInView={"visible"}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative">
              <CarouselPlugin className="bg-gradient-background px-32 py-16">
                {endingSoonProducts?.map((product) => (
                  <CarouselCardItem
                    key={product.id}
                    data={CardItemInformationMapper(product)}
                  />
                ))}
              </CarouselPlugin>
            </div>
          </motion.div>
        </div>
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
