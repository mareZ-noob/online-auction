import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublishNewProduct } from "@/hooks/seller-hooks";
import { useFetchCategories } from "@/hooks/product-hooks";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui.tsx";
import type { CREATE_PRODUCT_PAYLOAD } from "@/types/Seller";
import type { CATEGORY, SUB_CATEGORY } from "@/types/Product";
import RichTextEditor from "./PublishNewProductDescription.tsx";
import PublishNewProductImageUploads from "./PublishNewProductImageUploads";
import { useTranslation } from "react-i18next";

import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";

const MIN_IMAGES = 3;
const blankParagraph = "<p></p>";
const imageFileSchema = z.instanceof(File, {
  message: "publish.validation.imageInvalid",
});

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const publishNewProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "publish.validation.nameRequired" }),
    startingPrice: z.coerce
      .number()
      .gt(20000, { message: "publish.validation.startingPricePositive" }),
    stepPrice: z.coerce
      .number()
      .gt(1000, { message: "publish.validation.stepPricePositive" }),
    buyNowPrice: z.coerce
      .number()
      .gt(20000, { message: "publish.validation.buyNowPricePositive" }),
    parentCategoryId: z
      .number()
      .int()
      .gt(0, { message: "publish.validation.categoryRequired" })
      .optional(),
    categoryId: z
      .number()
      .int()
      .gt(0, { message: "publish.validation.subcategoryRequired" })
      .optional(),
    endTime: z
      .string()
      .min(1, { message: "publish.validation.endTimeRequired" })
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "publish.validation.endTimeInvalid",
      })
      .refine((value) => new Date(value).getTime() > Date.now(), {
        message: "publish.validation.endTimeFuture",
      }),
    images: z.array(imageFileSchema).min(MIN_IMAGES, {
      message: "publish.validation.imagesMin",
    }),
    description: z.string().refine((value) => stripHtml(value).length > 0, {
      message: "publish.validation.descriptionRequired",
    }),
    autoExtend: z.boolean(),
    allowUnratedBidders: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.buyNowPrice <= values.startingPrice) {
      ctx.addIssue({
        path: ["buyNowPrice"],
        code: z.ZodIssueCode.custom,
        message: "publish.validation.buyNowGreater",
      });
    }

    if (!values.parentCategoryId && !values.categoryId) {
      ctx.addIssue({
        path: ["categoryId"],
        code: z.ZodIssueCode.custom,
        message: "publish.validation.categoryOrSubcategory",
      });
    }
  })
  .transform((v) => {
    const categoryId = v.categoryId ?? v.parentCategoryId;
    console.log(categoryId, v);
    if (!categoryId) {
      throw new Error("CategoryId normalization failed");
    }
    return {
      ...v,
      categoryId,
    };
  });

export type PublishNewProductFormValues = z.input<
  typeof publishNewProductSchema
>;
type PublishNewProductSubmitValues = z.output<typeof publishNewProductSchema>;

const createDefaultValues = (): Partial<PublishNewProductFormValues> => ({
  name: "",
  startingPrice: "",
  stepPrice: "",
  buyNowPrice: "",
  parentCategoryId: undefined,
  categoryId: undefined,
  endTime: "",
  images: [] as File[],
  description: blankParagraph,
  autoExtend: true,
  allowUnratedBidders: true,
});

