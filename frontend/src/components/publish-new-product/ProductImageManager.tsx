import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAddProductImage, useRemoveProductImage } from "@/hooks/seller-hooks";
import {
    toastError,
    toastSuccess,
} from "@/components/custom-ui/toast/toast-ui.tsx";
import { useTranslation } from "react-i18next";
import { X, Upload, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { AxiosError } from "axios";
import type { ApiResponseError } from "@/types/ApiResponse";

interface ProductImageManagerProps {
    productId: number;
    images: string[];
}

const MIN_IMAGES = 3;

export default function ProductImageManager({
    productId,
    images,
}: ProductImageManagerProps) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    const { mutate: addImage, isPending: isAdding } = useAddProductImage(productId);
    const { mutate: removeImage, isPending: isRemoving } = useRemoveProductImage(productId);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toastError(new Error(t("publish.validation.imageInvalid")));
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toastError(new Error(t("publish.validation.imageTooLarge")));
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleAddImage = () => {
        if (!selectedFile) return;

        addImage(selectedFile, {
            onSuccess: () => {
                toastSuccess(t("publish.toast.imageAdded"));
                setSelectedFile(null);
                setPreviewUrl(null);
                // Reset file input
                const fileInput = document.getElementById("image-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            },
            onError: (error: AxiosError<ApiResponseError>) => {
                toastError(error);
            },
        });
    };

    const handleRemoveImageClick = (imageUrl: string) => {
        if (images.length <= MIN_IMAGES) {
            toastError(
                new Error(
                    t("publish.validation.minImagesRequired", { count: MIN_IMAGES })
                )
            );
            return;
        }

        setImageToDelete(imageUrl);
    };

    const handleConfirmRemove = () => {
        if (!imageToDelete) return;

        removeImage(imageToDelete, {
            onSuccess: () => {
                toastSuccess(t("publish.toast.imageRemoved"));
                setImageToDelete(null);
            },
            onError: (error: AxiosError<ApiResponseError>) => {
                toastError(error);
                setImageToDelete(null);
            },
        });
    };

    const handleCancelPreview = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        const fileInput = document.getElementById("image-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    return (
        <>
            <Field>
                <FieldLabel>{t("publish.form.fields.images")}</FieldLabel>

                {/* Current Images */}
                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((imageUrl, index) => (
                        <div key={index} className="group relative">
                            <img
                                src={imageUrl}
                                alt={t("publish.images.previewAlt", { index: index + 1 })}
                                className="h-32 w-full rounded object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImageClick(imageUrl)}
                                disabled={isRemoving || images.length <= MIN_IMAGES}
                                className={`absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg transition-opacity hover:bg-red-600 ${images.length <= MIN_IMAGES
                                    ? "cursor-not-allowed opacity-50"
                                    : "opacity-0 group-hover:opacity-100"
                                    }`}
                                title={
                                    images.length <= MIN_IMAGES
                                        ? t("publish.validation.minImagesRequired", { count: MIN_IMAGES })
                                        : t("publish.form.actions.removeImage")
                                }
                            >
                                {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    ))}

                    {/* Preview New Image */}
                    {previewUrl && (
                        <div className="group relative">
                            <img
                                src={previewUrl}
                                alt={t("publish.images.newPreview")}
                                className="h-32 w-full rounded border-2 border-dashed border-blue-500 object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleCancelPreview}
                                disabled={isAdding}
                                className="absolute -right-2 -top-2 rounded-full bg-gray-500 p-1 text-white shadow-lg opacity-0 transition-opacity hover:bg-gray-600 group-hover:opacity-100"
                                title={t("publish.form.actions.cancelPreview")}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Image Section */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={isAdding || isRemoving}
                            className="w-full rounded border border-gray-300 p-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {selectedFile && (
                        <Button
                            type="button"
                            onClick={handleAddImage}
                            disabled={isAdding}
                            className="w-full sm:w-auto"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("publish.form.actions.uploading")}
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t("publish.form.actions.addImage")}
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Info Text */}
                <p className="mt-2 text-sm text-gray-500">
                    {t("publish.info.minImages", { count: MIN_IMAGES })} •{" "}
                    {t("publish.info.currentImages", { count: images.length })}
                </p>
            </Field>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("publish.confirm.removeImage.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("publish.confirm.removeImage.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>
                            {t("publish.confirm.removeImage.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmRemove}
                            disabled={isRemoving}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isRemoving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("publish.form.actions.uploading")}
                                </>
                            ) : (
                                t("publish.confirm.removeImage.confirm")
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
