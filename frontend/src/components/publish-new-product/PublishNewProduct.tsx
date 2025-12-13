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
import {
  usePublishNewProduct,
  useUpdateProductDescription,
} from "@/hooks/seller-hooks";
import {
  useFetchCategories,
  useFetchProductDetailsById,
} from "@/hooks/product-hooks";
import { toastError, toastSuccess } from "@/components/toast/toast-ui";
import type { CREATE_PRODUCT_PAYLOAD } from "@/types/Seller";
import type { CATEGORY, SUB_CATEGORY } from "@/types/Product";
import RichTextEditor from "./PublishNewProductDescription.tsx";
import PublishNewProductImageUploads from "./PublishNewProductImageUploads";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";

const MIN_IMAGES = 3;
const blankParagraph = "<p></p>";
const imageFileSchema = z.instanceof(File, {
  message: "Please upload a valid image file",
});

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const publishNewProductSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Product name is required" }),
    startingPrice: z.coerce
      .number()
      .gt(0, { message: "Initial price must be greater than 0" }),
    stepPrice: z.coerce
      .number()
      .gt(0, { message: "Step price must be greater than 0" }),
    buyNowPrice: z.coerce
      .number()
      .gt(0, { message: "Buy now price must be greater than 0" }),
    parentCategoryId: z.coerce
      .number()
      .int()
      .gt(0, { message: "Please select a category" }),
    categoryId: z.coerce
      .number()
      .int()
      .gt(0, { message: "Please select a subcategory" }),
    endTime: z
      .string()
      .min(1, { message: "Please choose an end time" })
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "End time must be a valid date",
      })
      .refine((value) => new Date(value).getTime() > Date.now(), {
        message: "End time must be in the future",
      }),
    images: z.array(imageFileSchema).min(MIN_IMAGES, {
      message: `Please upload at least ${MIN_IMAGES} images`,
    }),
    description: z.string().refine((value) => stripHtml(value).length > 0, {
      message: "Product description is required",
    }),
    autoExtend: z.boolean(),
    allowUnratedBidders: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.buyNowPrice <= values.startingPrice) {
      ctx.addIssue({
        path: ["buyNowPrice"],
        code: z.ZodIssueCode.custom,
        message: "Buy now price must be greater than the starting price",
      });
    }
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
  parentCategoryId: 0,
  categoryId: 0,
  endTime: "",
  images: [] as File[],
  description: blankParagraph,
  autoExtend: true,
  allowUnratedBidders: true,
});

