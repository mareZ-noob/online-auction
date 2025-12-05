import { CardItemInformationMapper } from "@/lib/utils";
import ProductItemCard from "../dashboard-page/ProductItemCard";
import type { PRODUCTS_BY_SUB_CATEGORY_ID } from "@/types/Product";

function WatchListSearchResult({
  data,
}: {
  data: PRODUCTS_BY_SUB_CATEGORY_ID[];
}) {
  return (
    <div className="mt-8 grid grid-cols-3 gap-16">
      {data.map((product) => (
        <ProductItemCard
          key={product.id}
          data={CardItemInformationMapper(product)}
          isWatchList={true}
        />
      ))}
    </div>
  );
}

export default WatchListSearchResult;
