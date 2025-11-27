import {useAuthStore} from "@/store/auth-store.ts";
import {redirect} from "react-router-dom";

export function ProtectedRoute({ request}: any) {
    const token = useAuthStore.getState().token;
    const isTokenExpired = useAuthStore.getState().isTokenExpired;

    if (isTokenExpired()) {
        useAuthStore.getState().logout();
    }

    if (!token) {
        const url = new URL(request.url);
        return redirect(`auth/sign-in?from=${url.pathname}`);
    }

    return null;
}