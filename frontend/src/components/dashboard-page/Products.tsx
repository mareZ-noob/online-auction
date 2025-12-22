import ProductItemCard, {
  type AnimationProps,
} from "@/components/dashboard-page/ProductItemCard.tsx";
import type { CardItemInformation } from "@/types/CardItem";

function Products({
  data,
  animation,
}: {
  data: CardItemInformation[];
  animation?: AnimationProps;
}) {
  return (
    <div className="grid grid-cols-3 gap-16">
      {data.map((item) => (
        <ProductItemCard
          key={item.id}
          data={item}
          className="w-full"
          animation={animation}
        />
      ))}
    </div>
  );
}

export default Products;
