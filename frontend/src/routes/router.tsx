import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import { lazy, Suspense } from "react";
import LoadingPage from "@/layouts/LoadingPage.tsx";
import { ProtectedRoute } from "@/routes/protected-route.ts";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const SignUpPage = lazy(() => import("@/components/auth-page/SignUpPage.tsx"));
const DashboardPage = lazy(
	() => import("@/components/dashboard-page/DashboardPage.tsx"),
);
const ForgotPassword = lazy(
	() => import("@/components/auth-page/ForgotPassword.tsx"),
);
const ResetPassword = lazy(
	() => import("@/components/auth-page/ResetPassword"),
);
const OTPPage = lazy(() => import("@/components/auth-page/OTPPage.tsx"));
const ProductDetailPage = lazy(
	() => import("@/components/product-page/ProductDetailPage.tsx"),
);
const CommonLayout = lazy(() => import("@/layouts/CommonLayout"));

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <ErrorPage />,
		element: <CommonLayout />,
		children: [
			{
				index: true,
				element: <Navigate to="me" replace />,
			},
			{
				path: "me",
				element: <DashboardPage />,
			},
		],
		// loader: ProtectedRoute,
	},
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
	{
		path: "/products",
		errorElement: <ErrorPage />,
		element: <CommonLayout />,
		children: [
			{
				path: ":id",
				element: (
					<Suspense fallback={<LoadingPage />}>
						<ProductDetailPage />
					</Suspense>
				),
			},
		],
	},
]);

export default router;
