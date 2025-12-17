import { useFetchCategories } from "@/hooks/category-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../ui/accordion";
import UpdateCategory from "./UpdateCategory";

export default function CategoriesPage() {
	const { data: categories } = useFetchCategories();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Categories ({categories?.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<Accordion type="multiple" className="w-full">
					{categories?.map((category, parentIndex) => (
						<AccordionItem value={category.id.toString()}>
							<div className="flex items-center gap-2">
								<AccordionTrigger className="hover:no-underline flex-1">
									<p>
										{parentIndex + 1}. {category.name}
									</p>
									<p className="font-light text-gray-500">
										({category.description})
									</p>
								</AccordionTrigger>

								<UpdateCategory category={category} />
							</div>

							<AccordionContent>
								{category.children.length > 0 &&
									category.children.map((subCategory, subCategoryIndex) => (
										<div className="flex items-center justify-between mb-2 max-w-md">
											<div className="flex items-center gap-2">
												<p className="ml-4">
													{parentIndex + 1}.{subCategoryIndex + 1}.{" "}
													{subCategory.name}
												</p>
												<p className="font-light text-gray-500">
													({subCategory.description})
												</p>
											</div>
											<UpdateCategory
												className="bg-white border-1 border-black text-black"
												category={subCategory}
											/>
										</div>
									))}
								{category.children.length === 0 && (
									<p className="font-light text-gray-500 italic ml-4 mb-2">
										No Sub Categories
									</p>
								)}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</CardContent>
		</Card>
	);
}
