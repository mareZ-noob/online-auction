import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/hooks/endpoints';
import apiClient from '@/query/api-client';
import { useAuthStore } from '@/store/auth-store';

interface LoginResponse {
    accessToken: string;
    tokenType: 'Bearer';
    expireIn: number;
    refreshToken: string;
}

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const { data } = await apiClient.post<LoginResponse>(
                API_ENDPOINTS.LOGIN,
                { ...credentials, grant_type: 'password' }
            );
            return data;
        },
        onSuccess: (data) => {
            setAuth(data.accessToken, data.refreshToken, data.expireIn);
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
            const { data } = await apiClient.post<{
                token: string;
            }>(API_ENDPOINTS.REGISTER, credentials);
            return data;
        },
        onSuccess: (data) => {
            setAuth(data.token, "", 3600);
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
    const logout = useAuthStore((state) => state.logout);

    return useMutation({
        mutationFn: async () => {
            await apiClient.post(API_ENDPOINTS.LOGOUT);
        },
        onSuccess: () => {
            logout();
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (credentials: {
            email: string;
        }) => {
            const {data} = await apiClient.post<{
                "success": boolean,
                "message": string,
                "data": string,
                "timestamp": Date,
            }>(API_ENDPOINTS.FORGOT_PASSWORD, credentials);

            return {data};
        },
    })
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (credentials: {
            email: string;
            code: string;
            newPassword: string;
        }) => {
            const {data} = await apiClient.post<{
                "success": boolean,
                "message": string,
                "data": string,
                "timestamp": Date,
            }>(API_ENDPOINTS.RESET_PASSWORD, credentials);

            return {data};
        },
    })
}

// TODO: improve this hook, somehow
export const useAuthStatus = () => {
    const token = useAuthStore((state) => state.token);
    return !!token;
};