function PublishNewProduct({ mode = "create" }: { mode: "create" | "edit" }) {
  const { id: productId } = useParams();

  let defaultValues = useMemo(() => createDefaultValues(), []);

  const { data: currentProduct } = useFetchProductDetailsById(
    Number(productId)
  );

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useFetchCategories();

  if (mode === "edit" && currentProduct) {
    defaultValues = {
      name: currentProduct.name ?? "",
      startingPrice: currentProduct.startingPrice ?? 0,
      stepPrice: currentProduct.stepPrice ?? 0,
      buyNowPrice: currentProduct.buyNowPrice ?? 0,
      parentCategoryId:
        categories?.find((category) =>
          category.children.some(
            (subCategory) => subCategory.id === currentProduct.categoryId
          )
        )?.id ?? 0,
      categoryId: currentProduct.categoryId ?? 0,
      endTime: currentProduct
        ? new Date(currentProduct.endTime).toISOString().slice(0, 16)
        : "",
      description: currentProduct.description ?? blankParagraph,
      autoExtend: currentProduct.autoExtend ?? true,
      allowUnratedBidders: currentProduct.allowUnratedBidders ?? true,
    };
  }

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

  const autoExtendValue = watch("autoExtend");
  const allowUnratedBiddersValue = watch("allowUnratedBidders");
  const parentCategoryId = watch("parentCategoryId");
  const selectedSubCategoryId = watch("categoryId");

  const availableSubCategories = useMemo(() => {
    if (!parentCategoryId) {
      return [] as SUB_CATEGORY[];
    }

    if (mode === "edit" && currentProduct) {
      const currentSubCategory = categories
        .flatMap((category) => category.children)
        .find((subCategory) => subCategory.id === currentProduct.categoryId);

      if (currentSubCategory) {
        return [currentSubCategory];
      }
    }

    const parentCategory = categories.find(
      (category: CATEGORY) => category.id === parentCategoryId
    );

    return parentCategory?.children ?? [];
  }, [categories, parentCategoryId, mode, currentProduct]);

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
  const {
    mutate: updateProductDescription,
    isPending: isUpdatingProductDescription,
  } = useUpdateProductDescription(Number(productId));

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
        toastSuccess("Product published successfully");
        resetFormState();
      },
      onError: (error) => {
        toastError(error);
      },
    });
  };

  const minEndTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }, []);

  const handleUpdatePublishedProduct = () => {
    updateProductDescription(
      {
        additionalDescription: watch("description"),
      },
      {
        onSuccess: () => {
          toastSuccess("Product description updated successfully");
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  return (
    <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
      <p className="mb-8 text-2xl font-semibold">Publish New Product Form</p>
      <form
        className="space-y-8"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Product Name</FieldLabel>
            <Input
              id="name"
              placeholder="Vintage wristwatch"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
              readOnly={mode === "edit"}
            />
            <FieldError errors={errors.name ? [errors.name] : []} />
          </Field>

          <div className="grid gap-6 md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="startingPrice">Initial Price</FieldLabel>
              <Input
                id="startingPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                {...register("startingPrice")}
                aria-invalid={errors.startingPrice ? "true" : "false"}
                readOnly={mode === "edit"}
              />
              <FieldError
                errors={errors.startingPrice ? [errors.startingPrice] : []}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="stepPrice">Step Price</FieldLabel>
              <Input
                id="stepPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="10"
                {...register("stepPrice")}
                aria-invalid={errors.stepPrice ? "true" : "false"}
                readOnly={mode === "edit"}
              />
              <FieldError errors={errors.stepPrice ? [errors.stepPrice] : []} />
            </Field>

            <Field>
              <FieldLabel htmlFor="buyNowPrice">Buy Now Price</FieldLabel>
              <Input
                id="buyNowPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="250"
                {...register("buyNowPrice")}
                aria-invalid={errors.buyNowPrice ? "true" : "false"}
                readOnly={mode === "edit"}
              />
              <FieldError
                errors={errors.buyNowPrice ? [errors.buyNowPrice] : []}
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              control={control}
              name="parentCategoryId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={
                      categoriesLoading || categoriesError || mode === "edit"
                    }
                  >
                    <SelectTrigger
                      aria-invalid={errors.parentCategoryId ? "true" : "false"}
                    >
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? "Loading categories..."
                            : "Select a category"
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
                  <FieldError
                    errors={
                      errors.parentCategoryId ? [errors.parentCategoryId] : []
                    }
                  />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Subcategory</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!availableSubCategories.length || mode === "edit"}
                  >
                    <SelectTrigger
                      aria-invalid={errors.categoryId ? "true" : "false"}
                    >
                      <SelectValue placeholder="Select a subcategory" />
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
                  <FieldError
                    errors={errors.categoryId ? [errors.categoryId] : []}
                  />
                </Field>
              )}
            />
          </div>

          <Field>
            <FieldLabel htmlFor="endTime">Auction End Time</FieldLabel>
            <Input
              id="endTime"
              type="datetime-local"
              min={minEndTime}
              {...register("endTime")}
              aria-invalid={errors.endTime ? "true" : "false"}
              readOnly={mode === "edit"}
            />
            <FieldError errors={errors.endTime ? [errors.endTime] : []} />
          </Field>

          {mode === "create" && (
            <PublishNewProductImageUploads
              key={formResetKey}
              control={control}
              setValue={setValue}
              resetKey={formResetKey}
              minImages={MIN_IMAGES}
            />
          )}

          {mode === "edit" && currentProduct && (
            <Field>
              <FieldLabel>Product Images</FieldLabel>
              {currentProduct.images.length !== 0 && (
                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {currentProduct.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Product Image ${index + 1}`}
                      className="h-32 w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </Field>
          )}

          {mode === "edit" && currentProduct && (
            <Field>
              <FieldLabel>Product Description</FieldLabel>
              <div
                className="prose prose-neutral max-w-none border rounded-md p-4 bg-gray-50"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(currentProduct.description ?? ""),
                }}
              />
            </Field>
          )}

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="description">
                  Product Description
                </FieldLabel>
                <RichTextEditor
                  key={formResetKey}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Auction Settings</FieldLabel>
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
                {autoExtendValue ? "Auto Extend: On" : "Auto Extend: Off"}
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
                  ? "Allow Unrated Bidders: On"
                  : "Allow Unrated Bidders: Off"}
              </Button>
            </div>
          </Field>
        </FieldGroup>

        {mode === "create" && (
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending ? "Publishing..." : "Publish Product"}
          </Button>
        )}
        {mode === "edit" && (
          <Button
            type="button"
            disabled={isUpdatingProductDescription}
            className="w-full md:w-auto"
            onClick={handleUpdatePublishedProduct}
          >
            {isUpdatingProductDescription ? "Updating..." : "Update Product"}
          </Button>
        )}
      </form>
    </div>
  );
}

export default PublishNewProduct;
