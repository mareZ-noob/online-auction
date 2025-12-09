import ProductItemCard from "@/components/dashboard-page/ProductItemCard.tsx";
import type { CardItemInformation } from "@/types/CardItem";

function Products({ data }: { data: CardItemInformation[] }) {
	return (
		<div className="grid grid-cols-3 gap-16">
			{data.map((item) => (
				<ProductItemCard key={item.id} data={item} />
			))}
		</div>
	);
}

export default Products;
