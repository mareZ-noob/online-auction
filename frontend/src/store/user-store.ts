import { create } from "zustand";

interface UserState {
	id: number;
	email: string;
	fullName: string;
	address: string;
	role: string;
	linkedProviders: string[];
	emailVerified: boolean;
	positiveRatings: number;
	negativeRatings: number;
	createdAt: string;
}

interface UserAction {
	setId: (id: number) => void;
	setUser: (user: Partial<UserState> | null) => void;
}

export const useUserStore = create<UserState & UserAction>((set) => ({
	id: 0,
	email: "",
	fullName: "",
	address: "",
	role: "",
	linkedProviders: [],
	emailVerified: false,
	positiveRatings: 0,
	negativeRatings: 0,
	createdAt: "",
	setId: (id) => set(() => ({ id })),
	setUser: (user) => set((prev) => ({ ...prev, ...(user ?? {}) })),
}));
