import type { PURCHASES } from "@/types/Transaction";
import { Button } from "../ui/button";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import InitiatePayment from "./payment-steps/InitiatePayment";
import {
  useConfirmDelivery,
  useGetTransactionByProductId,
  useInitiatePayment,
} from "@/hooks/transaction-hooks";
import { usePaymentStore } from "@/store/payment-store";
import UpdateShippingAddress from "./payment-steps/UpdateShippingAddress";
import { useEffect } from "react";
import ConfirmDelivery from "./payment-steps/ConfirmDelivery";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import { useFetchProductDetailsById } from "@/hooks/product-hooks";
import { formatCurrency } from "@/lib/utils";
import Chat from "./chat/Chat";
import { MessageCircle } from "lucide-react";

function PaymentProductItem({ data }: { data: PURCHASES }) {
  const status = data.status;
  const productId = data.productId;
  const {
    setProductId,

    setTransactionId,
    setShippingAddress,
    setTrackingNumber,
    setPaidAt,
    setShippedAt,
    setDeliveredAt,
    setCheckoutUrl,

    setBuyerName,
    setSellerName,
  } = usePaymentStore();

  const { data: productDetails } = useFetchProductDetailsById(productId);
  const { data: transactionData } = useGetTransactionByProductId(productId);

  const { mutate } = useInitiatePayment();

  const handlePay = () => {
    mutate(
      {
        transactionId: Number(transactionData?.transactionId),
        currency: "vnd",
      },
      {
        onSuccess: (result) => {
          setCheckoutUrl(result.checkoutUrl);
        },
      }
    );
  };

  useEffect(() => {
    if (transactionData) {
      setProductId(productId);

      setTransactionId(transactionData.transactionId);
      setShippingAddress(
        transactionData.data.transaction.shippingAddress || ""
      );
      setTrackingNumber(transactionData.data.transaction.trackingNumber || "");
      setPaidAt(transactionData.data.transaction.paidAt || "");
      setShippedAt(transactionData.data.transaction.shippedAt || "");
      setDeliveredAt(transactionData.data.transaction.deliveredAt || "");

      setBuyerName(transactionData.data.transaction.buyerName);
      setSellerName(transactionData.data.transaction.sellerName);
    }
  }, [
    transactionData,
    productId,
    setProductId,
    setTransactionId,
    setShippingAddress,
    setTrackingNumber,
    setPaidAt,
    setShippedAt,
    setDeliveredAt,
    setBuyerName,
    setSellerName,
  ]);

  // Step 4
  const { mutate: confirmDelivery } = useConfirmDelivery(productId);

  const handleConfirmDelivery = () => {
    confirmDelivery(
      {
        transactionId: Number(transactionData?.transactionId),
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message || "Delivery confirmed successfully!");
        },
        onError: (error) => {
          toastError(error || "Failed to confirm delivery.");
        },
      }
    );
  };

  return (
    <div className="font-light px-4 py-2 border border-gray-300 rounded-sm flex items-start justify-between">
      <div className="flex gap-4">
        <img
          src={productDetails?.images?.[0]}
          alt={productDetails?.name}
          className="w-28 h-28 object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <p>Product Name:</p>{" "}
            <p className="font-medium">{productDetails?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Buyer:</p>{" "}
            <p className="font-medium">{productDetails?.currentBidderName}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Seller:</p>{" "}
            <p className="font-medium">{productDetails?.sellerName}</p>
          </div>
          <div className="flex items-center gap-2">
            <p>Price:</p>{" "}
            <p className="font-medium">
              {formatCurrency(productDetails?.currentPrice || 0)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        {status === "PENDING_PAYMENT" && (
          <NotificationDialog
            triggerElement={
              <Button size="sm" onClick={handlePay}>
                Pay
              </Button>
            }
            title="Pay with Credit Card"
            description="You will be redirected to the payment gateway to complete your purchase."
            cancelText="Cancel"
            className="min-w-4xl"
          >
            <InitiatePayment />
          </NotificationDialog>
        )}
        {status === "PAYMENT_CONFIRMED" && (
          <NotificationDialog
            triggerElement={
              <Button size="sm" onClick={handlePay}>
                Update Address
              </Button>
            }
            title="Update Address"
            description="Ensure your shipping address is correct before proceeding."
            cancelText="Cancel"
            className="min-w-4xl"
          >
            <UpdateShippingAddress />
          </NotificationDialog>
        )}
        {status === "SHIPPED" && (
          <NotificationDialog
            triggerElement={
              <Button size="sm" onClick={handlePay}>
                Confirm Delivery
              </Button>
            }
            title="Confirm Delivery"
            description="Please confirm that you have received your order."
            cancelText="Cancel"
            className="min-w-4xl"
            actionText="Confirm Delivery"
            onAction={handleConfirmDelivery}
          >
            <ConfirmDelivery />
          </NotificationDialog>
        )}
        {status === "CANCELLED" && (
          <div>
            <p className="font-medium">Cancelation Reason</p>
            <p>{transactionData?.data.transaction.cancellationReason}</p>
          </div>
        )}
        <Chat
          triggerElement={
            <Button size="sm">
              <MessageCircle />
            </Button>
          }
          transactionId={Number(transactionData?.transactionId)}
          sellerName={productDetails?.sellerName}
          buyerName={productDetails?.currentBidderName}
        />
      </div>
    </div>
  );
}

export default PaymentProductItem;
