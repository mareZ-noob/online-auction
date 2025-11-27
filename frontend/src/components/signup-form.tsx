import {useRef} from "react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import MyReCAPTCHA from "@/components/auth-page/ReCAPTCHA.tsx";

const signup_schema = z.object({
	fullName: z.string().min(3, { message: 'Please enter your full name with at least 3 characters' }),
	address: z.string().min(1, { message: 'Please enter your address with at least 1 characters' }),
	email: z.email({ message: 'Invalid email address' }),
	password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

type SignUpFormData = z.infer<typeof signup_schema>;

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const captchaRef = useRef<ReCAPTCHA>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signup_schema),
	});

	const onSubmit = () => {
		const token = captchaRef.current?.getValue();
		if (!token) {
			alert("Please validate the ReCAPTCHA");
			return;
		}

		console.log("Captcha token:", token);

		// TODO: gửi token lên server để verify bằng secret key
		captchaRef.current?.reset();
	};

	return (
		<form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold">Create your account</h1>
					<p className="text-muted-foreground text-sm text-balance">
						Fill in the form below to create your account
					</p>
				</div>
				<Field>
					<FieldLabel htmlFor="fullName">Full Name</FieldLabel>
					<Input id="fullName" type="text" placeholder="John Doe" required {...register('fullName')}/>
				</Field>
				<Field>
					<FieldLabel htmlFor="address">Address</FieldLabel>
					<Input
						id="address"
						type="text"
						placeholder="227 Nguyen Van Cu, District 5, HCM City"
						required
						{...register('address')}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input id="email" type="email" placeholder="m@example.com" required {...register('email')} aria-invalid={!!errors.email}/>

						{errors.email && (
							<p className="text-destructive text-xs">
								{errors.email.message}
							</p>
						)}
					<FieldDescription>
						We&apos;ll use this to contact you.
					</FieldDescription>
				</Field>
				<Field>
					<Field className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input id="password" type="password" required {...register('password')} aria-invalid={!!errors.password}/>

								{errors.password && (
									<p className="text-destructive text-xs">
										{errors.password.message}
									</p>
								)}
						</Field>
						<Field>
							<FieldLabel htmlFor="confirm-password">
								Confirm Password
							</FieldLabel>
							<Input id="confirm-password" type="password" required />
						</Field>
					</Field>
					<FieldDescription>
						Must be at least 8 characters long.
					</FieldDescription>
				</Field>
				<Field>
					<MyReCAPTCHA captchaRef={captchaRef} />
				</Field>
				<Field>
					<Button type="submit">Create Account</Button>
				</Field>
				<FieldSeparator>Or continue with</FieldSeparator>
				<Field>
					<Button variant="outline" type="button">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 25">
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						Login with Google
					</Button>
					<FieldDescription className="px-6 text-center">
						Already have an account? <Link to="/auth/sign-in">Sign in</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
