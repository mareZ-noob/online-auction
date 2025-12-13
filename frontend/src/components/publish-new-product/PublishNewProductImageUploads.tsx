import type { ChangeEvent } from "react";
import { useEffect, useMemo } from "react";
import { useController } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PublishNewProductFormValues } from "./PublishNewProduct";

type PublishNewProductImageUploadsProps = {
  control: Control<PublishNewProductFormValues>;
  setValue: UseFormSetValue<PublishNewProductFormValues>;
  resetKey: number;
  minImages: number;
};

function PublishNewProductImageUploads({
  control,
  setValue,
  resetKey,
  minImages,
}: PublishNewProductImageUploadsProps) {
  const { field, fieldState } = useController({
    name: "images",
    control,
  });

  const currentImages = (field.value ?? []) as File[];

  const previews = useMemo(
    () =>
      currentImages.map((file, index) => ({
        file,
        url: URL.createObjectURL(file),
        key: `${file.name}-${file.lastModified}-${index}`,
      })),
    [currentImages]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const updateImages = (nextImages: File[]) => {
    field.onChange(nextImages);
    setValue("images", nextImages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const removeImageAtIndex = (index: number) => {
    const nextImages = [...currentImages];
    nextImages.splice(index, 1);
    updateImages(nextImages);
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const combinedFiles = [...currentImages];

    files.forEach((file) => {
      const duplicate = combinedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );
      if (!duplicate) {
        combinedFiles.push(file);
      }
    });

    updateImages(combinedFiles);

    event.target.value = "";
  };

  return (
    <Field>
      <FieldLabel htmlFor="images">Product Images</FieldLabel>
      <Input
        key={resetKey}
        id="images"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        onBlur={field.onBlur}
        ref={field.ref}
        aria-invalid={fieldState.error ? "true" : "false"}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Upload at least {minImages} image files.
      </p>
      {!!previews.length && (
        <div className="mt-3 space-y-2">
          {previews.map((preview, index) => (
            <div
              key={preview.key}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-16 w-16 rounded object-cover"
              />
              <span className="flex-1 truncate" title={preview.file.name}>
                {preview.file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImageAtIndex(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
    </Field>
  );
}

export default PublishNewProductImageUploads;
