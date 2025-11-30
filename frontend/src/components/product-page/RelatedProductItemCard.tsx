import type {CardItemInformation} from "@/types/CardItem";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {CarouselItem} from "@/components/ui/carousel.tsx";
import ProductItemCard from "@/components/dashboard-page/ProductItemCard.tsx";

function RelatedProductItemCard({data}: {data: CardItemInformation}) {
    return (
        <CarouselItem className="w-full p-0 basis-1/3">
            <div className="p-1">
                <Card className="p-0 rounded-none border-none shadow-none">
                    <CardContent className="flex aspect-[21/9] items-center justify-center p-0">
                        <ProductItemCard data={data} height={200} />
                    </CardContent>
                </Card>
            </div>
        </CarouselItem>
    )
}

export default RelatedProductItemCard;