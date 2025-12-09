import apiClient from "@/query/api-client";
import { API_ENDPOINTS } from "@/hooks/endpoints";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { jwtDecode } from "jwt-decode";
import type {
  AccessTokenPayload,
  LoginResponse,
  SignupResponse,
} from "@/types/Auth";
import type { ApiResponseError } from "@/types/ApiResponse";
import type { AxiosError } from "axios";

export const useLogin = () => {
  const setIsEmailVerified = useAuthStore((state) => state.setIsEmailVerified);
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    LoginResponse["data"],
    AxiosError<ApiResponseError>,
    { email: string; password: string }
  >({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        { ...credentials, grant_type: "password" }
      );
      return data.data;
    },
    onSuccess: async (data) => {
      const decoded = jwtDecode<AccessTokenPayload>(data.accessToken);
      const sub = decoded.sub;
      const expireIn = decoded.exp - Math.floor(Date.now() / 1000); // seconds left

      // store tokens and id in zustand stores
      setIsEmailVerified(data.user.emailVerified);
      setAuth(data.accessToken, data.refreshToken, expireIn);
    },
    onError: (error) => {
      const apiError = error.response?.data;

      if (apiError) {
        return Promise.reject(new Error(apiError.message));
      } else {
        console.error("Unexpected error:", error.message);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation<
    SignupResponse["data"],
    AxiosError<ApiResponseError>,
    {
      fullName: string;
      address: string;
      email: string;
      password: string;
      recaptchaToken: string;
    }
  >({
    mutationFn: async (credentials: {
      fullName: string;
      address: string;
      email: string;
      password: string;
      recaptchaToken: string;
    }) => {
      const { data } = await apiClient.post<SignupResponse>(
        API_ENDPOINTS.REGISTER,
        credentials
      );
      return data.data;
    },
    onError: (error) => {
      const apiError = error.response?.data;

      if (apiError) {
        return Promise.reject(new Error(apiError.message));
      } else {
        console.error("Unexpected error:", error.message);
      }
    },
  });
};

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
        `${API_ENDPOINTS.RESEND_EMAIL_VERIFICATION}?email=${encodeURIComponent(
          credentials.email
        )}`,
        {}
      );

      return { data };
    },
  });
};

// TODO: improve this hook, somehow
export const useAuthStatus = () => {
  const token = useAuthStore((state) => state.token);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const isEmailVerified = useAuthStore((state) => state.isEmailVerified);

  return !!token && !isTokenExpired() && !!isEmailVerified;
};

export const useExchangeToken = (onComplete?: () => void) => {
  const setIsEmailVerified = useAuthStore((state) => state.setIsEmailVerified);
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (code: string) => {
      console.log("Making exchange token request with code:", code);

      const { data } = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.EXCHANGE_TOKEN,
        { code }
      );

      console.log("Exchange token response:", data);

      if (!data.success) {
        throw new Error(data.message || "Token exchange failed");
      }

      return data.data;
    },
    onSuccess: (data) => {
      console.log("onSuccess called with data:", data);

      try {
        const decoded = jwtDecode<AccessTokenPayload>(data.accessToken);
        const sub = decoded.sub;
        const expireIn = decoded.exp - Math.floor(Date.now() / 1000);

        console.log("Decoded token:", { sub, expireIn, email: decoded.email });
        console.log("User email verified:", data.user.emailVerified);

        // Set all auth state
        setIsEmailVerified(data.user.emailVerified);
        console.log("Email verified status set to:", data.user.emailVerified);

        setAuth(data.accessToken, data.refreshToken, expireIn);
        console.log("Auth tokens set");

        console.log("Auth state updated successfully");

        // Verify the store was actually updated
        const currentState = useAuthStore.getState();
        console.log("Current auth store state:", {
          hasToken: !!currentState.token,
          isEmailVerified: currentState.isEmailVerified,
          isExpired: currentState.isTokenExpired(),
        });

        // Call the completion callback if provided
        if (onComplete) {
          console.log("Calling onComplete callback");
          onComplete();
        }
      } catch (error) {
        console.error("Error processing token:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Token exchange error:", error);
    },
  });
};
