import { Pencil } from "lucide-react";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { Field } from "../ui/field";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "../ui/input";
import { useUpdateCategory } from "@/hooks/category-hooks";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import type { CATEGORY, CHILD_CATEGORY } from "@/types/Categories";
import { cn } from "@/lib/utils";

const updateCategorySchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	description: z
		.string()
		.min(3, "Description must be at least 3 characters long"),
	parentId: z.number().nullable().optional(),
});

type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

function UpdateCategory({
	className,
	category,
}: {
	className?: string;
	category: CATEGORY | CHILD_CATEGORY;
}) {
	const { mutate } = useUpdateCategory();

	const { register, handleSubmit, reset } = useForm<UpdateCategoryFormValues>({
		resolver: zodResolver(updateCategorySchema),
		defaultValues: {
			name: "",
			description: "",
			parentId: null,
		},
	});

	const handleOpenForm = (
		e: React.MouseEvent<HTMLButtonElement>,
		category: { name: string; description: string },
	) => {
		e.stopPropagation();

		reset({
			name: category.name,
			description: category.description,
		});
	};

	const handleUpdateCategory = (id: number, data: UpdateCategoryFormValues) => {
		mutate(
			{
				id,
				payload: {
					name: data.name,
					description: data.description,
					parentId: data.parentId || null,
				},
			},
			{
				onSuccess: (result) => {
					toastSuccess(result.message);
				},
				onError: (error) => {
					toastError(error.response?.data.message);
				},
			},
		);
	};

	return (
		<NotificationDialog
			triggerElement={
				<button
					type="button"
					className={cn("bg-black text-white px-2 py-1 rounded-sm", className)}
					onClick={(e) => handleOpenForm(e, category)}
				>
					<Pencil size={12} />
				</button>
			}
			title="Update Category"
			description="Update category details"
			cancelText="Cancel"
			actionText="Update"
			onAction={() =>
				handleSubmit((data) => handleUpdateCategory(category.id, data))()
			}
		>
			<Field>
				<Field className="mb-2">
					<Label>Name</Label>
					<Input {...register("name")} />
				</Field>
				<Field>
					<Label>Description</Label>
					<Input {...register("description")} />
				</Field>
			</Field>
		</NotificationDialog>
	);
}

export default UpdateCategory;
