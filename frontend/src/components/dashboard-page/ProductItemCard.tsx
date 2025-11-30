import type { CardItemInformation } from "@/types/CardItem";
import { Button } from "@/components/ui/button.tsx";

function ProductItemCard({ data }: { data: CardItemInformation }) {
	return (
		<div className="flex flex-col">
			<div className="bg-muted min-h-[400px] relative block">
				<img
					src={data.productImage}
					alt="Image"
					className="absolute inset-0 h-[400px] w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>

			<div className="flex flex-col justify-end text-left max-w-full mt-4">
				<p className="text-2xl mb-4">{data.productName}</p>
				<div className="flex mb-4 justify-between">
					<p>Current Price: {data.currentPrice}</p>
					<p>Buy Now: {data.buyNowPrice}</p>
				</div>
				<div className="flex mb-4 justify-between">
					<p>Bidder: {data.bidderName}</p>
					<p>Bid Price: {data.bidderPrice}</p>
				</div>
				<p className="mb-4">Published Date: {data.publishedDate}</p>
				<p className="mb-4">Remaining Time: {data.remainingTime}</p>
				<p>Current Bid Count: {data.bidTurns}</p>

				<div className="ml-auto">
					<Button variant="default" className=" mt-4 size-12 px-12 mr-4">
						View details
					</Button>
					<Button variant="default" className=" mt-4 size-12 px-12">
						Bid
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ProductItemCard;
