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
import { usePlaceABid } from "@/hooks/bid-hooks";

type ProductBidProps = {
  productId: number;
  currentPrice: number;
  stepPrice: number;
};

function ProductBid({ productId, currentPrice, stepPrice }: ProductBidProps) {
  const validBidPriceRange = useMemo(() => {
    const start = currentPrice + stepPrice;
    return Array.from({ length: 11 }, (_, i) => start + i * stepPrice);
  }, [currentPrice, stepPrice]);

  const [selectedBidPrice, setSelectedBidPrice] = useState(
    validBidPriceRange[0]
  );
  const [autoBidPrice, setAutoBidPrice] = useState<number | null>(null);

  const [isCheckedAutoBid, setIsCheckedAutoBid] = useState(false);

  const { mutate, isPending, isError, error } = usePlaceABid();

  const handleToggleAutoBid = () => {
    setIsCheckedAutoBid((prev) => !prev);
  };

  const handleSelectBidPrice = (value: string) => {
    setSelectedBidPrice(Number(value));
  };

  const handleSubmitBid = () => {
    mutate({
      productId: productId,
      amount: selectedBidPrice,
      maxAutoBidAmount: autoBidPrice || 0,
    });
  };

  const handleSubmitAutoBid = () => {
    mutate({
      productId: productId,
      amount: 0,
      maxAutoBidAmount: autoBidPrice || 0,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Select
          defaultValue={String(validBidPriceRange[0])}
          disabled={isCheckedAutoBid}
          onValueChange={(value) => handleSelectBidPrice(value)}
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
        <Button
          className="ml-4"
          disabled={isCheckedAutoBid}
          onClick={handleSubmitBid}
        >
          {isPending ? "Placing Bid..." : "Place Bid"}
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
                onValidBid={setAutoBidPrice}
              />
              <Button
                className="ml-4"
                disabled={!isCheckedAutoBid}
                onClick={handleSubmitAutoBid}
              >
                {isPending ? "Placing Bid..." : "Place Bid"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default ProductBid;
