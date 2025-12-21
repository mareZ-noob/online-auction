import { formatDateTime } from "@/lib/utils";
import { usePaymentStore } from "@/store/payment-store";

function ConfirmDelivery() {
  const {
    transactionId,
    shippingAddress,
    trackingNumber,
    paidAt,
    shippedAt,
    deliveredAt,

    buyerName,
    sellerName,
  } = usePaymentStore();

  return (
    <div className="mt-2 p-4 border border-[#89CFF0] bg-[#F0FFFF] rounded-lg">
      <h3 className="text-cyan-700 text-lg font-semibold mb-4">
        Review Your Information - Transaction ID: {transactionId}
      </h3>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Buyer Name:</span> {buyerName}
      </div>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Seller Name:</span> {sellerName}
      </div>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Shipping Address:</span> {shippingAddress}
      </div>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Tracking Number:</span> {trackingNumber}
      </div>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Paid At:</span>{" "}
        {paidAt ? formatDateTime(paidAt) : "N/A"}
      </div>
      <div className="text-cyan-800 mb-4">
        <span className="font-medium">Shipped At:</span>{" "}
        {shippedAt ? formatDateTime(shippedAt) : "N/A"}
      </div>
      <div className="text-cyan-800">
        <span className="font-medium">Delivered At:</span>{" "}
        {deliveredAt ? formatDateTime(deliveredAt) : "N/A"}
      </div>
    </div>
  );
}

export default ConfirmDelivery;
