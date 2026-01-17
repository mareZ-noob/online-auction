import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExchangeToken } from "@/hooks/auth-hooks";
import LoadingPage from "@/layouts/LoadingPage";

function OAuth2RedirectHandler() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const code = searchParams.get("code");
	const processedRef = useRef(false);

	const handleComplete = () => {
		console.log("Exchange complete callback triggered!");
		console.log("Navigating to /admin in 100ms...");
		setTimeout(() => {
			console.log("Executing navigation NOW!");
			navigate("/", { replace: true });
		}, 100);
	};

	const {
		mutate: exchangeToken,
		isPending,
		isError,
		error,
	} = useExchangeToken(handleComplete);

	useEffect(() => {
		console.log("OAuth2 Code from URL:", code);

		if (!code) {
			console.warn("No code found in URL");
			navigate("/auth/sign-in", { replace: true });
			return;
		}

		if (processedRef.current) {
			console.log("Already processed, skipping...");
			return;
		}

		processedRef.current = true;
		console.log("Exchanging token...");

		exchangeToken(code);
	}, [code, exchangeToken, navigate]);

	if (isError) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4">
				<h1 className="text-xl font-semibold text-destructive">Login Failed</h1>
				<p className="text-sm text-muted-foreground">
					{error?.message || "An error occurred during authentication"}
				</p>
				<button
					onClick={() => navigate("/auth/sign-in", { replace: true })}
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
				>
					Back to Login
				</button>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col items-center justify-center gap-4">
			<LoadingPage />
			<p className="text-sm text-muted-foreground">
				{isPending ? "Completing authentication..." : "Redirecting..."}
			</p>
		</div>
	);
}

export default OAuth2RedirectHandler;
