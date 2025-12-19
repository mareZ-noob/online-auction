import { Ban } from "lucide-react";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchBidHistoryOfAProduct } from "@/hooks/bid-hooks";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useBlockABidderFromAProduct } from "@/hooks/seller-hooks";
import NotificationDialog from "@/components/custom-ui/dialog/NotificationDialog";
import { useUserStore } from "@/store/user-store";
import { useTranslation } from "react-i18next";

function ProductBidHistory({
  isMine,
  productId,
}: {
  isMine: boolean;
  productId: number;
}) {
  const isSeller = useUserStore((state) => state.isSeller);
  const { t } = useTranslation();

  const { data: bidHistoryList } = useFetchBidHistoryOfAProduct(productId);
  const { mutate: blockABidderMutate } = useBlockABidderFromAProduct();

  const handleBlockABidder = (bidderId: number) => {
    blockABidderMutate(
      { productId, bidderId },
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
    <Table className="max-w-xl">
      <TableCaption>{t("productDetail.bidHistory.caption")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-sm">#</TableHead>
          <TableHead className="w-1/3">
            {t("productDetail.bidHistory.bidTime")}
          </TableHead>
          <TableHead className="w-1/3">
            {t("productDetail.bidHistory.bidderName")}
          </TableHead>
          <TableHead className="text-right w-1/3">
            {t("productDetail.bidHistory.amount")}
          </TableHead>
          {isMine && isSeller && (
            <TableHead className="text-right w-1/3">
              {t("productDetail.bidHistory.block")}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bidHistoryList &&
          bidHistoryList.data &&
          bidHistoryList.data.map((history, index) => (
            <TableRow key={history.createdAt}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">
                {formatDateTime(history.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                {history.maskedUserName}
              </TableCell>
              <TableCell className="font-medium text-right">
                {formatCurrency(history.amount)}
              </TableCell>
              {isMine && isSeller && (
                <TableCell className="font-medium text-right">
                  {!history.blocked && (
                    <NotificationDialog
                      triggerElement={
                        <div className="py-1 px-2 bg-black text-white rounded-sm">
                          <Ban size={16} className="mx-auto" />
                        </div>
                      }
                      title={t("productDetail.bidHistory.blockTitle")}
                      description={t(
                        "productDetail.bidHistory.blockDescription",
                        {
                          bidderName: history.maskedUserName,
                        }
                      )}
                      actionText={t("productDetail.bidHistory.blockAction")}
                      cancelText={t("productDetail.bidHistory.blockCancel")}
                      onAction={() => handleBlockABidder(history.userId)}
                    />
                  )}
                  {history.blocked && (
                    <span className="text-destructive">
                      {t("productDetail.bidHistory.blocked")}
                    </span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

export default ProductBidHistory;
