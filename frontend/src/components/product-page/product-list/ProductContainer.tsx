import ProductItemCard from "@/components/dashboard-page/ProductItemCard";
import { CardItemInformationMapper } from "@/lib/utils";
import type { CardItemInformation } from "@/types/CardItem";
import type { PRODUCTS_BY_SUB_CATEGORY_ID } from "@/types/Product";
import ProductListFallback from "./ProductListFallback";

function ProductContainer({ data }: { data: PRODUCTS_BY_SUB_CATEGORY_ID[] }) {
  const items = data.map((product) =>
    CardItemInformationMapper(product)
  ) as CardItemInformation[];

  return (
    <>
      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-8">
          {items.map((item) => (
            <ProductItemCard key={item.id} data={item} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <ProductListFallback />
        </div>
      )}
    </>
  );
}

export default ProductContainer;
