import { QueryClient } from "@tanstack/react-query";
import type { PRODUCTS_BY_SUB_CATEGORY_ID } from "@/types/Product";
import type { CardItemInformation } from "@/types/CardItem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CardItemInformationMapper(
  data: PRODUCTS_BY_SUB_CATEGORY_ID
): CardItemInformation {
  return {
    id: data.id,
    productName: data.name,
    currentPrice: data.currentPrice,
    buyNowPrice: data.buyNowPrice,
    productImage: data.thumbnailImage,
    bidderName: "",
    bidderPrice: 0,
    publishedDate: data.createdAt,
    remainingTime: data.timeRemaining,
    bidCount: data.bidCount,
    categoryName: data.categoryName,
  };
}

export const queryClient = new QueryClient();
