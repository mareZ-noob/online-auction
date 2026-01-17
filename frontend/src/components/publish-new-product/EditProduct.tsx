import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUpdateProduct } from "@/hooks/seller-hooks";
import { useFetchProductDetailsById, useFetchCategories } from "@/hooks/product-hooks";
import { toastError, toastSuccess } from "@/components/custom-ui/toast/toast-ui.tsx";
import RichTextEditor from "./PublishNewProductDescription.tsx";
import ProductImageManager from "./ProductImageManager";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";
import type { CATEGORY, SUB_CATEGORY } from "@/types/Product";

const blankParagraph = "<p></p>";

const stripHtml = (value: string) =>
    value
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

const editProductSchema = z.object({
    name: z.string().min(1, {
        message: "publish.validation.nameRequired",
    }),
    parentCategoryId: z
        .number()
        .positive({
            message: "publish.validation.parentCategoryRequired",
        })
        .optional()
        .refine((val) => val !== undefined && val !== 0, {
            message: "publish.validation.parentCategoryRequired",
        }),
    categoryId: z
        .number()
        .positive({
            message: "publish.validation.categoryRequired",
        })
        .optional()
        .refine((val) => val !== undefined && val !== 0, {
            message: "publish.validation.categoryRequired",
        }),
    description: z.string().optional(),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

export default function EditProduct() {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: currentProduct, isLoading: isLoadingProduct } =
        useFetchProductDetailsById(Number(productId));

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useFetchCategories();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EditProductFormValues>({
        resolver: zodResolver(editProductSchema),
        defaultValues: {
            name: "",
            parentCategoryId: undefined,
            categoryId: undefined,
            description: "",
        },
    });

    // Track the initial parent category to detect changes
    const initialParentCategoryRef = useRef<number | undefined>(undefined);
    const [parentCategoryChanged, setParentCategoryChanged] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Pre-fill form when product data is loaded
    useEffect(() => {
        if (currentProduct && categories.length > 0 && !isInitialized) {
            // If parentCategoryId is null, find it from the categoryId
            let parentId = currentProduct.parentCategoryId;

            if (!parentId && currentProduct.categoryId) {
                // Find parent category by looking for which category contains this subcategory
                const parent = categories.find((cat: CATEGORY) =>
                    cat.children.some((sub) => sub.id === currentProduct.categoryId)
                );
                parentId = parent?.id ?? null;
            }

            // Set initial parent category ref BEFORE resetting form
            initialParentCategoryRef.current = parentId ?? undefined;

            // Reset form with product data
            reset({
                name: currentProduct.name,
                parentCategoryId: parentId ?? undefined,
                categoryId: currentProduct.categoryId ?? undefined,
                description: "",
            });

            // Mark as initialized AFTER reset
            setIsInitialized(true);
        }
    }, [currentProduct, categories, reset, isInitialized]);

    const parentCategoryId = watch("parentCategoryId");

    const availableSubCategories = useMemo(() => {
        if (!parentCategoryId || parentCategoryId === 0) {
            return [] as SUB_CATEGORY[];
        }

        const parentCategory = categories.find(
            (category: CATEGORY) => category.id === parentCategoryId
        );

        return parentCategory?.children ?? [];
    }, [categories, parentCategoryId]);

    // Clear subcategory only when user actively changes parent category
    useEffect(() => {
        // Skip if form hasn't been initialized yet
        if (!isInitialized) {
            return;
        }

        // If parent category has changed from initial value
        if (parentCategoryId !== initialParentCategoryRef.current) {
            setValue("categoryId", undefined, { shouldDirty: true, shouldValidate: true });
            setParentCategoryChanged(true);
        }
    }, [parentCategoryId, setValue, isInitialized]);

    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct(
        Number(productId)
    );

    const onSubmit = (values: EditProductFormValues) => {
        // Ensure categoryId is defined and is a number
        if (!values.categoryId || values.categoryId === 0) {
            toastError({
                response: {
                    data: {
                        message: t("publish.validation.categoryRequired"),
                    },
                },
            } as AxiosError<ApiResponseError>);
            return;
        }

        const payload = {
            categoryId: values.categoryId as number,
            name: values.name?.trim(),
            additionalDescription:
                values.description && stripHtml(values.description).length > 0
                    ? values.description
                    : undefined,
        };

        updateProduct(payload, {
            onSuccess: () => {
                toastSuccess(t("publish.toast.updateSuccess"));
                navigate("/profile/published-products");
            },
            onError: (error: AxiosError<ApiResponseError>) => {
                toastError(error);
            },
        });
    };
    const buildError = (error?: { message?: string }) =>
        error?.message
            ? [
                {
                    message: t(error.message),
                },
            ]
            : [];

    if (isLoadingProduct) {
        return (
            <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status"
                        >
                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                                Loading...
                            </span>
                        </div>
                        <p className="mt-4 text-gray-600">{t("productDetail.loading")}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
                <div className="text-center py-12">
                    <p className="text-gray-600">Product not found</p>
                    <Button
                        onClick={() => navigate("/profile/published-products")}
                        className="mt-4"
                    >
                        Back to My Products
                    </Button>
                </div>
            </div>
        );
    }

    // Check if product has bids
    const hasBids = currentProduct.bidCount > 0;

    return (
        <div className="mx-auto mt-24 w-full max-w-5xl px-6 pb-16">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/profile/published-products")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <p className="text-2xl font-semibold">Edit Product</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Update product details, description and manage images
                    </p>
                </div>
            </div>

            {hasBids && (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                        ⚠️ This product has {currentProduct.bidCount} bid(s). You cannot
                        change the category for products with existing bids.
                    </p>
                </div>
            )}

            <form className="space-y-8" noValidate onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    {/* Editable Product Name */}
                    <Controller
                        control={control}
                        name="name"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel htmlFor="name">
                                    {t("publish.form.fields.name")}
                                </FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder={t("publish.form.placeholders.name")}
                                    {...field}
                                    aria-invalid={fieldState.error ? "true" : "false"}
                                />
                                <FieldError errors={buildError(fieldState.error)} />
                            </Field>
                        )}
                    />

                    {/* Product Information (Read-only) */}
                    <div className="rounded-lg border bg-gray-50 p-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Pricing & Settings</h3>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Field>
                                <FieldLabel>
                                    {t("publish.form.fields.startingPrice")}
                                </FieldLabel>
                                <Input
                                    value={currentProduct.startingPrice.toLocaleString()}
                                    readOnly
                                    disabled
                                />
                            </Field>

                            <Field>
                                <FieldLabel>{t("publish.form.fields.stepPrice")}</FieldLabel>
                                <Input
                                    value={currentProduct.stepPrice.toLocaleString()}
                                    readOnly
                                    disabled
                                />
                            </Field>

                            <Field>
                                <FieldLabel>{t("publish.form.fields.buyNowPrice")}</FieldLabel>
                                <Input
                                    value={currentProduct.buyNowPrice.toLocaleString()}
                                    readOnly
                                    disabled
                                />
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>{t("publish.form.fields.endTime")}</FieldLabel>
                            <Input
                                value={new Date(currentProduct.endTime)
                                    .toISOString()
                                    .slice(0, 16)}
                                type="datetime-local"
                                readOnly
                                disabled
                            />
                        </Field>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Field>
                                <FieldLabel>Auto Extend</FieldLabel>
                                <Input
                                    value={currentProduct.autoExtend ? "Enabled" : "Disabled"}
                                    readOnly
                                    disabled
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Allow Unrated Bidders</FieldLabel>
                                <Input
                                    value={
                                        currentProduct.allowUnratedBidders
                                            ? "Allowed"
                                            : "Not Allowed"
                                    }
                                    readOnly
                                    disabled
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Category Selection */}
                    {isInitialized && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <Controller
                                control={control}
                                name="parentCategoryId"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="parentCategoryId">
                                            {t("publish.form.fields.parentCategory")}
                                        </FieldLabel>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={(value) =>
                                                field.onChange(value ? Number(value) : undefined)
                                            }
                                            disabled={categoriesLoading || categoriesError || hasBids}
                                        >
                                            <SelectTrigger
                                                className="cursor-pointer"
                                                aria-invalid={errors.parentCategoryId ? "true" : "false"}
                                                id="parentCategoryId"
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        currentProduct?.parentCategoryName ||
                                                        t("publish.form.placeholders.parentCategory")
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category: CATEGORY) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
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
                                        <FieldLabel htmlFor="categoryId">
                                            {t("publish.form.fields.category")}
                                        </FieldLabel>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={(value) =>
                                                field.onChange(value ? Number(value) : undefined)
                                            }
                                            disabled={!availableSubCategories.length || hasBids}
                                        >
                                            <SelectTrigger
                                                className="cursor-pointer"
                                                aria-invalid={errors.categoryId ? "true" : "false"}
                                                id="categoryId"
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        parentCategoryChanged
                                                            ? t("publish.form.placeholders.category")
                                                            : currentProduct?.categoryName ||
                                                            t("publish.form.placeholders.category")
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSubCategories.map(
                                                    (subCategory: SUB_CATEGORY) => (
                                                        <SelectItem
                                                            key={subCategory.id}
                                                            value={subCategory.id.toString()}
                                                        >
                                                            {subCategory.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={buildError(errors.categoryId)} />
                                    </Field>
                                )}
                            />
                        </div>
                    )}

                    {/* Product Images */}
                    <ProductImageManager
                        productId={currentProduct.id}
                        images={currentProduct.images}
                    />

                    {/* Current Description (Read-only) */}
                    <Field>
                        <FieldLabel>Current Description</FieldLabel>
                        <div
                            className="prose prose-neutral max-w-none border rounded-md p-4 bg-gray-50"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(currentProduct.description ?? ""),
                            }}
                        />
                    </Field>

                    {/* Additional Description (Optional) */}
                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel htmlFor="description">
                                    Additional Description (Optional)
                                </FieldLabel>
                                <p className="text-sm text-gray-600 mb-2">
                                    Add more details or updates to your product description
                                </p>
                                <RichTextEditor
                                    value={field.value || blankParagraph}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    error={!!fieldState.error}
                                />
                                <FieldError errors={buildError(fieldState.error)} />
                            </Field>
                        )}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/profile/published-products")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating
                                ? t("publish.form.actions.updating")
                                : t("publish.form.actions.update")}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </div >
    );
}
