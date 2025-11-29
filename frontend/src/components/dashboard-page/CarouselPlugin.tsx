"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import CarouselCardItem from "@/components/dashboard-page/CarouselCardItem.tsx";
import type {CardItemInformation} from "@/types/CardItem";

export function CarouselPlugin() {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    const fakeData = {
        productName: "Iphone 17 of Elon Musk",
        productPrice:  1000,
        productPriceyBuyNow: 9999,
        productImage: "https://www.macobserver.com/wp-content/uploads/2025/09/iphone-17-wallpapers.png",
        bidderName: "Donald Trump",
        bidderPrice: 2000,
        publishedDate: "November 29th, 2025 | 7:00 AM",
        remainingTime:  "1 hour",
        bidTurns: 10,
    } as CardItemInformation;

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full relative"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent className="w-full -ml-0">
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="w-full p-0">
                        <div className="p-1">
                            <Card className="p-0 rounded-none border-none shadow-none">
                                <CardContent className="flex aspect-[21/9] items-center justify-center p-0">
                                    <CarouselCardItem
                                        data={fakeData}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-50 size-12" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-50 size-12" />
        </Carousel>

    )
}
