import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchBiddingProducts } from "@/hooks/user-hooks";
import ProductPagination from "../product-page/product-list/ProductPagination";
import ProfilePage from "./ProfilePage";

function BiddingProducts() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: biddingProducts } = useFetchBiddingProducts(page);

  useEffect(() => {
    if (biddingProducts) {
      setPage(biddingProducts.page);
      setTotalPages(biddingProducts.totalPages);
    }
  }, [biddingProducts]);

  if (!biddingProducts || biddingProducts.content.length === 0) {
    return (
      <ProfilePage>
        <div>You haven't placed any bids.</div>
      </ProfilePage>
    );
  }

  return (
    <ProfilePage>
      <Table>
        <TableCaption>A list of your recent ratings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product Name</TableHead>
            <TableHead>Product Description</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Buy Now Price</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Remaining Time</TableHead>
            <TableHead>Bid Count</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {biddingProducts?.content.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.name}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.description}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.currentPrice}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.buyNowPrice}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.endTime}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.timeRemaining}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.bidCount}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.categoryName}
              </TableCell>
              <TableCell className="font-normal max-w-sm whitespace-normal wrap-break-word">
                {product.createdAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ProductPagination
        className="mt-12"
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </ProfilePage>
  );
}

export default BiddingProducts;
