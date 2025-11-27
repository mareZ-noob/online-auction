import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import { lazy, Suspense } from "react";
import LoadingPage from "@/layouts/LoadingPage.tsx";
import {ProtectedRoute} from "@/routes/protected-route.ts";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const SignUpPage = lazy(() => import("@/components/auth-page/SignUpPage.tsx"));
const DashboardPage = lazy(
	() => import("@/components/dashboard-page/DashboardPage.tsx"),
);

const LayoutWithHeader = lazy(() => import("@/layouts/LayoutWithHeader.tsx"));

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <ErrorPage />,
		element: <LayoutWithHeader />,
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
		loader: ProtectedRoute
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
		],
	},
]);

export default router;
