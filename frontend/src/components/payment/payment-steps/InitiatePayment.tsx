import { usePaymentStore } from "@/store/payment-store";

function InitiatePayment() {
  const { checkoutUrl } = usePaymentStore();

  return (
    <div className="mt-4">
      <a
        href={checkoutUrl}
        className="hover:cursor-pointer hover:underline"
        target="_blank"
      >
        <span>Proceed to Payment</span>
        <span className="font-light text-gray-500 italic ml-2">
          [Click this link to proceed to the payment page]
        </span>
      </a>
    </div>
  );
}

export default InitiatePayment;
