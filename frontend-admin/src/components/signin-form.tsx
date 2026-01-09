import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStatus, useLogin } from "@/hooks/auth-hooks.ts";
import { toastError, toastSuccess } from "./custom-ui/toast/toast-ui";

const signin_schema = z.object({
	email: z.email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" }),
});

type SignInFormData = z.infer<typeof signin_schema>;

export function SigninForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signin_schema),
	});

	const { mutate, isPending, isError, error } = useLogin();
	const isAuthenticated = useAuthStatus();

	const onSubmit = (data: SignInFormData) => {
		mutate(data, {
			onSuccess: () => {
				toastSuccess("Login successful!");
			},
			onError: (error) => {
				toastError(error);
			},
		});
	};

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/admin");
		}
	}, [isAuthenticated, navigate]);

	const handleSocialLogin = () => {
		const baseURL =
			import.meta.env.VITE_API_BASE_URL || "http://localhost:8088/api";

		// Full URL: http://localhost:8088/api/auth/oauth2/authorize/keycloak-admin
		window.location.href = `${baseURL}/auth/oauth2/authorize/keycloak-admin`;
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleSubmit(onSubmit)}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Login to your account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Enter your email below to login to your account
					</p>
				</div>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						required
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-destructive text-xs">{errors.email.message}</p>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input
						id="password"
						type="password"
						required
						{...register("password")}
					/>
					{errors.password && (
						<p className="text-destructive text-xs">
							{errors.password.message}
						</p>
					)}
				</Field>
				<Field>
					{isPending ? (
						<Button disabled>Logging in...</Button>
					) : (
						<Button className="cursor-pointer" type="submit">
							Login
						</Button>
					)}
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator>
				<Field>
					<Button
						variant="outline"
						type="button"
						disabled={isPending}
						onClick={handleSocialLogin}
						className="cursor-pointer"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlSpace="preserve"
							id="Layer_1"
							x="0"
							y="0"
							version="1.1"
							viewBox="0 0 512 512"
						>
							<style>
								{`
                  .st9{fill:#d0d0d0}
                  .st11{fill:#d9d9d9}
                  .st13{fill:#d8d8d8}
                  .st14{fill:#e2e2e2}
                  .st16{fill:#dedede}
                  .st21{fill:#00b8e3}
                  .st22{fill:#33c6e9}
                  .st23{fill:#008aaa}
                `}
							</style>
							<g id="g2460" transform="translate(.714 .07)">
								<path
									id="path1588"
									d="M432.9 149.2c-1.4 0-2.7-.7-3.4-2L370.1 44.1c-.7-1.2-2-2-3.5-2H124.2c-1.4 0-2.7.7-3.4 2L58.9 150.9l23.9 34.9c-.7 1.2-6.2 24-5.5 25.2L58.9 360.9l61.9 106.9c.7 1.2 2 2 3.4 2h242.4c1.4 0 2.7-.7 3.5-2l59.4-103.2c.7-1.2 2-2 3.4-2h73.8c2.4 0 4.4-2 4.4-4.4V153.6c0-2.4-2-4.4-4.4-4.4z"
									fill="#4d4d4d"
								/>
								<path
									id="path1594"
									d="M72.7 245.3 6.4 269.4l-6.6-11.3c-.7-1.2-.7-2.7 0-3.9l30-52z"
									fill="#e1e1e1"
								/>
								<path
									id="polygon1794"
									d="M511.3 258.3V309l-43.7-44.5z"
									fill="#c8c8c8"
								/>
								<path
									id="path1798"
									d="m467.5 264.5 43.7 44.5v49.6c0 2.4-2 4.4-4.4 4.4H456z"
									fill="#c2c2c2"
								/>
								<path
									id="polygon1802"
									d="M467.5 264.5 456 362.9h-61.2l-18.5-44.7z"
									fill="#c7c7c7"
								/>
								<path
									id="polygon1804"
									d="M511.3 211.2v47l-43.7 6.2z"
									fill="#cecece"
								/>
								<path
									id="path1808"
									d="M511.3 153.6v57.6l-43.7 53.2-33.1-115.3h72.2c2.4-.1 4.5 1.8 4.6 4.3z"
									fill="#d3d3d3"
								/>
								<path
									id="polygon1812"
									d="M394.8 362.9h-32.3l-8.4-12 22.1-32.7z"
									fill="#c6c6c6"
								/>
								<path
									id="polygon1814"
									d="m467.5 264.5-121.1-51.2 63.7-64.1h24.4z"
									fill="#d5d5d5"
								/>
								<path
									id="path1816"
									d="m346.5 213.3 29.8 105 91.2-53.8z"
									className="st9"
								/>
								<path
									id="polygon1818"
									d="m353.8 362.9.4-12 8.4 12z"
									fill="#bfbfbf"
								/>
								<path
									id="polygon1820"
									d="m410.1 149.2-63.7 64.1-11.4-57.4 24.6-6.8h50.5z"
									className="st11"
								/>
								<path
									id="path1822"
									d="m346.5 213.3-147 33.9 154.7 103.7z"
									fill="#d4d4d4"
								/>
								<path
									id="path1824"
									d="m346.5 213.3 7.7 137.6 22.1-32.7z"
									className="st9"
								/>
								<path
									id="path1826"
									d="m335 155.9-135.5 91.2 147-33.9z"
									className="st11"
								/>
								<path
									id="polygon1828"
									d="m199.5 247.2-63.7 115.7H99.6L72.7 245.3z"
									className="st13"
								/>
								<path
									id="path1830"
									d="m134.3 149.2-61.5 96.1L57.3 155l2.2-3.8c.7-1.2 2-1.9 3.4-1.9z"
									className="st14"
								/>
								<path
									id="path1832"
									d="M99.6 362.9H62.7c-1.4 0-2.8-.8-3.5-2L6.4 269.4l66.4-24.1z"
									className="st13"
								/>
								<path
									id="polygon1834"
									d="M29.9 202.1 57.1 155l15.7 90.3z"
									fill="#e4e4e4"
								/>
								<path
									id="polygon1836"
									d="m335 155.9-40.8-6.8H159.4l40.1 98z"
									className="st16"
								/>
								<path
									id="polygon1838"
									d="m199.5 247.2-40.1-98h-25.1l-61.5 96.1z"
									className="st16"
								/>
								<path
									id="polygon1840"
									d="M324.7 362.9h29.1l.4-12z"
									fill="#c5c5c5"
								/>
								<path
									id="polygon1842"
									d="M266.7 362.9h58l29.5-12-154.7-103.7 27.9 115.7z"
									className="st9"
								/>
								<path
									id="polygon1844"
									d="m227.4 362.9-27.9-115.7-63.7 115.7z"
									fill="#d1d1d1"
								/>
								<path
									id="polygon1856"
									d="m335.4 149.2-.4 6.8 24.6-6.8z"
									fill="#ddd"
								/>
								<path
									id="polygon1858"
									d="m335 155.9-3.8-6.8h-37z"
									fill="#e3e3e3"
								/>
								<path
									id="polygon1860"
									d="m335 155.9.4-6.8h-4.2z"
									className="st14"
								/>
								<path
									id="path1862"
									d="m223.9 151-59.7 103.4c-.3.5-.4 1.1-.4 1.7h-41.7l82-142q.75.45 1.2 1.2l18.6 32.3c.5 1.1.5 2.4 0 3.4"
									className="st21"
								/>
								<path
									id="path1864"
									d="M223.8 364.9 205.3 397q-.45.75-1.2 1.2l-82-142.2h41.7c0 .6.1 1.1.4 1.6l59.6 103.2c.8 1.2.9 2.9 0 4.1"
									className="st22"
								/>
								<path
									id="path1866"
									d="m204 114.2-82 141.9-20.6 35.6-19.6-34c-.3-.5-.4-1-.4-1.6s.1-1.2.4-1.7l19.9-34.4 60.4-104.5c.6-1.1 1.8-1.8 3-1.8h37.2c.6 0 1.2.2 1.7.5"
									className="st23"
								/>
								<path
									id="path1868"
									d="M204 398.2c-.5.3-1.1.5-1.8.5h-37.1c-1.3 0-2.4-.7-3-1.8l-55.2-95.6-5.5-9.5 20.6-35.6z"
									className="st21"
								/>
								<path
									id="path1870"
									d="m368.9 256.1-82 142q-.75-.45-1.2-1.2L267 364.7c-.5-1-.5-2.3 0-3.3L326.7 258c.3-.5.5-1.2.5-1.8z"
									className="st23"
								/>
								<path
									id="path1872"
									d="M409.4 256.1c0 .6-.2 1.3-.5 1.8l-80.3 139.3c-.6 1-1.8 1.7-3 1.6h-37c-.6 0-1.2-.2-1.8-.5L368.9 256l20.6-35.6 19.5 33.8c.3.7.4 1.3.4 1.9"
									className="st21"
								/>
								<path
									id="path1874"
									d="M368.9 256.1h-41.7c0-.6-.2-1.2-.5-1.8L267 151.2c-.6-1.1-.6-2.5 0-3.6l18.6-32.2q.45-.75 1.2-1.2z"
									className="st21"
								/>
								<path
									id="path1876"
									d="m389.4 220.5-20.6 35.6-82-142c.6-.3 1.2-.5 1.8-.5h37.1c1.2 0 2.3.6 3 1.6z"
									className="st22"
								/>
							</g>
						</svg>
						Login with Keycloak
					</Button>
				</Field>
				<Field>
					{isError && (
						<div className="text-destructive text-sm text-center">
							{error?.message || "Sign up failed. Please try again."}
						</div>
					)}
				</Field>
			</FieldGroup>
		</form>
	);
}
