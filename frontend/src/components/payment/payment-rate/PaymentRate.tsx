import NotificationDialog from "@/components/custom-ui/dialog/NotificationDialog";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCheckARatedProductOfSeller } from "@/hooks/seller-hooks";
import { useRateAUserAfterDelivery } from "@/hooks/transaction-hooks";
import { useCheckARatedProductOfBidder } from "@/hooks/user-hooks";
import { queryClient } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";

const rate_a_seller_schema = z.object({
  comment: z.string().max(500, "profile.validation.commentMax"),
});

function PaymentRate({
  userId,
  productId,
}: {
  userId: number;
  productId: number;
}) {
  const { t } = useTranslation();

  const isSeller = useUserStore((state) => state.isSeller);

  const [updateRate, setUpdateRate] = useState(false);

  const [comment, setComment] = useState("");

  const { mutate: rateAUser } = useRateAUserAfterDelivery();
  const { data: ratedProductInfoOfBidder } =
    useCheckARatedProductOfBidder(productId);
  const { data: ratedProductInfoOfSeller } = useCheckARatedProductOfSeller(
    productId,
    isSeller
  );

  const handleRateASeller = (isPositive: boolean) => {
    const parsed = rate_a_seller_schema.safeParse({ comment });

    if (!parsed.success) {
      toastError(t(parsed.error.issues[0].message));
      return;
    }

    const { comment: validatedComment } = parsed.data;

    rateAUser(
      {
        userId: userId,
        productId: productId,
        isPositive: isPositive,
        comment: validatedComment,
      },
      {
        onSuccess: (result) => {
          setComment("");
          toastSuccess(result.message);

          queryClient.invalidateQueries({
            queryKey: ["check-rated-seller-on-products"],
            exact: false,
          });
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  const positiveAndNegativeRateElement = (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#C1E1C1]">
        <NotificationDialog
          triggerElement={<ThumbsUp className="text-balck" size={16} />}
          title={t("profile.ratingDialog.title")}
          description={t("profile.ratingDialog.positiveDescription")}
          actionText={t("profile.ratingDialog.send")}
          cancelText={t("profile.ratingDialog.cancel")}
          onAction={() => handleRateASeller(true)}
        >
          <Input
            type="text"
            placeholder={t("profile.ratingDialog.placeholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </NotificationDialog>
      </div>
      <div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#FAA0A0]">
        <NotificationDialog
          triggerElement={<ThumbsDown className="text-balck" size={16} />}
          title={t("profile.ratingDialog.title")}
          description={t("profile.ratingDialog.negativeDescription")}
          actionText={t("profile.ratingDialog.send")}
          cancelText={t("profile.ratingDialog.cancel")}
          onAction={() => handleRateASeller(false)}
        >
          <Input
            type="text"
            placeholder={t("profile.ratingDialog.placeholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </NotificationDialog>
      </div>
    </div>
  );

  const updateRateElement = (
    <Button variant={"default"} size={"sm"} onClick={() => setUpdateRate(true)}>
      Update
    </Button>
  );

  if (isSeller) {
    if (
      ratedProductInfoOfSeller &&
      ratedProductInfoOfSeller.data &&
      !updateRate
    ) {
      return updateRateElement;
    }
  }

  if (!isSeller) {
    if (
      ratedProductInfoOfBidder &&
      ratedProductInfoOfBidder.data &&
      !updateRate
    ) {
      return updateRateElement;
    }
  }

  return <div>{positiveAndNegativeRateElement}</div>;
}

export default PaymentRate;