function PublishNewProduct() {
  const { t } = useTranslation();

  const defaultValues = useMemo(() => createDefaultValues(), []);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useFetchCategories();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PublishNewProductFormValues>({
    resolver: zodResolver(publishNewProductSchema),
    defaultValues,
  });

  const [formResetKey, setFormResetKey] = useState(0);

  const buildError = (error?: { message?: string }) =>
    error?.message
      ? [
        {
          message: t(error.message, { count: MIN_IMAGES }),
        },
      ]
      : [];

  const autoExtendValue = watch("autoExtend");
  const allowUnratedBiddersValue = watch("allowUnratedBidders");
  const parentCategoryId = watch("parentCategoryId");
  const selectedSubCategoryId = watch("categoryId");

  const availableSubCategories = useMemo(() => {
    if (!parentCategoryId) {
      return [] as SUB_CATEGORY[];
    }

    const parentCategory = categories.find(
      (category: CATEGORY) => category.id === parentCategoryId
    );

    return parentCategory?.children ?? [];
  }, [categories, parentCategoryId]);

  useEffect(() => {
    if (!selectedSubCategoryId) {
      return;
    }

    const stillExists = availableSubCategories.some(
      (subCategory) => subCategory.id === selectedSubCategoryId
    );

    if (!stillExists) {
      setValue("categoryId", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [availableSubCategories, selectedSubCategoryId, setValue]);

  const { mutate, isPending } = usePublishNewProduct();

  const resetFormState = () => {
    reset(createDefaultValues());
    setFormResetKey((key) => key + 1);
  };

  const onSubmit = (values: PublishNewProductFormValues) => {
    const parsedValues: PublishNewProductSubmitValues =
      publishNewProductSchema.parse(values);

    const productPayload: CREATE_PRODUCT_PAYLOAD = {
      name: parsedValues.name,
      description: parsedValues.description,
      startingPrice: parsedValues.startingPrice,
      stepPrice: parsedValues.stepPrice,
      buyNowPrice: parsedValues.buyNowPrice,
      categoryId: parsedValues.categoryId,
      endTime: new Date(parsedValues.endTime).toISOString(),
      autoExtend: parsedValues.autoExtend,
      allowUnratedBidders: parsedValues.allowUnratedBidders,
      images: parsedValues.images,
    };

    mutate(productPayload, {
      onSuccess: () => {
        toastSuccess(t("publish.toast.createSuccess"));
        resetFormState();
      },
      onError: (error: AxiosError<ApiResponseError>) => {
        toastError(error);
      },
    });
  };

  const minEndTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }, []);



  return (
    <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
      <p className="mb-8 text-2xl font-semibold">{t("publish.form.title")}</p>

      <form
        className="space-y-8"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">
              {t("publish.form.fields.name")}
            </FieldLabel>
            <Input
              id="name"
              placeholder={t("publish.form.placeholders.name")}
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}

            />
            <FieldError errors={buildError(errors.name)} />
          </Field>

          <div className="grid gap-6 md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="startingPrice">
                {t("publish.form.fields.startingPrice")}
              </FieldLabel>
              <Input
                id="startingPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("publish.form.placeholders.startingPrice")}
                {...register("startingPrice")}
                aria-invalid={errors.startingPrice ? "true" : "false"}
              />
              <FieldError errors={buildError(errors.startingPrice)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="stepPrice">
                {t("publish.form.fields.stepPrice")}
              </FieldLabel>
              <Input
                id="stepPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("publish.form.placeholders.stepPrice")}
                {...register("stepPrice")}
                aria-invalid={errors.stepPrice ? "true" : "false"}
              />
              <FieldError errors={buildError(errors.stepPrice)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="buyNowPrice">
                {t("publish.form.fields.buyNowPrice")}
              </FieldLabel>
              <Input
                id="buyNowPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("publish.form.placeholders.buyNowPrice")}
                {...register("buyNowPrice")}
                aria-invalid={errors.buyNowPrice ? "true" : "false"}
              />
              <FieldError errors={buildError(errors.buyNowPrice)} />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="parentCategoryId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("publish.form.fields.parentCategory")}</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : undefined)
                    }
                    disabled={
                      categoriesLoading || categoriesError
                    }
                  >
                    <SelectTrigger
                      aria-invalid={errors.parentCategoryId ? "true" : "false"}
                    >
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? t("publish.form.loadingCategories")
                            : t("publish.form.categoryPlaceholder")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={buildError(errors.parentCategoryId)} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    {t("publish.form.fields.category")}
                  </FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) =>
                      field.onChange(value ? Number(value) : undefined)
                    }
                    disabled={!availableSubCategories.length}
                  >
                    <SelectTrigger
                      aria-invalid={errors.categoryId ? "true" : "false"}
                    >
                      <SelectValue
                        placeholder={t("publish.form.subcategoryPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubCategories.map((subCategory) => (
                        <SelectItem
                          key={subCategory.id}
                          value={String(subCategory.id)}
                        >
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={buildError(errors.categoryId)} />
                </Field>
              )}
            />
          </div>

          <Field>
            <FieldLabel htmlFor="endTime">
              {t("publish.form.fields.endTime")}
            </FieldLabel>
            <Input
              id="endTime"
              type="datetime-local"
              min={minEndTime}
              {...register("endTime")}
              aria-invalid={errors.endTime ? "true" : "false"}

            />
            <FieldError errors={buildError(errors.endTime)} />
          </Field>

          <PublishNewProductImageUploads
            key={formResetKey}
            control={control}
            setValue={setValue}
            resetKey={formResetKey}
            minImages={MIN_IMAGES}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="description">
                  {t("publish.form.fields.description")}
                </FieldLabel>
                <RichTextEditor
                  key={formResetKey}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                />
                <FieldError errors={buildError(fieldState.error)} />
              </Field>
            )}
          />

          <div className="flex">
            <Field>
              <FieldLabel>{t("publish.form.fields.settings")}</FieldLabel>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={autoExtendValue ? "default" : "outline"}
                  aria-pressed={autoExtendValue}
                  onClick={() =>
                    setValue("autoExtend", !autoExtendValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  {autoExtendValue
                    ? t("publish.form.autoExtendOn")
                    : t("publish.form.autoExtendOff")}
                </Button>
                <Button
                  type="button"
                  variant={allowUnratedBiddersValue ? "default" : "outline"}
                  aria-pressed={allowUnratedBiddersValue}
                  onClick={() =>
                    setValue("allowUnratedBidders", !allowUnratedBiddersValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  {allowUnratedBiddersValue
                    ? t("publish.form.allowUnratedOn")
                    : t("publish.form.allowUnratedOff")}
                </Button>
              </div>
            </Field>
            <Field>
              <div className="flex flex-col items-end gap-3">
                <FieldLabel>{t("publish.form.fields.publish")}</FieldLabel>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full md:w-auto"
                >
                  {isPending
                    ? t("publish.form.actions.publishing")
                    : t("publish.form.actions.publish")}
                </Button>
              </div>
            </Field>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

export default PublishNewProduct;
