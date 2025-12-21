import { create } from "zustand";

interface PaymentState {
  productId: string | number;

  sessionId: string | null;
  transactionId: string | number | null;
  shippingAddress: string;
  trackingNumber: string;
  paidAt: string;
  shippedAt: string;
  deliveredAt: string;
  checkoutUrl: string;

  buyerName: string;
  sellerName: string;
}

interface PaymentAction {
  setProductId: (productId: string | number) => void;

  setSessionId: (sessionId: string) => void;
  setTransactionId: (transactionId: string | number) => void;
  setShippingAddress: (address: string) => void;
  setTrackingNumber: (trackingNumber: string) => void;
  setCheckoutUrl: (checkoutUrl: string) => void;
  setPaidAt: (paidAt: string) => void;
  setShippedAt: (shippedAt: string) => void;
  setDeliveredAt: (deliveredAt: string) => void;
  clearPaymentState: () => void;

  setBuyerName: (buyerName: string) => void;
  setSellerName: (sellerName: string) => void;
}

export const usePaymentStore = create<PaymentState & PaymentAction>((set) => ({
  productId: "",

  sessionId: null,
  transactionId: null,
  shippingAddress: "",
  trackingNumber: "",
  checkoutUrl: "",
  paidAt: "",
  shippedAt: "",
  deliveredAt: "",

  buyerName: "",
  sellerName: "",

  setProductId: (productId: string | number) => set({ productId }),

  setSessionId: (sessionId: string) => set({ sessionId }),
  setTransactionId: (transactionId: string | number) => set({ transactionId }),
  setShippingAddress: (address: string) => set({ shippingAddress: address }),
  setTrackingNumber: (trackingNumber: string) =>
    set({ trackingNumber: trackingNumber }),
  setCheckoutUrl: (checkoutUrl: string) => set({ checkoutUrl }),
  setPaidAt: (paidAt: string) => set({ paidAt }),
  setShippedAt: (shippedAt: string) => set({ shippedAt }),
  setDeliveredAt: (deliveredAt: string) => set({ deliveredAt }),
  clearPaymentState: () =>
    set({
      transactionId: null,
      shippingAddress: "",
      trackingNumber: "",
      checkoutUrl: "",
    }),

  setBuyerName: (buyerName: string) => set({ buyerName }),
  setSellerName: (sellerName: string) => set({ sellerName }),
}));
