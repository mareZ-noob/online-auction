import { create } from "zustand";

interface ProductState {
	page: number;
	size: number;
	totalPages: number;
	categoryId: number | null;
	subCategoryId: number | null;
	setPage: (page: number) => void;
	setSize: (size: number) => void;
	setTotalPages: (totalPages: number) => void;
	setCategoryId: (categoryId: number | null) => void;
	setSubCategoryId: (subCategoryId: number | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
	page: 1,
	size: 10,
	totalPages: 10,
	categoryId: null,
	subCategoryId: null,

	setPage: (page: number) => set({ page }),
	setSize: (size: number) => set({ size }),
	setTotalPages: (totalPages: number) => set({ totalPages }),
	setCategoryId: (categoryId: number | null) => set({ categoryId }),
	setSubCategoryId: (subCategoryId: number | null) => set({ subCategoryId }),
}));
