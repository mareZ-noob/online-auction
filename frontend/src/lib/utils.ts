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
    bidderPrice: data.bidPrice,
    publishedDate: data.createdAt,
    remainingTime: data.timeRemaining,
    bidCount: data.bidCount,
    categoryName: data.categoryName,
  };
}

export const queryClient = new QueryClient();

export type ProductFilterCriteria = {
  endtime?: "desc" | "asc";
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

  // Only filter for new products when caller explicitly requests newPublish === true.
  // Treat the default (false / undefined / null) as "no filtering": return all products.
  if (criteria.newPublish === true) {
    result = result.filter((p) => p.isNew === true);
  }

  const ennd = criteria.endtime ?? "asc";
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

export function formatDateTime(
  dateInput: Date | string | null | undefined,
  location: string = "vi-VN"
): string {
  if (!dateInput) return "";

  const formatted = new Date(dateInput).toLocaleString(location, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Remove comma between date and time (e.g., "12/13/2025, 03:12 AM")
  // return formatted.replace(",", "");
  return formatted;
}

export const formatCurrency = (
  amount: number,
  locale: string = "vi-VN",
  currency: string = "VND"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};
