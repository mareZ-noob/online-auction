import {Button} from "@/components/ui/button.tsx";
import type {CarouselCardItemInformation} from "@/types/CarouselCardItem";

function CarouselCardItem({ data }: { data: CarouselCardItemInformation }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="grid w-full min-h-full grid-cols-2">
                <div className="flex flex-col justify-end text-left ml-[20%] mb-[10%] max-w-sm">
                    <p className="text-4xl mb-4">{data.productName}</p>
                    <div className="flex mb-4 gap-16">
                        <p>Current Price: {data.productPrice}</p>
                        <p>Buy Now: {data.productPriceyBuyNow}</p>
                    </div>
                    <div className="flex mb-4 gap-16">
                        <p>Bidder: {data.bidderName}</p>
                        <p>Bid Price: {data.bidderPrice}</p>
                    </div>
                    <p className="mb-4">Published Date: {data.publishedDate}</p>
                    <p className="mb-4">Remaining Time: {data.remainingTime}</p>
                    <p>Turns: {data.bidTurns}</p>

                    <Button variant="default" className=" mt-4 size-12 px-12">Bid</Button>
                </div>
                <div className="bg-muted relative block">
                    <img
                        src={data.productImage}
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
            </div>
        </div>
    )
}

export default CarouselCardItem;