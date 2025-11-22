import {createBrowserRouter, Navigate} from "react-router-dom";
import ErrorPage from "@/layouts/errorPage.tsx";
import {lazy, Suspense} from "react";
import LoadingPage from "@/layouts/loadingPage.tsx";

const SignInPage = lazy(() => import('@/components/auth-page/SignInPage'))
const SignUpPage = lazy(() => import('@/components/auth-page/SignUpPage.tsx'))

const router = createBrowserRouter([
    {
        path: '/auth',
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Navigate to="sign-in" replace />,
            },
            {
                path: 'sign-in',
                element: (<Suspense fallback={<LoadingPage />}>
                    <SignInPage />
                </Suspense>),
            },
            {
                path: 'sign-up',
                element: (<Suspense fallback={<LoadingPage />}>
                    <SignUpPage />
                </Suspense>),
            }
        ]
    }
]);

export default router;