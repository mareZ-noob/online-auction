import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function ProductFilter() {
	return (
		<Accordion
			type="multiple"
			className="w-full pr-12"
			defaultValue={["item-1", "item-2", "item-3"]}
		>
			<AccordionItem value="item-1">
				<AccordionTrigger className="no-underline hover:no-underline">
					<p className="text-xl">End Time</p>
				</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-4 text-balance">
					<div className="flex items-center gap-3">
						<Checkbox id="terms" />
						<Label htmlFor="terms" className="font-light text-black-100">
							Gradually Decrease
						</Label>
					</div>
					<div className="flex items-center gap-3">
						<Checkbox id="terms" />
						<Label htmlFor="terms" className="font-light text-black-100">
							Gradually Increase
						</Label>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger className="no-underline hover:no-underline">
					<p className="text-xl">Price</p>
				</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-4 text-balance">
					<div className="flex items-center gap-3">
						<Checkbox id="terms" />
						<Label htmlFor="terms" className="font-light text-black-100">
							Gradually Decrease
						</Label>
					</div>
					<div className="flex items-center gap-3">
						<Checkbox id="terms" />
						<Label htmlFor="terms" className="font-light text-black-100">
							Gradually Increase
						</Label>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger className="no-underline hover:no-underline">
					<p className="text-xl">Other</p>
				</AccordionTrigger>
				<AccordionContent className="flex flex-col gap-4 text-balance">
					<div className="flex items-center gap-3">
						<Checkbox id="terms" />
						<Label htmlFor="terms" className="font-light text-black-100">
							New Publish
						</Label>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

export default ProductFilter;
