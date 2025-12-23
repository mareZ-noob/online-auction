import NotificationDialog from "@/components/custom-ui/dialog/NotificationDialog";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  useCancelTransaction,
  useGetTransactionByProductId,
} from "@/hooks/transaction-hooks";
import { formatCurrency } from "@/lib/utils";
import type { PURCHASES } from "@/types/Transaction";
import Spinner from "@/components/custom-ui/loading-spinner/LoadingSpinner";
import { Ban, MessageCircle } from "lucide-react";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import CancelOrder from "../payment-steps/CancelOrder";
import { useState } from "react";
import Chat from "../chat/Chat";
import PaymentRate from "../payment-rate/PaymentRate";

function SellerSalesProductItem({
  sale,
  page,
}: {
  sale: PURCHASES;
  page: number;
}) {
  const { data } = useGetTransactionByProductId(sale.productId);
  const { mutate } = useCancelTransaction(page);
  const [reason, setReason] = useState("User requested cancellation");

  if (!data || !data?.transactionId) {
    return <Spinner text="Loading Content..." />;
  }

  const handleCancelOrder = () => {
    mutate(
      {
        transactionId: data.transactionId,
        reason,
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message || "Order cancelled successfully");
        },
        onError: (error) => {
          toastError(error || "Failed to cancel order");
        },
      }
    );
  };

  return (
    <TableRow key={sale.id}>
      <TableCell>{sale.productName}</TableCell>
      <TableCell>{sale.buyerName}</TableCell>
      <TableCell>{sale.sellerName}</TableCell>
      <TableCell>{formatCurrency(sale.amount)}</TableCell>
      <TableCell>{sale.status}</TableCell>
      <TableCell>{sale.shippingAddress || "N/A"}</TableCell>
      <TableCell>
        {sale.paidAt
          ? new Date(sale.paidAt).toLocaleDateString("en-US")
          : "N/A"}
      </TableCell>
      <TableCell className="text-center">
        <Chat
          triggerElement={
            <div className="max-w-8 flex items-center justify-center py-1 rounded-md bg-black mx-auto">
              <MessageCircle size={16} className="text-white" />
            </div>
          }
          transactionId={Number(data.transactionId)}
          sellerName={sale.sellerName}
          buyerName={sale.buyerName}
        />
      </TableCell>
      {sale.status !== "COMPLETED" ? (
        <TableCell className="text-center">
          <PaymentRate userId={sale.buyerId} productId={sale.productId} />
        </TableCell>
      ) : (
        <TableCell>
          <p className="text-center font-semibold">Rated</p>
        </TableCell>
      )}
      <TableCell className="text-center">
        {sale.status === "PENDING_PAYMENT" && (
          <NotificationDialog
            triggerElement={
              <div className="max-w-8 flex items-center justify-center py-1 rounded-md bg-destructive mx-auto">
                <Ban size={16} className="text-white" />
              </div>
            }
            title={`Cancel Order for ${sale.productName} bought by ${sale.buyerName}`}
            description="Are you sure you want to cancel this order? This action cannot be undone."
            cancelText="Cancel"
            actionText="Confirm"
            onAction={handleCancelOrder}
          >
            <CancelOrder reason={reason} setReason={setReason} />
          </NotificationDialog>
        )}
      </TableCell>
    </TableRow>
  );
}

export default SellerSalesProductItem;
