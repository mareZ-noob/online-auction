import { redirect } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store.ts";

export function ProtectedRoute({ request }: { request: Request }) {
  const token = useAuthStore.getState().token;
  const isTokenExpired = useAuthStore.getState().isTokenExpired;

  if (isTokenExpired()) {
    useAuthStore.getState().refreshAccessToken();
  }

  if (!token) {
    const url = new URL(request.url);
    return redirect(`/auth/sign-in?from=${url.pathname}`);
  }

  return null;
}
