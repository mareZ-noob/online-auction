import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateCategory, useFetchCategories } from "@/hooks/category-hooks";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

const create_a_category_schema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters long"),
	description: z
		.string()
		.min(3, "Description must be at least 3 characters long"),
	parentId: z.string().min(1, "Parent ID is required").nullable(),
});

type CREATE_A_CATEGORY_SCHEMA = z.infer<typeof create_a_category_schema>;

export default function CreateCategoryPage() {
	const { data: categories } = useFetchCategories();

	const {
		register,
		control,
		formState: { errors },
		handleSubmit,
		reset
	} = useForm<CREATE_A_CATEGORY_SCHEMA>({
		resolver: zodResolver(create_a_category_schema),
		defaultValues: {
			name: "",
			description: "",
			parentId: null,
		},
	});

	const { mutate, isPending, isError, error } = useCreateCategory();

	const onSubmit = (data: CREATE_A_CATEGORY_SCHEMA) => {
		const payload = {
			...data,
			parentId: data.parentId ? Number(data.parentId) : null,
		};

		mutate(payload, {
			onSuccess: (result) => {
				toastSuccess(result.message);
				reset();
			},
			onError: (error) => {
				toastError(error);
			},
		});
	};

	return (
		<Card className="max-w-xl">
			<CardHeader>
				<CardTitle>Create a Category</CardTitle>
				<CardDescription>
					Enter your category details below to create a new category. If a category does not belong to any parent, it will become a new parent category.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="name">Category Name</FieldLabel>
							<Input
								id="name"
								placeholder="Category Name"
								{...register("name")}
							/>
							{errors.name?.message && (
								<p className="text-red-500">{errors.name?.message}</p>
							)}
						</Field>
						<Field>
							<FieldLabel htmlFor="description">
								Category Description
							</FieldLabel>
							<Input
								id="description"
								placeholder="Category Description"
								{...register("description")}
							/>
							{errors.description?.message && (
								<p className="text-red-500">{errors.description?.message}</p>
							)}
						</Field>
						<Accordion type="single" collapsible className="w-full">
							<AccordionItem value="item-1">
								<AccordionTrigger className="text-left">
									<p>Choose A Parent Category (Optional)</p>
								</AccordionTrigger>

								<AccordionContent>
									<p className="text-sm text-muted-foreground">
										If you do not choose a parent category for your new
										category, then your new category will be a root category.
									</p>
									<div className="mt-4">
										<Controller
											name="parentId"
											control={control}
											render={({ field }) => (
												<Select
													value={field.value?.toString()}
													onValueChange={field.onChange}
												>
													<SelectTrigger className="w-full" type="button">
														<SelectValue placeholder="Select a parent category" />
													</SelectTrigger>

													<SelectContent>
														<SelectGroup>
															<SelectLabel>Parent Categories</SelectLabel>
															{categories?.map((category, index) => (
																<SelectItem
																	key={category.id}
																	value={category.id.toString()}
																>
																	{index + 1}. {category.name}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</FieldGroup>
					<Button type="submit">
						{isPending ? "Creating..." : "Create Category"}
					</Button>
				</form>
				{isError && error instanceof Error && (
					<div className="my-4 text-red-500">{error.message}</div>
				)}
			</CardContent>
		</Card>
	);
}
