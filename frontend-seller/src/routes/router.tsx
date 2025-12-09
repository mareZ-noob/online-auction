import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import LoadingPage from "@/layouts/LoadingPage.tsx";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const SignUpPage = lazy(() => import("@/components/auth-page/SignUpPage.tsx"));

const ForgotPassword = lazy(
  () => import("@/components/auth-page/ForgotPassword.tsx")
);
const ResetPassword = lazy(
  () => import("@/components/auth-page/ResetPassword")
);
const OTPPage = lazy(() => import("@/components/auth-page/OTPPage.tsx"));

const router = createBrowserRouter([
  {
    path: "/auth",
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="sign-in" replace />,
      },
      {
        path: "sign-in",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <SignInPage />
          </Suspense>
        ),
      },
      {
        path: "sign-up",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <SignUpPage />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "otp",
        element: <OTPPage />,
      },
    ],
  },
]);

export default router;
