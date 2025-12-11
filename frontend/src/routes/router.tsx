import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/layouts/ErrorPage.tsx";
import LoadingPage from "@/layouts/LoadingPage.tsx";
import { ProtectedRoute } from "@/routes/protected-route.ts";

const SignInPage = lazy(() => import("@/components/auth-page/SignInPage"));
const SignUpPage = lazy(() => import("@/components/auth-page/SignUpPage.tsx"));

// User | Bidder
const DashboardPage = lazy(
  () => import("@/components/dashboard-page/DashboardPage.tsx")
);
const ForgotPassword = lazy(
  () => import("@/components/auth-page/ForgotPassword.tsx")
);
const ResetPassword = lazy(
  () => import("@/components/auth-page/ResetPassword")
);
const OTPPage = lazy(() => import("@/components/auth-page/OTPPage.tsx"));
const ProductDetailPage = lazy(
  () => import("@/components/product-page/product-detail/ProductDetailPage.tsx")
);
const ProductListPage = lazy(
  () => import("@/components/product-page/product-list/ProductListPage.tsx")
);
const WatchListPage = lazy(
  () => import("@/components/watch-list/WatchListPage.tsx")
);
const PersonalInformation = lazy(
  () => import("@/components/profile/PersonalInformation.tsx")
);
const BiddingProducts = lazy(
  () => import("@/components/profile/BiddingProducts.tsx")
);
const WonProducts = lazy(() => import("@/components/profile/WonProducts.tsx"));
const CommonLayout = lazy(() => import("@/layouts/CommonLayout"));
const OAuth2RedirectHandler = lazy(
  () => import("@/components/auth-page/OAuth2RedirectHandler")
);

// Seller
import { CheckSellerRole } from "@/routes/protected-route.ts";

const PublishNewProduct = lazy(
  () => import("@/components/publish-new-product/PublishNewProduct.tsx")
);
const MyPublishedProducts = lazy(
  () => import("@/components/profile/MyPublishedProducts.tsx")
);
const UnansweredQuestionList = lazy(
  () => import("@/components/profile/UnansweredQuestionList.tsx")
);
const WonPublishedProducts = lazy(
  () => import("@/components/profile/WonPublishedProducts.tsx")
);

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
      {
        path: "watch-list",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <WatchListPage />
          </Suspense>
        ),
      },
    ],
    loader: ProtectedRoute,
  },
  {
    path: "/profile",
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="personal-information" replace />,
      },
      {
        path: "personal-information",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <PersonalInformation />
          </Suspense>
        ),
      },
      {
        path: "bidding-products",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <BiddingProducts />
          </Suspense>
        ),
      },
      {
        path: "won-products",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <WonProducts />
          </Suspense>
        ),
      },
      {
        path: "published-products",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <MyPublishedProducts />
          </Suspense>
        ),
        loader: CheckSellerRole,
      },
      {
        path: "unanswered-questions",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <UnansweredQuestionList />
          </Suspense>
        ),
        loader: CheckSellerRole,
      },
      {
        path: "won-published-products",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <WonPublishedProducts />
          </Suspense>
        ),
        loader: CheckSellerRole,
      },
    ],
    loader: ProtectedRoute,
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
        // path: "category/:categoryName/subCategory/:subCategoryName",
        index: true,
        element: (
          <Suspense fallback={<LoadingPage />}>
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: "publish",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <PublishNewProduct mode="create" />
          </Suspense>
        ),
      },
      {
        path: ":id/edit",
        element: (
          <Suspense fallback={<LoadingPage />}>
            <PublishNewProduct mode="edit" />
          </Suspense>
        ),
      },
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
