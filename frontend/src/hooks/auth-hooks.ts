import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/hooks/endpoints";
import apiClient from "@/query/api-client";
import { useAuthStore } from "@/store/auth-store";
import { jwtDecode } from "jwt-decode";

interface LoginResponseData {
	accessToken: string;
	refreshToken: string;
	user: {
		id: number;
		email: string;
		fullName: string;
		address: string;
		dateOfBirth: string;
		role: string;
		emailVerified: boolean;
		positiveRatings: number;
		negativeRatings: number;
		createdAt: string;
	};
}

interface LoginResponse {
	success: boolean;
	message: string;
	data: LoginResponseData;
	timestamp: string;
}

interface SignupResponseData {
	accessToken: string;
	refreshToken: string;
	user: {
		id: number;
		email: string;
		fullName: string;
		address: string;
		dateOfBirth: string;
		role: string;
		emailVerified: boolean;
		positiveRatings: number;
		negativeRatings: number;
		createdAt: string;
	};
}

interface SignupResponse {
	success: boolean;
	message: string;
	data: SignupResponseData;
	timestamp: string;
}

export const useLogin = () => {
	const setAuth = useAuthStore((state) => state.setAuth);

	return useMutation({
		mutationFn: async (credentials: { email: string; password: string }) => {
			const { data } = await apiClient.post<LoginResponse>(
				API_ENDPOINTS.LOGIN,
				{ ...credentials, grant_type: "password" },
			);
			return data.data;
		},
		onSuccess: (data) => {
			const decoded = jwtDecode<{ exp: number }>(data.accessToken);
			const expireIn = decoded.exp - Math.floor(Date.now() / 1000); // seconds left

			setAuth(data.accessToken, data.refreshToken, expireIn);
		},
	});
};

export const useRegister = () => {
	const setAuth = useAuthStore((state) => state.setAuth);

	return useMutation({
		mutationFn: async (credentials: {
			fullName: string;
			address: string;
			email: string;
			password: string;
			recaptchaToken: string;
		}) => {
			const { data } = await apiClient.post<SignupResponse>(
				API_ENDPOINTS.REGISTER,
				credentials,
			);
			return data.data;
		},
		onSuccess: (data) => {
			const decoded = jwtDecode<{ exp: number }>(data.accessToken);
			const expireIn = decoded.exp - Math.floor(Date.now() / 1000); // seconds left

			setAuth(data.accessToken, data.refreshToken, expireIn);
		},
	});
};

// export const useCurrentUser = () => {
//     return useQuery({
//         queryKey: ["currentUser"],
//         queryFn: async () => {
//             const { data } = await apiClient.get<User>("/me");
//             return data;
//         },
//     });
// };

export const useSignOut = () => {
	const refreshToken = useAuthStore((state) => state.refreshToken);
	const logout = useAuthStore((state) => state.logout);

	return useMutation({
		mutationFn: async () => {
			await apiClient.post(API_ENDPOINTS.LOGOUT, {
				refreshToken,
			});
		},
		onSuccess: () => {
			logout();
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (credentials: { email: string }) => {
			const { data } = await apiClient.post<{
				success: boolean;
				message: string;
				data: string;
				timestamp: Date;
			}>(`${API_ENDPOINTS.FORGOT_PASSWORD}?email=${credentials.email}`);

			return { data };
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async (credentials: {
			email: string;
			code: string;
			newPassword: string;
		}) => {
			const { data } = await apiClient.post<{
				success: boolean;
				message: string;
				data: string;
				timestamp: Date;
			}>(API_ENDPOINTS.RESET_PASSWORD, credentials);

			return { data };
		},
	});
};

export const useVerifyEmailOTP = () => {
	return useMutation({
		mutationFn: async (credentials: { email: string; code: string }) => {
			const { data } = await apiClient.post<{
				success: boolean;
				message: string;
				data: string;
				timestamp: Date;
			}>(API_ENDPOINTS.VERIFY_EMAIL, credentials);

			return { data };
		},
	});
};

export const useResendEmailVerification = () => {
	return useMutation({
		mutationFn: async (credentials: { email: string }) => {
			const { data } = await apiClient.post<{
				success: boolean;
				message: string;
				data: string;
				timestamp: Date;
			}>(
				`${API_ENDPOINTS.RESEND_EMAIL_VERIFICATION}?email=${encodeURIComponent(credentials.email)}`,
				{},
			);

			return { data };
		},
	});
};

// TODO: improve this hook, somehow
export const useAuthStatus = () => {
	const token = useAuthStore((state) => state.token);
	return !!token;
};
