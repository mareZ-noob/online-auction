import { formatCurrency } from "@/lib/utils";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";
import { useFetchStripeVerification } from "@/hooks/payment-hooks";
import { useSearchParams } from "react-router-dom";

function SuccessfulPaymentModal() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const transactionId = searchParams.get("transaction_id");

  const { data: stripeVerification } = useFetchStripeVerification(
    sessionId || "",
    Number(transactionId)
  );

  return (
    <div
      className="
				fixed top-[50%] left-[50%]
				translate-x-[-50%] translate-y-[-50%]
				flex flex-row w-[1200px] h-[500px]
				rounded-xl border border-gray-300
				bg-white overflow-hidden
				hover:shadow-xl/30 shadow-white transition-all duration-500 ease-in-out scale-105
			"
    >
      <div className="px-8 pt-16 pb-8 w-[70%] flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center mb-6">
            <h1 className="text-3xl text-[#55311c] mr-4">Successful Payment</h1>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <p className="mb-6 text-lg text-[#55311c]">
            Thanks for your payment. Enjoy your journey in Bidding and Selling
            products. 🍀
          </p>
          {stripeVerification && (
            <div className="mt-4 p-4 border border-green-700 bg-green-50 rounded">
              <h3 className="text-green-700 font-semibold mb-2">
                Payment Verification Result:
              </h3>
              <pre className="whitespace-pre-wrap text-green-800">
                SessionId: {stripeVerification.data.sessionId}
              </pre>
              <pre className="whitespace-pre-wrap text-green-800">
                Amount Paid:{" "}
                {formatCurrency(stripeVerification.data.amountPaid)}
              </pre>
              <pre className="whitespace-pre-wrap text-green-800">
                Currency: {stripeVerification.data.currency}
              </pre>
              <pre className="whitespace-pre-wrap text-green-800">
                Payment Status: {stripeVerification.data.paymentStatus}
              </pre>
              <pre className="whitespace-pre-wrap text-green-800">
                Message: {stripeVerification.data.message}
              </pre>
            </div>
          )}
          {!stripeVerification && <Spinner text="Verifying Payment..." />}
        </div>
        <div className="flex flex-row items-center justify-end gap-4">
          <p className="text-[#ccc] text-xs">22127286 - Nguyen Thanh Nam</p>
          <p className="text-[#ccc]">|</p>
          <p className="text-[#ccc] text-xs">22127441 - Thai Huyen Tung</p>
        </div>
      </div>
      <div className="w-[30%]">
        <img
          className="object-cover w-full h-full"
          src="/successful-payment.jpg"
          alt="background-auth"
        />
      </div>
    </div>
  );
}

function SuccessfulPaymentPage() {
  return (
    <div className="relative h-screen w-screen">
      <img
        className="absolute inset-0 w-full h-full object-cover filter blur-sm -z-10"
        src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9yZXN0JTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D"
        alt="auth-bg"
      />
      <SuccessfulPaymentModal />
    </div>
  );
}

export default SuccessfulPaymentPage;
