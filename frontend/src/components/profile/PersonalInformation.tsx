import { useEffect, useState } from "react";
import {
  useChangePassword,
  useChangeProfile,
  useFetchRequestsToBecomeSeller,
  useFetchUser,
  useUpgradeToSeller,
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
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import Ratings from "./Ratings";
import { cn, formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const email_schema = z
  .string()
  .optional()
  .refine((value) => !value || z.email().safeParse(value).success, {
    message: "profile.personalInformation.validation.invalidEmail",
  });

const password_schema = z
  .string()
  .optional()
  .refine((value) => !value || value.length >= 8, {
    message: "profile.personalInformation.validation.passwordMin",
  });

const upgrade_to_seller_schema = z.object({
  reason: z
    .string()
    .min(10, "profile.personalInformation.validation.reasonMin"),
});

const personal_information_schema = z.object({
  fullName: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: email_schema,
  oldPassword: password_schema,
  newPassword: password_schema,
});

type PersonalInformationFormData = z.infer<typeof personal_information_schema>;
type UpgradeToSellerFormData = z.infer<typeof upgrade_to_seller_schema>;

function PersonalInformation() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { t } = useTranslation();

  const id = useUserStore((state) => state.id);
  const isSeller = useUserStore((state) => state.isSeller);
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

  const {
    register: registerUpgradeToSeller,
    handleSubmit: handleSubmitUpgradeToSeller,
    reset: resetUpgradeToSeller,
    formState: { errors: errorsUpgradeToSeller },
  } = useForm<UpgradeToSellerFormData>({
    resolver: zodResolver(upgrade_to_seller_schema),
    defaultValues: {
      reason: "",
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
          dateOfBirth: data.dateOfBirth
            ? new Date(
                new Date(data.dateOfBirth).getTime() -
                  new Date(data.dateOfBirth).getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 16)
            : "",
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
        dateOfBirth: data.dateOfBirth
          ? new Date(
              new Date(data.dateOfBirth).getTime() -
                new Date(data.dateOfBirth).getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          : "",
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
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString()
            : "",
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

  const [upgradeTpSellerStatus, setUpgradeToSellerStatus] =
    useState<boolean>(false);
  const { data: requestsToBecomeSeller } = useFetchRequestsToBecomeSeller();
  const { mutate: upgradeToSeller } = useUpgradeToSeller();

  const averageRatings =
    data?.positiveRatings && data?.negativeRatings
      ? (data.positiveRatings / (data.positiveRatings + data.negativeRatings)) *
        100
      : 0;

  const onSubmitUpgradeToSeller = (data: UpgradeToSellerFormData) => {
    upgradeToSeller(
      {
        reason: data.reason,
      },
      {
        onSuccess: (result) => {
          resetUpgradeToSeller();
          setUpgradeToSellerStatus(true);
          toastSuccess(result.message);
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  useEffect(() => {
    if (requestsToBecomeSeller && data) {
      const existingRequest = requestsToBecomeSeller.find(
        (request) => request.userId === data.id
      );
      setUpgradeToSellerStatus(!!existingRequest);
    }
  }, [requestsToBecomeSeller, data]);

  return (
    <ProfilePage className="flex flex-col gap-12 ">
      <div className="flex flex-row gap-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {t("profile.personalInformation.cardTitle", {
                name: data?.fullName ?? "",
              })}
            </CardTitle>
            <CardDescription>
              <p className="my-2">
                {t("profile.personalInformation.cardDescription", {
                  createdAt: formatDateTime(data?.createdAt),
                })}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.fullName")}
                  </Label>
                  <Input readOnly={!isEditMode} {...register("fullName")} />
                  {errors.fullName && (
                    <p className="text-destructive text-xs">
                      {errors.fullName.message
                        ? t(errors.fullName.message)
                        : null}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.email")}
                  </Label>
                  <Input readOnly={!isEditMode} {...register("email")} />
                  {errors.email && (
                    <p className="text-destructive text-xs">
                      {errors.email.message ? t(errors.email.message) : null}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.oldPassword")}
                  </Label>
                  <Input
                    placeholder={t(
                      "profile.personalInformation.placeholders.oldPassword"
                    )}
                    type="password"
                    {...register("oldPassword")}
                    readOnly={!isEditMode}
                    className={cn(
                      !isEditMode && "bg-gray-100 cursor-not-allowed"
                    )}
                  />
                  {errors.oldPassword && (
                    <p className="text-destructive text-xs">
                      {errors.oldPassword.message
                        ? t(errors.oldPassword.message)
                        : null}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.confirmNewPassword")}
                  </Label>
                  <Input
                    placeholder={t(
                      "profile.personalInformation.placeholders.newPassword"
                    )}
                    type="password"
                    {...register("newPassword")}
                    readOnly={!isEditMode}
                    className={cn(
                      !isEditMode && "bg-gray-100 cursor-not-allowed"
                    )}
                  />
                  {errors.newPassword && (
                    <p className="text-destructive text-xs">
                      {errors.newPassword.message
                        ? t(errors.newPassword.message)
                        : null}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 mb-4">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.address")}
                  </Label>
                  <Input readOnly={!isEditMode} {...register("address")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.fields.dateOfBirth")}
                  </Label>
                  <Input
                    type="datetime-local"
                    readOnly={!isEditMode}
                    {...register("dateOfBirth")}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end">
                {isEditMode ? (
                  <div className="flex gap-2">
                    <Button type="submit">
                      {t("profile.personalInformation.actions.save")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleToggleEditMode}
                    >
                      {t("profile.personalInformation.actions.cancel")}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={handleToggleEditMode}>
                    {t("profile.personalInformation.actions.edit")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        {isSeller === false && (
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <p>{t("profile.personalInformation.sellerUpgrade.title")}</p>
                  {upgradeTpSellerStatus ? (
                    <p className="ml-2 px-2 py-1 bg-black text-white rounded-sm font-normal text-sm">
                      {t("profile.personalInformation.sellerUpgrade.pending")}
                    </p>
                  ) : (
                    <p className="ml-2 px-2 py-1 bg-black text-white rounded-sm font-normal text-sm">
                      {t("profile.personalInformation.sellerUpgrade.none")}
                    </p>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                {t(
                  "profile.personalInformation.sellerUpgrade.pendingDescription"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full relative">
              <form
                onSubmit={handleSubmitUpgradeToSeller(onSubmitUpgradeToSeller)}
              >
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium leading-none mb-1">
                    {t("profile.personalInformation.sellerUpgrade.reasonLabel")}
                  </Label>
                  <Input {...registerUpgradeToSeller("reason")} />
                  {errorsUpgradeToSeller.reason && (
                    <p className="text-destructive text-xs">
                      {errorsUpgradeToSeller.reason.message
                        ? t(errorsUpgradeToSeller.reason.message)
                        : null}
                    </p>
                  )}
                </div>
                <Button className="absolute bottom-0 right-4" type="submit">
                  {t("profile.personalInformation.sellerUpgrade.requestButton")}
                </Button>
              </form>
              <div className="border-b border-gray-200 my-4" />
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.positiveRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {data?.positiveRatings}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.negativeRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {data?.negativeRatings}
                  </p>
                </div>
              </div>
              <div className="border-b border-gray-200 my-4" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.averageRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {averageRatings?.toFixed(2)}
                    <span className="ml-1">%</span>
                  </p>
                </div>
                {averageRatings < 80 && (
                  <p className="text-xs text-destructive italic mt-2">
                    {t(
                      "profile.personalInformation.sellerUpgrade.averageRatingsWarning"
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {isSeller && (
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <p>{t("profile.personalInformation.sellerUpgrade.title")}</p>
                  <p className="ml-2 px-2 py-1 bg-black text-white rounded-sm font-normal text-sm">
                    {t("profile.personalInformation.sellerUpgrade.approved")}
                  </p>
                </div>
              </CardTitle>
              <CardDescription>
                {t(
                  "profile.personalInformation.sellerUpgrade.approvedDescription"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full relative">
              <div className="border-b border-gray-200 mb-4" />
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.positiveRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {data?.positiveRatings}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.negativeRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {data?.negativeRatings}
                  </p>
                </div>
              </div>
              <div className="border-b border-gray-200 my-4" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm whitespace-nowrap">
                    {t(
                      "profile.personalInformation.sellerUpgrade.averageRatings"
                    )}
                  </p>
                  <p className="text-sm px-3 py-1 rounded-sm bg-black text-white">
                    {averageRatings?.toFixed(2)}
                    <span className="ml-1">%</span>
                  </p>
                </div>
                {averageRatings < 80 && (
                  <p className="text-xs text-destructive italic mt-2">
                    {t(
                      "profile.personalInformation.sellerUpgrade.averageRatingsWarning"
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Ratings />
    </ProfilePage>
  );
}

export default PersonalInformation;
