import type { USER_BY_ID_RESPONSE } from "@/types/User";
import { API_ENDPOINTS } from "@/hooks/endpoints";
import apiClient from "@/query/api-client";
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
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState & UserAction>()(
  persist(
    (set, get) => ({
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
      fetchUser: async () => {
        const id = get().id;
        if (!id) return;

        try {
          const { data: profileResp } =
            await apiClient.get<USER_BY_ID_RESPONSE>(
              API_ENDPOINTS.USER_BY_ID(id)
            );

          if (profileResp?.data) {
            get().setUser(profileResp.data);
          }
        } catch (err) {
          // non-fatal: profile fetch failed — user still logged in
          // eslint-disable-next-line no-console
          console.warn("Failed to fetch user profile after login:", err);
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        id: state.id,
      }),
    }
  )
);
