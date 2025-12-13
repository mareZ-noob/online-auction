import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import LoadingPage from "@/layouts/LoadingPage.tsx";
import CommonLayout from "@/layouts/CommonLayout.tsx";
import { ProtectedRoute } from "./protected-route";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const SignUpPage = lazy(() => import("@/components/auth-page/SignUpPage.tsx"));

const ForgotPassword = lazy(
	() => import("@/components/auth-page/ForgotPassword.tsx"),
);
const ResetPassword = lazy(
	() => import("@/components/auth-page/ResetPassword"),
);
const OTPPage = lazy(() => import("@/components/auth-page/OTPPage.tsx"));

// admin
const ReportsPage = lazy(
	() => import("@/components/dashboard/reports/ReportsPage"),
);

const CategoriesPage = lazy(
	() => import("@/components/categories/CategoriesPage"),
);
const CreateCategoryPage = lazy(
	() => import("@/components/categories/CreateCategoryPage"),
);
const ProductsPage = lazy(() => import("@/components/products/ProductsPage"));
const UsersPage = lazy(() => import("@/components/users/UsersPage"));
const UpgradeRequestsPage = lazy(
	() => import("@/components/users/UpgradeRequestsPage"),
);

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
	{
		path: "/",
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <Navigate to="admin" replace />,
			},
			{
				path: "/admin",
				errorElement: <ErrorPage />,
				element: <CommonLayout />,
				children: [
					{
						index: true,
						element: <Navigate to="dashboard" replace />,
					},
					{
						path: "dashboard",
						children: [
							{
								index: true,
								element: <Navigate to="reports" replace />,
							},
							{
								path: "reports",
								element: (
									<Suspense fallback={<LoadingPage />}>
										<ReportsPage />
									</Suspense>
								),
							},
						],
					},
					{
						path: "categories",
						children: [
							{
								index: true,
								element: (
									<Suspense fallback={<LoadingPage />}>
										<CategoriesPage />
									</Suspense>
								),
							},
							{
								path: "create",
								element: (
									<Suspense fallback={<LoadingPage />}>
										<CreateCategoryPage />
									</Suspense>
								),
							},
						],
					},
					{
						path: "products",
						element: (
							<Suspense fallback={<LoadingPage />}>
								<ProductsPage />
							</Suspense>
						),
					},
					{
						path: "users",
						children: [
							{
								index: true,
								element: (
									<Suspense fallback={<LoadingPage />}>
										<UsersPage />
									</Suspense>
								),
							},
							{
								path: "upgrade-requests",
								element: (
									<Suspense fallback={<LoadingPage />}>
										<UpgradeRequestsPage />
									</Suspense>
								),
							},
						],
					},
				],
			},
		],
		loader: ProtectedRoute,
	},
]);

export default router;
