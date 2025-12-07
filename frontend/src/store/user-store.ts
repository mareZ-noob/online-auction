import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  id: number | null;
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
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserAction>()(
  persist(
    (set) => ({
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
      clearUser: () =>
        set(() => ({
          id: null,
        })),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        id: state.id,
      }),
    }
  )
);
