import { useFetchCategories } from "@/hooks/category-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export default function CategoriesPage() {
	const { data: categories } = useFetchCategories();

	return <Card>
		<CardHeader>
			<CardTitle>Categories ({categories?.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<Accordion type="multiple" className="w-full">
				{categories?.map((category, parentIndex) => (
					<AccordionItem value={category.id.toString()}>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-2">
								<p>{parentIndex + 1}. {category.name}</p>
								<p className="font-light text-gray-500">({category.description})</p>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							{category.children.length > 0 && category.children.map((subCategory, subCategoryIndex) => (<p className="text-gray-500 ml-4 mb-2">{parentIndex + 1}.{subCategoryIndex + 1}. {subCategory.name}</p>))}
							{category.children.length === 0 && <p className="font-light text-gray-500 italic ml-4 mb-2">No Sub Categories</p>}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</CardContent>
	</Card>;
}
