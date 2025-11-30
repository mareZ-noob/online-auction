import ProductItemCard from "@/components/dashboard-page/ProductItemCard.tsx";
import type { CardItemInformation } from "@/types/CardItem";

function Products() {
	const fakeData = {
		productName: "Iphone 17 of Elon Musk",
		currentPrice: 1000,
		buyNowPrice: 9999,
		productImage:
			"https://www.macobserver.com/wp-content/uploads/2025/09/iphone-17-wallpapers.png",
		bidderName: "Donald Trump",
		bidderPrice: 2000,
		publishedDate: "November 29th, 2025 | 7:00 AM",
		remainingTime: "1 hour",
		bidTurns: 10,
	} as CardItemInformation;

	return (
		<div className="grid grid-cols-3 gap-16">
			<ProductItemCard data={fakeData} />
			<ProductItemCard data={fakeData} />
			<ProductItemCard data={fakeData} />
			<ProductItemCard data={fakeData} />
			<ProductItemCard data={fakeData} />
		</div>
	);
}

export default Products;
