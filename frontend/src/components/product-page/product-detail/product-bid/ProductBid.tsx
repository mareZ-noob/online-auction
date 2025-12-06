import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import NumberInput from "./NumberInput";

type ProductBidProps = {
  currentPrice: number;
  stepPrice: number;
};

function ProductBid({ currentPrice, stepPrice }: ProductBidProps) {
  const [isCheckedAutoBid, setIsCheckedAutoBid] = useState(false);

  const validBidPriceRange = useMemo(() => {
    const start = currentPrice + stepPrice;
    return Array.from({ length: 11 }, (_, i) => start + i * stepPrice);
  }, [currentPrice, stepPrice]);

  const handleToggleAutoBid = () => {
    setIsCheckedAutoBid((prev) => !prev);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Select
          defaultValue={String(validBidPriceRange[0])}
          disabled={isCheckedAutoBid}
        >
          <SelectTrigger className="w-full text-lg">
            <SelectValue placeholder="Select Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-lg">Bid Prices</SelectLabel>
              {validBidPriceRange.map((price) => (
                <SelectItem
                  key={price}
                  value={String(price)}
                  className="text-lg"
                >
                  {price}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className="ml-4" disabled={isCheckedAutoBid}>
          Place Bid
        </Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left" onClick={handleToggleAutoBid}>
            <div className="flex items-center gap-3">
              <Checkbox id="terms" checked={isCheckedAutoBid} />
              <Label
                htmlFor="terms"
                onClick={(e: React.MouseEvent<HTMLLabelElement>) =>
                  e.stopPropagation()
                }
                className="text-lg"
              >
                Activate Auto Bid
              </Label>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-end justify-between px-1">
              <NumberInput
                validBid={validBidPriceRange[0]}
                onValidBid={(bid) => console.log("Valid bid:", bid)}
              />
              <Button className="ml-4" disabled={!isCheckedAutoBid}>
                Place Bid
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default ProductBid;
