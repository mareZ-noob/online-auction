import {cn} from "@/lib/utils.ts";
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator} from "@/components/ui/field.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router-dom";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForgotPassword} from "@/hooks/auth-hooks.ts";
import {Card, CardContent } from "../ui/card";

const reset_password_schema = z.object({
    email: z.email({ message: 'Invalid email address' }),
})

type ResetPasswordFormData = z.infer<typeof reset_password_schema>;

function ForgotPassword({
                           className,
                           ...props
                       }: React.ComponentProps<"form">) {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(reset_password_schema)
    })

    const { mutate, isPending, isError, error } = useForgotPassword();

    const onSubmit = async (data: ResetPasswordFormData) => {
        mutate(data, {
            onSuccess: () => {
                navigate("/auth/otp")
            }
        })
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardContent>
                        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Reset your new password</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                        Enter your email below to receive a VERIFIED CODE
                                    </p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" placeholder="m@example.com" required {...register('email')} />
                                    {errors.email && (
                                        <p className="text-destructive text-xs">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </Field>
                                <Field>
                                    {isPending ? <Button disabled>Sending...</Button> : <Button type="submit">Send</Button>}
                                </Field>
                                <FieldSeparator>Or continue with</FieldSeparator>
                                <Field>
                                    <FieldDescription className="text-center">
                                        Already have an account?{" "}
                                        <Link to="/auth/sign-in" className="underline underline-offset-4">
                                            Sign in
                                        </Link>
                                    </FieldDescription>
                                </Field>
                                <Field>
                                    {isError && (
                                        <div className="text-destructive text-sm text-center">
                                            {error?.message || 'Sign up failed. Please try again.'}
                                        </div>
                                    )}
                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ForgotPassword;