import ProductItemCard from "@/components/dashboard-page/ProductItemCard";
import type { CardItemInformation } from "@/types/CardItem";
import type { PRODUCTS_BY_SUB_CATEGORY_ID } from "@/types/Product";

function ProductContainer({ data }: { data: PRODUCTS_BY_SUB_CATEGORY_ID[] }) {
	const items = data.map((product) => {
		const res = {
			id: product.id,
			productName: product.name,
			currentPrice: product.currentPrice,
			buyNowPrice: product.buyNowPrice,
			productImage: product.thumbnailImage,
			publishedDate: product.endTime,
			remainingTime: product.timeRemaining,
			bidCount: product.bidCount,
			categoryName: product.categoryName,
		} as CardItemInformation;
		return res;
	});

	return (
		<div className="grid grid-cols-3 gap-8">
			{items.map((item) => (
				<ProductItemCard key={item.id} data={item} />
			))}
		</div>
	);
}

export default ProductContainer;
