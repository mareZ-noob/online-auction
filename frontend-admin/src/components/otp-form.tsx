import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useResendEmailVerification,
	useVerifyEmailOTP,
} from "@/hooks/auth-hooks.ts";

const otp_schema = z.object({
	otp: z
		.string()
		.min(6, "OTP must be 6 digits")
		.max(6, "OTP must be 6 digits")
		.regex(/^\d+$/, "OTP must contain only numbers"),
});

export type OTPFormData = z.infer<typeof otp_schema>;

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate();
	const state = useLocation().state;

	useEffect(() => {
		if (!state || !state?.email) navigate("/auth/sign-up");
	}, [state, navigate]);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<OTPFormData>({
		resolver: zodResolver(otp_schema),
	});

	const {
		mutate: verifyEmailMutate,
		isPending: verifyEmailIsPending,
		isError: verifyEmailIsError,
		error: verifyEmailError,
	} = useVerifyEmailOTP();
	const {
		mutate: resendVerificationMutate,
		isPending: resendVerificationIsPending,
		isError: resendVerificationIsError,
		error: resendVerificationError,
	} = useResendEmailVerification();

	const onSubmit = (values: OTPFormData) => {
		if (!state || !state?.email) navigate("/auth/sign-up");

		const { otp } = values;
		const data = {
			email: state.email,
			code: otp,
		};

		verifyEmailMutate(data, {
			onSuccess: () => {
				navigate("/me", { replace: true });
			},
		});
	};

	const handleResendEmailCode = () => {
		if (!state || !state?.email) navigate("/auth/sign-up");

		const data = {
			email: state.email,
		};

		resendVerificationMutate(data, {
			onSuccess: () => {
				alert("Resend Email Verification Successfully");
			},
		});
	};

	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>Enter verification code</CardTitle>
				<CardDescription>We sent a 6-digit code to your email.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="otp">Verification code</FieldLabel>
							<Controller
								name="otp"
								control={control}
								render={({ field }) => (
									<InputOTP
										id="otp"
										maxLength={6}
										value={field.value}
										onChange={field.onChange}
									>
										<InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								)}
							/>
							<FieldDescription>
								Enter the 6-digit code sent to your email.
							</FieldDescription>
						</Field>

						{errors.otp && (
							<p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
						)}

						<FieldGroup>
							{verifyEmailIsPending || resendVerificationIsPending ? (
								<Button disabled>Verifying...</Button>
							) : (
								<Button type="submit">Verify</Button>
							)}
							<FieldDescription className="text-center">
								Didn&apos;t receive the code?{" "}
								<Button
									variant="link"
									type="button"
									onClick={handleResendEmailCode}
								>
									Resend
								</Button>
							</FieldDescription>
						</FieldGroup>

						<Field>
							{verifyEmailIsError && (
								<div className="text-destructive text-sm text-center">
									{verifyEmailError?.message ||
										"Send OTP failed. Please try again."}
								</div>
							)}
						</Field>
						<Field>
							{resendVerificationIsError && (
								<div className="text-destructive text-sm text-center">
									{resendVerificationError?.message ||
										"Re-send OTP failed. Please try again."}
								</div>
							)}
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
