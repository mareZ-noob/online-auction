import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store.ts";

export function ProtectedRoute({ request }: LoaderFunctionArgs) {
  const token = useAuthStore.getState().token;
  const isTokenExpired = useAuthStore.getState().isTokenExpired;
  const isEmailVerified = useAuthStore.getState().isEmailVerified;

  console.log("ProtectedRoute loader check:", {
    hasToken: !!token,
    isExpired: token ? isTokenExpired() : null,
    isEmailVerified: isEmailVerified,
  });

  // If token exists but is expired, try to refresh
  if (token && isTokenExpired()) {
    console.log("Token expired, attempting refresh...");
    useAuthStore.getState().refreshUserToken();
  }

  // If we have a valid token, allow access (even if email not verified yet)
  // The app can handle email verification after login
  if (token && !isTokenExpired()) {
    console.log("Access granted - valid token found");
    return null;
  }

  // No valid token, redirect to sign-in
  const url = new URL(request.url);
  console.log("Access denied - redirecting to sign-in from:", url.pathname);
  return redirect(`/auth/sign-in?from=${url.pathname}`);
}