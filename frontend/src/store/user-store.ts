import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
	id: number | null;
	isSeller: boolean;
}

interface UserAction {
	setId: (id: number | null) => void;
	setIsSeller: (isSeller: boolean) => void;
	clearUser: () => void;
}

export const useUserStore = create<UserState & UserAction>()(
	persist(
		(set) => ({
			id: null,
			isSeller: false,
			setId: (id) => set(() => ({ id })),
			setIsSeller: (isSeller) => set(() => ({ isSeller })),
			clearUser: () =>
				set(() => ({
					id: null,
					isSeller: false,
				})),
		}),
		{
			name: "user-storage",
			partialize: (state) => ({
				id: state.id,
				isSeller: state.isSeller,
			}),
		},
	),
);
