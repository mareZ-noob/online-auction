import apiClient from "@/query/api-client";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccessTokenPayload } from "@/types/Auth";

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
	refreshUserToken: () => Promise<void>;
	getUserId: () => number | null;
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

				// Consider token expired if within 5 seconds of expiry
				const now = Date.now();
				const expireThreshold = expiresAt - 5000;

				console.log("Token Expiry Check:", {
					now,
					expiresAt,
					timeLeft: (expiresAt - now) / 1000,
					isExpired: now >= expireThreshold
				});

				return now >= expireThreshold;
			},
			refreshUserToken: async () => {
				const refreshToken = get().refreshToken;
				if (!refreshToken) {
					get().logout();
					return;
				}

				try {
					const response = await apiClient.post<{
						data: {
							accessToken: string;
							refreshToken: string;
						};
					}>("/auth/refresh-token", {
						refreshToken,
					});

					if (!response) {
						throw new Error("Failed to refresh token");
					}

					const { data } = response.data;

					const decoded = jwtDecode<AccessTokenPayload>(data.accessToken);
					const expireIn = decoded.exp - Math.floor(Date.now() / 1000); // seconds left

					get().setAuth(data.accessToken, data.refreshToken, expireIn);
				} catch (error) {
					console.error("Error refreshing token:", error);
					get().logout();
				}
			},
			getUserId: () => {
				const token = get().token;

				if (token) {
					const decoded = jwtDecode<AccessTokenPayload>(token);
					return decoded.sub;
				}
				return null;
			},
		}),
		{
			name: "user-auth",
		},
	),
);
