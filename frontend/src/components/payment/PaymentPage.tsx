import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProfilePage from "../profile/ProfilePage";
import PaymentProductItem from "./PaymentProductItem";
import { useFetchBuyerPurchases } from "@/hooks/transaction-hooks";
import { useEffect, useState } from "react";
import ProductPagination from "../product-page/product-list/ProductPagination";
import type { TRANSACTION_STATUS, PURCHASES } from "@/types/Transaction";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";

function PaymentPage() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [currentStatus, setCurrentStatus] =
    useState<TRANSACTION_STATUS>("PENDING_PAYMENT");

  const { data: buyerPurchases, isLoading } = useFetchBuyerPurchases(page);
  const [filteredPurchases, setFilteredPurchases] = useState<PURCHASES[]>([]);

  useEffect(() => {
    if (buyerPurchases) {
      setTotalPages(buyerPurchases.totalPages);
    }
  }, [buyerPurchases]);

  const handleChangeCurrentStatus = (status: TRANSACTION_STATUS) => {
    setCurrentStatus(status);
  };

  useEffect(() => {
    if (buyerPurchases && buyerPurchases.content && currentStatus) {
      setFilteredPurchases(
        buyerPurchases.content.filter(
          (purchase) => purchase.status === currentStatus
        )
      );
    }
  }, [buyerPurchases, currentStatus]);

  return (
    <ProfilePage>
      <Tabs defaultValue="PENDING_PAYMENT" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger
            value="PENDING_PAYMENT"
            onClick={() => handleChangeCurrentStatus("PENDING_PAYMENT")}
          >
            Pending Payment
          </TabsTrigger>
          <TabsTrigger
            value="PAYMENT_CONFIRMED"
            onClick={() => handleChangeCurrentStatus("PAYMENT_CONFIRMED")}
          >
            Payment Confirmed
          </TabsTrigger>
          <TabsTrigger
            value="SHIPPED"
            onClick={() => handleChangeCurrentStatus("SHIPPED")}
          >
            Shipped
          </TabsTrigger>
          <TabsTrigger
            value="DELIVERED"
            onClick={() => handleChangeCurrentStatus("DELIVERED")}
          >
            Delivered
          </TabsTrigger>
          <TabsTrigger
            value="COMPLETED"
            onClick={() => handleChangeCurrentStatus("COMPLETED")}
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="CANCELLED"
            onClick={() => handleChangeCurrentStatus("CANCELLED")}
          >
            Cancelled
          </TabsTrigger>
        </TabsList>
        <TabsContent value={currentStatus}>
          <div className="space-y-4">
            {!isLoading &&
              filteredPurchases &&
              filteredPurchases.map((purchase) => (
                <PaymentProductItem key={purchase.id} data={purchase} />
              ))}
          </div>
          {isLoading && <Spinner text="Loading products..." />}
        </TabsContent>
      </Tabs>
      <ProductPagination
        className="mt-12"
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </ProfilePage>
  );
}

export default PaymentPage;
