import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DOMPurify from "dompurify";
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
import { useParams } from "react-router-dom";

const MIN_IMAGES = 3;
const blankParagraph = "<p></p>";

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const publish_new_product_schema = z
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
    images: z
      .array(
        z.string().trim().url({ message: "Please enter a valid image URL" })
      )
      .min(MIN_IMAGES, {
        message: `Please add at least ${MIN_IMAGES} image URLs`,
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

type PublishNewProductFormValues = z.input<typeof publish_new_product_schema>;
type PublishNewProductSubmitValues = z.output<
  typeof publish_new_product_schema
>;

type PublishNewProdutcProps = {
  mode: "create" | "edit";
};

const createDefaultValues = (): Partial<PublishNewProductFormValues> => ({
  name: "",
  parentCategoryId: 0,
  categoryId: 0,
  endTime: "",
  images: Array.from({ length: MIN_IMAGES }, () => ""),
  description: blankParagraph,
  autoExtend: true,
  allowUnratedBidders: true,
});

function PublishNewProduct({ mode = "create" }: PublishNewProdutcProps) {
  const productId = useParams().id as string;

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
      images: currentProduct.images.length
        ? currentProduct.images
        : Array.from({ length: MIN_IMAGES }, () => ""),
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
    getValues,
    watch,
    formState: { errors },
  } = useForm<PublishNewProductFormValues>({
    resolver: zodResolver(publish_new_product_schema),
    defaultValues,
  });

  const imageKeyCounter = useRef(MIN_IMAGES - 1);
  const [imageKeys, setImageKeys] = useState<number[]>(() =>
    Array.from({ length: MIN_IMAGES }, (_, index) => index)
  );

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
  }, [categories, parentCategoryId]);

  useEffect(() => {
    let subCateId = selectedSubCategoryId;

    if (mode === "create" && !subCateId) {
      return;
    }

    if (mode === "edit" && currentProduct) {
      subCateId = currentProduct.categoryId;
    }

    const stillExists = availableSubCategories.some(
      (subCategory) => subCategory.id === subCateId
    );

    if (!stillExists) {
      setValue("categoryId", 0, { shouldDirty: true, shouldValidate: true });
    } else {
      setValue("categoryId", subCateId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [availableSubCategories, selectedSubCategoryId, setValue]);

  useEffect(() => {
    if (mode === "edit" && currentProduct) {
      setImageKeys(
        currentProduct.images.length > 0
          ? currentProduct.images.map((_, index) => index)
          : Array.from({ length: MIN_IMAGES }, (_, index) => index)
      );
      imageKeyCounter.current =
        (currentProduct.images.length > 0
          ? currentProduct.images.length
          : MIN_IMAGES) - 1;

      reset(defaultValues);
    }
  }, [mode, currentProduct]);

  const { mutate, isPending } = usePublishNewProduct();
  const {
    mutate: updateProductDescription,
    isPending: isUpdatingProductDescription,
  } = useUpdateProductDescription(currentProduct ? currentProduct.id : 0);

  const resetFormState = () => {
    reset(createDefaultValues());
    imageKeyCounter.current = MIN_IMAGES - 1;
    setImageKeys(Array.from({ length: MIN_IMAGES }, (_, index) => index));
  };

  const onSubmit = (values: PublishNewProductFormValues) => {
    const parsedValues: PublishNewProductSubmitValues =
      publish_new_product_schema.parse(values);

    if (mode === "edit" && currentProduct) {
      // In edit mode, only allow updating the description
      if (parsedValues.description !== currentProduct.description) {
        updateProductDescription(
          { additionalDescription: parsedValues.description },
          {
            onSuccess: () => {
              toastSuccess("Product description updated successfully");
            },
            onError: (error) => {
              toastError(error);
            },
          }
        );
      }
      return;
    }

    const payload: CREATE_PRODUCT_PAYLOAD = {
      name: parsedValues.name,
      description: parsedValues.description,
      startingPrice: parsedValues.startingPrice,
      stepPrice: parsedValues.stepPrice,
      buyNowPrice: parsedValues.buyNowPrice,
      images: parsedValues.images,
      categoryId: parsedValues.categoryId,
      endTime: new Date(parsedValues.endTime).toISOString(),
      autoExtend: parsedValues.autoExtend,
      allowUnratedBidders: parsedValues.allowUnratedBidders,
    };

    mutate(payload, {
      onSuccess: () => {
        toastSuccess("Product published successfully");
        resetFormState();
      },
      onError: (error) => {
        toastError(error);
      },
    });
  };

  const imageFieldErrors = Array.isArray(errors.images)
    ? errors.images
    : undefined;

  const imageRootError = (
    errors.images as unknown as { root?: { message?: string } }
  )?.root?.message;

  const appendImageField = () => {
    const currentImages = [...(getValues("images") ?? [])];
    currentImages.push("");
    setValue("images", currentImages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    imageKeyCounter.current += 1;
    setImageKeys((keys) => [...keys, imageKeyCounter.current]);
  };

  const removeImageField = (index: number) => {
    if (imageKeys.length <= MIN_IMAGES) {
      return;
    }

    const nextImages = [...(getValues("images") ?? [])];
    nextImages.splice(index, 1);
    setValue("images", nextImages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setImageKeys((keys) => keys.filter((_, keyIndex) => keyIndex !== index));
  };

  const minEndTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }, []);

  return (
    <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
      <p className="mb-8 text-2xl font-semibold">Publish New Product Form</p>
      <form className="space-y-8" noValidate onSubmit={handleSubmit(onSubmit)}>
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
                    value={field.value ? String(field.value) : undefined}
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
                    value={field.value ? String(field.value) : undefined}
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Product Images</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={appendImageField}
                disabled={mode === "edit"}
              >
                Add Image
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {imageKeys.map((key, index) => (
                <Field key={key} className="items-start">
                  <FieldLabel htmlFor={`image-${index}`}>
                    Image URL {index + 1}
                  </FieldLabel>
                  <div className="flex w-full flex-col gap-2 md:flex-row">
                    <Input
                      id={`image-${index}`}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...register(`images.${index}`)}
                      aria-invalid={
                        imageFieldErrors?.[index] ? "true" : "false"
                      }
                      readOnly={mode === "edit"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="md:w-auto"
                      onClick={() => removeImageField(index)}
                      disabled={
                        imageKeys.length <= MIN_IMAGES || mode === "edit"
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <FieldError
                    errors={
                      imageFieldErrors?.[index] ? [imageFieldErrors[index]] : []
                    }
                  />
                </Field>
              ))}
            </div>
            {imageRootError && (
              <FieldError errors={[{ message: imageRootError }]} />
            )}
          </div>

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
                  {mode === "create" && "Product Description"}
                  {mode === "edit" && "Additional Product Description"}
                </FieldLabel>
                <RichTextEditor
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
                disabled={mode === "edit"}
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
                disabled={mode === "edit"}
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
            type="submit"
            disabled={isUpdatingProductDescription}
            className="w-full md:w-auto"
          >
            {isUpdatingProductDescription ? "Updating..." : "Update Product"}
          </Button>
        )}
      </form>
    </div>
  );
}

export default PublishNewProduct;
