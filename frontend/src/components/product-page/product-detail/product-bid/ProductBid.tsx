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
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import NotificationDialog from "@/components/custom-ui/dialog/NotificationDialog";

type ProductBidProps = {
  isCurrentUserBlocked: boolean;
  productId: number;
  currentPrice: number;
  stepPrice: number;
};

function ProductBid({
  isCurrentUserBlocked,
  productId,
  currentPrice,
  stepPrice,
}: ProductBidProps) {
  const validBidPriceRange = useMemo(() => {
    const start = currentPrice + stepPrice;
    return Array.from({ length: 11 }, (_, i) => start + i * stepPrice);
  }, [currentPrice, stepPrice]);

  const [selectedBidPrice, setSelectedBidPrice] = useState(
    validBidPriceRange[0]
  );

  const [maxAutoBidPrice, setMaxAutoBidPrice] = useState<number | null>(null);

  const [isCheckedAutoBid, setIsCheckedAutoBid] = useState(false);

  const { mutate, isPending } = usePlaceABid();
  const { t } = useTranslation();
  const minBid = validBidPriceRange[0] ?? 0;

  const handleToggleAutoBid = () => {
    setIsCheckedAutoBid((prev) => !prev);
  };

  const handleSelectBidPrice = (value: string) => {
    setSelectedBidPrice(Number(value));
  };

  const handleSubmitBid = () => {
    mutate(
      {
        productId: productId,
        amount: selectedBidPrice,
        maxAutoBidAmount: null,
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message);
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  const handleSubmitAutoBid = () => {
    mutate(
      {
        productId: productId,
        amount: currentPrice + stepPrice,
        maxAutoBidAmount: maxAutoBidPrice || 0,
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message);
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Select
          defaultValue={String(minBid)}
          disabled={isCheckedAutoBid || isCurrentUserBlocked}
          onValueChange={(value) => handleSelectBidPrice(value)}
        >
          <SelectTrigger className="w-full text-lg">
            <SelectValue
              placeholder={t("productDetail.bid.selectPricePlaceholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-lg">
                {t("productDetail.bid.bidPricesLabel")}
              </SelectLabel>
              {validBidPriceRange.map((price) => (
                <SelectItem
                  key={price}
                  value={String(price)}
                  className="text-lg"
                >
                  {formatCurrency(price)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <NotificationDialog
          triggerElement={
            <Button
              className="ml-4"
              disabled={isCheckedAutoBid || isCurrentUserBlocked}
            >
              {isPending
                ? t("productDetail.bid.placingBid")
                : t("productDetail.bid.placeBid")}
            </Button>
          }
          title={t("productDetail.bid.manualBidTitle")}
          description={t("productDetail.bid.manualBidDescription")}
          actionText={t("productDetail.bid.placeBid")}
          cancelText={t("productDetail.bid.cancel")}
          onAction={handleSubmitBid}
        />
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        disabled={isCurrentUserBlocked}
      >
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
                {t("productDetail.bid.activateAutoBid")}
              </Label>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col items-end justify-between px-1">
              <NumberInput
                label={t("productDetail.bid.maxBudgetLabel")}
                placeholder={t("productDetail.bid.autoBidPlaceholder", {
                  value: minBid,
                })}
                validBid={minBid}
                onValidBid={setMaxAutoBidPrice}
              />
              <NotificationDialog
                triggerElement={
                  <Button
                    className="ml-4 mt-4"
                    disabled={!isCheckedAutoBid}
                  >
                    {isPending
                      ? t("productDetail.bid.placingBid")
                      : t("productDetail.bid.placeBid")}
                  </Button>
                }
                title={t("productDetail.bid.autoBidTitle")}
                description={t("productDetail.bid.autoBidDescription")}
                actionText={t("productDetail.bid.placeBid")}
                cancelText={t("productDetail.bid.cancel")}
                onAction={handleSubmitAutoBid}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

export default ProductBid;
