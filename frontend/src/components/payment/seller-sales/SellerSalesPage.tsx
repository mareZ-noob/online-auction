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
import ProductPagination from "@/components/product-page/product-list/ProductPagination";
import SellerSalesProductItem from "./SellerSalesProductItem";

function SellerSales() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data } = useFetchSellerSales(page);

  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages);
    }
  }, [data]);
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
            <TableHead className="text-center">Chat</TableHead>
            <TableHead className="text-center">Cancel Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.content.map((sale) => (
            <SellerSalesProductItem sale={sale} page={page} />
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

export default SellerSales;
