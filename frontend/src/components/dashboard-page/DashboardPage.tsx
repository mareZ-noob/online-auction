import { CarouselPlugin } from "@/components/dashboard-page/CarouselPlugin.tsx";
import Products from "@/components/dashboard-page/Products.tsx";
import CarouselCardItem from "@/components/dashboard-page/CarouselCardItem.tsx";
import type {CardItemInformation} from "@/types/CardItem";

function DashboardPage() {
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
		<div className="mt-28">
			<section className="flex flex-col items-center justify-center text-center">
				<h1 className="text-4xl md:text-6xl font-bold leading-tight">
					Bid with Confidence. Own with Style.
				</h1>

				<p className="mt-4 mb-28 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed text-gray-600">
					Step into a seamless auction experience where technology meets
					elegance. Explore curated items, place smart bids, and enjoy a
					friendly, modern platform designed for today’s vibrant and youthful
					collectors.
				</p>

				<CarouselPlugin>
					<CarouselCardItem data={fakeData} />
					<CarouselCardItem data={fakeData} />
					<CarouselCardItem data={fakeData} />
					<CarouselCardItem data={fakeData} />
					<CarouselCardItem data={fakeData} />
				</CarouselPlugin>
			</section>
			<section className="mt-24">
				<p className="mb-12 text-4xl uppercase">Top 5 Most Bidded Products</p>
				<Products />
			</section>

			<section className="mt-24">
				<p className="mb-12 text-4xl uppercase">
					Top 5 Highest-Priced Products
				</p>
				<Products />
			</section>
		</div>
	);
}

export default DashboardPage;
