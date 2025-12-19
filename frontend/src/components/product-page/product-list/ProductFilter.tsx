import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useContext } from "react";
import { ProductListContext } from "@/store/context/product-list-context";
import { useTranslation } from "react-i18next";

function ProductFilter() {
  const { t } = useTranslation();

  const { endtime, setEndtime, price, setPrice, newPublish, setNewPublish } =
    useContext(ProductListContext);

  return (
    <Accordion
      type="multiple"
      className="w-full pr-12"
      defaultValue={["item-1", "item-2", "item-3"]}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="no-underline hover:no-underline">
          <p className="text-xl">{t("filter.endTime")}</p>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <RadioGroup
            value={endtime}
            onValueChange={(v) => setEndtime(v as "desc" | "asc")}
          >
            <label className="flex items-center gap-3">
              <RadioGroupItem id="end-desc" value="desc" />
              <Label htmlFor="end-desc" className="font-light text-black-100">
                {t("filter.graduallyDecrease")}
              </Label>
            </label>
            <label className="flex items-center gap-3">
              <RadioGroupItem id="end-asc" value="asc" />
              <Label htmlFor="end-asc" className="font-light text-black-100">
                {t("filter.graduallyIncrease")}
              </Label>
            </label>
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger className="no-underline hover:no-underline">
          <p className="text-xl">{t("filter.price")}</p>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <RadioGroup
            value={price}
            onValueChange={(v) => setPrice(v as "desc" | "asc")}
          >
            <label className="flex items-center gap-3">
              <RadioGroupItem id="price-desc" value="desc" />
              <Label htmlFor="price-desc" className="font-light text-black-100">
                {t("filter.graduallyDecrease")}
              </Label>
            </label>
            <label className="flex items-center gap-3">
              <RadioGroupItem id="price-asc" value="asc" />
              <Label htmlFor="price-asc" className="font-light text-black-100">
                {t("filter.graduallyIncrease")}
              </Label>
            </label>
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger className="no-underline hover:no-underline">
          <p className="text-xl">{t("filter.other")}</p>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <RadioGroup
            value={newPublish ? "true" : "false"}
            onValueChange={(v) => setNewPublish(v === "true")}
          >
            <label className="flex items-center gap-3">
              <RadioGroupItem id="other-all" value="false" />
              <Label htmlFor="other-all" className="font-light text-black-100">
                {t("filter.all")}
              </Label>
            </label>
            <label className="flex items-center gap-3">
              <RadioGroupItem id="other-new" value="true" />
              <Label htmlFor="other-new" className="font-light text-black-100">
                {t("filter.newPulsihed")}
              </Label>
            </label>
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ProductFilter;
