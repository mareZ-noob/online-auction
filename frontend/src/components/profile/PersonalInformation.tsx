import { useEffect, useState } from "react";
import {
  useChangePassword,
  useChangeProfile,
  useFetchUser,
} from "@/hooks/user-hooks";
import { useUserStore } from "@/store/user-store";
import ProfilePage from "./ProfilePage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "../toast/toast-ui";
import Ratings from "./Ratings";

const emailSchema = z
  .string()
  .optional()
  .refine((value) => !value || z.email().safeParse(value).success, {
    message: "Invalid email address",
  });

const passwordSchema = z
  .string()
  .optional()
  .refine((value) => !value || value.length >= 8, {
    message: "Password must be at least 8 characters",
  });

const personal_information_schema = z.object({
  fullName: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: emailSchema,
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

type PersonalInformationFormData = z.infer<typeof personal_information_schema>;

function PersonalInformation() {
  const [isEditMode, setIsEditMode] = useState(false);

  const id = useUserStore((state) => state.id);
  const { data } = useFetchUser(id ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInformationFormData>({
    resolver: zodResolver(personal_information_schema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      dateOfBirth: "",
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleToggleEditMode = () => {
    setIsEditMode((prev) => {
      const next = !prev;
      if (!next && data) {
        reset({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          dateOfBirth: data.dateOfBirth ?? "",
          oldPassword: "",
          newPassword: "",
        });
      }
      return next;
    });
  };

  useEffect(() => {
    if (data) {
      reset({
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        dateOfBirth: data.dateOfBirth ?? "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [data, reset]);

  const { mutate: changeProfile } = useChangeProfile();
  const { mutate: changePassword } = useChangePassword();

  const onSubmit = (data: PersonalInformationFormData) => {
    if (data.oldPassword && data.newPassword) {
      changePassword(
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
        {
          onSuccess: (result) => {
            setIsEditMode(false);
            toastSuccess(result.message);
          },
          onError: (error) => {
            toastError(error);
          },
        }
      );
    } else {
      changeProfile(
        {
          fullName: data.fullName ?? "",
          address: data.address ?? "",
          dateOfBirth: data.dateOfBirth ?? "",
        },
        {
          onSuccess: (result) => {
            setIsEditMode(false);
            toastSuccess(result.message);
          },
          onError: (error) => {
            toastError(error);
          },
        }
      );
    }
  };

  return (
    <ProfilePage className="flex flex-col gap-12 ">
      <div className="flex flex-row gap-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{data?.fullName}'s personal information</CardTitle>
            <CardDescription>
              <p className="my-2">
                This is the private information about you, please keep it safe.
                This account is created at {data?.createdAt}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium leading-none mb-1">
                    Full Name
                  </Label>
                  <Input readOnly={!isEditMode} {...register("fullName")} />
                  {errors.fullName && (
                    <p className="text-destructive text-xs">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    Email
                  </Label>
                  <Input readOnly={!isEditMode} {...register("email")} />
                  {errors.email && (
                    <p className="text-destructive text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="flex flex-col gap-2 mb-4">
                    <Label className="text-sm font-medium leading-none mb-1">
                      Password
                    </Label>
                    <Input
                      placeholder="Your old password"
                      type="password"
                      {...register("oldPassword")}
                    />
                    {errors.oldPassword && (
                      <p className="text-destructive text-xs">
                        {errors.oldPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    <Label className="text-sm font-medium leading-none mb-1">
                      Confirm New Password
                    </Label>
                    <Input
                      placeholder="Your new password"
                      type="password"
                      {...register("newPassword")}
                    />
                    {errors.newPassword && (
                      <p className="text-destructive text-xs">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    Address
                  </Label>
                  <Input readOnly={!isEditMode} {...register("address")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium leading-none mb-1">
                    Date of Birth
                  </Label>
                  <Input readOnly={!isEditMode} {...register("dateOfBirth")} />
                </div>
              </div>
              <div className="flex items-center justify-end">
                {isEditMode ? (
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleToggleEditMode}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={handleToggleEditMode}>
                    Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle>Seller Upgrade</CardTitle>
            <CardDescription>
              Become a seller to start auctioning your products. And the
              Administrator will review your request soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full relative">
            <div className="border border-gray-100 mb-4" />
            <div className="flex items-center gap-2 mb-2">
              <p className="text-md">Positive Ratings:</p>
              <p className="text-md px-3 py-1 rounded-sm bg-black text-white">
                {data?.positiveRatings}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-md">Negative Ratings:</p>
              <p className="text-md px-3 py-1 rounded-sm bg-black text-white">
                {data?.negativeRatings}
              </p>
            </div>
            <div className="border border-gray-100 mt-4" />
            <Button className="absolute bottom-0 right-4">
              Request to be a Seller
            </Button>
          </CardContent>
        </Card>
      </div>
      <Ratings />
    </ProfilePage>
  );
}

export default PersonalInformation;
