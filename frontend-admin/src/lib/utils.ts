import { QueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient();

export function formatDateTime(
	dateInput: Date | string | null | undefined,
	location: string = "vi-VN",
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
	currency: string = "VND",
): string => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency,
	}).format(amount);
};
