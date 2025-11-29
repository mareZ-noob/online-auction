import {CarouselPlugin} from "@/components/dashboard-page/CarouselPlugin.tsx";

function DashboardPage() {
	return <div className="mt-28">
		<section className="flex flex-col items-center justify-center text-center px-6">
			<h1 className="text-4xl md:text-6xl font-bold leading-tight">
				Bid with Confidence. Own with Style.
			</h1>

			<p className="mt-4 mb-28 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed text-gray-600">
				Step into a seamless auction experience where technology meets elegance.
				Explore curated items, place smart bids, and enjoy a friendly, modern
				platform designed for today’s vibrant and youthful collectors.
			</p>

			<CarouselPlugin />
		</section>
		<section>

		</section>
	</div>;
}

export default DashboardPage;
