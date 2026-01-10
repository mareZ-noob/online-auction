import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import LoadingPage from "@/layouts/LoadingPage.tsx";
import CommonLayout from "@/layouts/CommonLayout.tsx";
import { ProtectedRoute } from "./protected-route";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const OAuth2RedirectHandler = lazy(
	() => import("@/components/auth-page/OAuth2RedirectHandler"),
);

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
const DeleteCategoryPage = lazy(
	() => import("@/components/categories/DeletecategoryPage"),
);
const ProductsPage = lazy(() => import("@/components/products/ProductsPage"));
const AuctionSettingsPage = lazy(
	() => import("@/components/products/AuctionSettings.tsx"),
);
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
		],
	},
	{
		path: "/oauth2/redirect",
		element: (
			<Suspense fallback={<LoadingPage />}>
				<OAuth2RedirectHandler />
			</Suspense>
		),
		errorElement: <ErrorPage />,
	},
	{
		path: "/",
		errorElement: <ErrorPage />,
		element: <Suspense fallback={<LoadingPage />}><CommonLayout /></Suspense>,
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
						element: <ReportsPage />
					},
				],
			},
			{
				path: "categories",
				children: [
					{
						index: true,
						element: <CategoriesPage />,
					},
					{
						path: "creation",
						element: <CreateCategoryPage />,
					},
					{
						path: "deletion",
						element: <DeleteCategoryPage />,
					}
				],
			},
			{
				path: "products",
				children: [
					{
						index: true,
						element: <ProductsPage />,
					},
					{
						path: "auction-settings",
						element: <AuctionSettingsPage />,
					},
				],
			},
			{
				path: "users",
				children: [
					{
						index: true,
						element: <UsersPage />,
					},
					{
						path: "upgrade-requests",
						element: <UpgradeRequestsPage />,
					},
				],
			},
		],
		loader: ProtectedRoute,
	},
], { basename: "/admin" });

export default router;
