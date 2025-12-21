import NotificationDialog from "@/components/custom-ui/dialog/NotificationDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useGetTransactionByProductId } from "@/hooks/transaction-hooks";
import { formatCurrency } from "@/lib/utils";
import type { PURCHASES } from "@/types/Transaction";
import TrackingNumber from "../payment-steps/TrackingNumber";
import Spinner from "@/components/custom-ui/loading-spinner/LoadingSpinner";

function SellerPaymentProductItem({ sale }: { sale: PURCHASES }) {
  const { data } = useGetTransactionByProductId(sale.productId);

  if (!data || !data?.transactionId) {
    return <Spinner text="Loading Content..." />;
  }

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
      <TableCell className="flex items-center justify-center">
        <NotificationDialog
          triggerElement={<Button>Update</Button>}
          title="Update Tracking Number"
          description="Update the tracking number for this sale."
          cancelText="Cancel"
          className="min-w-4xl"
        >
          <TrackingNumber transactionId={data?.transactionId} />
        </NotificationDialog>
      </TableCell>
    </TableRow>
  );
}

export default SellerPaymentProductItem;
