"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselPlugin({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className={className}>
      <Carousel
        plugins={[plugin.current]}
        className="w-full relative z-50"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="w-full ml-0">{children}</CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-50 size-12" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-50 size-12" />
      </Carousel>
    </div>
  );
}
