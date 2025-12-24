import ProductPagination from "@/components/product-page/product-list/ProductPagination";
import ProfilePage from "@/components/profile/ProfilePage";
import { useFetchSellerSales } from "@/hooks/transaction-hooks";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SellerPaymentProductItem from "./SellerPaymentProductItem";

function SellerPayment() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data } = useFetchSellerSales(page);

  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages);
    }
  }, [data]);

  const filteredData = data?.content.filter(
    (sale) => sale.status === "PAYMENT_CONFIRMED"
  );

  return (
    <ProfilePage>
      <Table>
        <TableCaption>Seller Sales</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shipping Address</TableHead>
            <TableHead>Paid At</TableHead>
            <TableHead className="text-center">
              Update Tracking Number
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.map((sale) => (
            <SellerPaymentProductItem sale={sale} page={page} />
          ))}
        </TableBody>
      </Table>
      <ProductPagination
        className="mt-12"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </ProfilePage>
  );
}

export default SellerPayment;
