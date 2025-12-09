import { createContext } from "react";
import type { ProductFilterCriteria } from "@/lib/utils";

export interface ProductListContextType {
	setEndtime: (value: "desc" | "asc") => void;
	setPrice: (value: "desc" | "asc") => void;
	setNewPublish: (value: boolean) => void;
}

export const ProductListContext = createContext<
	ProductFilterCriteria & ProductListContextType
>({
	endtime: "asc",
	price: "asc",
	newPublish: false,
	setEndtime: () => {
		/* no-op */
	},
	setPrice: () => {
		/* no-op */
	},
	setNewPublish: () => {
		/* no-op */
	},
});
