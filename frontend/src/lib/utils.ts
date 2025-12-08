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
    bidderName: data.currentBidderName,
    bidderPrice: 0,
    publishedDate: data.createdAt,
    remainingTime: data.timeRemaining,
    bidCount: data.bidCount,
    categoryName: data.categoryName,
  };
}

export const queryClient = new QueryClient();

export type ProductFilterCriteria = {
  enndtime?: "desc" | "asc";
  price?: "desc" | "asc";
  newPublish?: boolean | null;
};

/**
 * Filter and sort products client-side according to given criteria.
 * - `newPublish` filters by `isNew` when provided (true => only new; false => only non-new).
 * - sorts primarily by `endTime` according to `enndtime`, and secondarily by `currentPrice` according to `price`.
 */
export function filterAndSortProducts(
  products: PRODUCTS_BY_SUB_CATEGORY_ID[] | undefined,
  criteria: ProductFilterCriteria
): PRODUCTS_BY_SUB_CATEGORY_ID[] {
  if (!products) return [];

  let result = products.slice();

  if (criteria.newPublish !== null && criteria.newPublish !== undefined) {
    result = result.filter((p) => p.isNew === criteria.newPublish);
  }

  const ennd = criteria.enndtime ?? "asc";
  const pr = criteria.price ?? "asc";

  result.sort((a, b) => {
    const endA = Date.parse(a.endTime ?? "");
    const endB = Date.parse(b.endTime ?? "");
    if (!Number.isNaN(endA) && !Number.isNaN(endB) && endA !== endB) {
      return ennd === "asc" ? endA - endB : endB - endA;
    }

    // Fallback / tie-break: price
    const priceDiff = a.currentPrice - b.currentPrice;
    return pr === "asc" ? priceDiff : -priceDiff;
  });

  return result;
}
