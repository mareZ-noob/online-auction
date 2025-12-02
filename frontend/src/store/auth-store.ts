import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isEmailVerified: boolean;
  setIsEmailVerified: (isVerified: boolean) => void;
  setAuth: (token: string, refreshToken: string, expiresIn: number) => void;
  setToken: (token: string, expiresIn: number) => void;
  logout: () => void;
  isTokenExpired: () => boolean;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      expiresAt: null,
      isEmailVerified: false,
      setIsEmailVerified: (isVerified: boolean) =>
        set({ isEmailVerified: isVerified }),
      setAuth: (token, refreshToken, expiresIn) =>
        set({
          token,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
        }),
      setToken: (token, expiresIn) =>
        set({
          token,
          expiresAt: Date.now() + expiresIn * 1000,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          expiresAt: null,
          isEmailVerified: false,
        }),
      isTokenExpired: () => {
        const expiresAt = get().expiresAt;
        if (!expiresAt) return true;

        // Consider token expired if within 1 minute of expiry
        const now = Date.now();
        const expireThreshold = expiresAt - 60_000;

        return now >= expireThreshold;
      },
      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await fetch("/api/auth/refresh-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();
          get().setAuth(data.token, data.refreshToken, data.expiresIn);
        } catch (error) {
          console.error("Error refreshing token:", error);
          get().logout();
        }
      },
    }),
    {
      name: "user-auth",
    }
  )
);
