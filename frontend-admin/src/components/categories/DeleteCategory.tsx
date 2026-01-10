import { useDeleteCategory } from "@/hooks/category-hooks";
import type { CATEGORY, CHILD_CATEGORY } from "@/types/Categories";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";

function DeleteCategory({
    className,
    category,
}: {
    className?: string;
    category: CATEGORY | CHILD_CATEGORY;
}) {
    const { mutate } = useDeleteCategory();

    const handleDeleteCategory = () => {
        mutate({ id: category.id }, {
            onSuccess: () => {
                toastSuccess("Category deleted successfully");
            },
            onError: (error) => {
                toastError(error);
            },
        });
    };

    return (
        <NotificationDialog
            triggerElement={
                <button
                    type="button"
                    className={cn("bg-destructive text-white px-2 py-1 rounded-sm", className)}
                >
                    <Trash size={14} />
                </button>
            }
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            cancelText="Cancel"
            actionText="Delete"
            onAction={handleDeleteCategory}
        />
    )
}

export default DeleteCategory;
