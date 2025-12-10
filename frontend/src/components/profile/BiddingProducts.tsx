import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { formatDateTime } from "@/lib/utils";

function BiddingProducts() {
  const navigate = useNavigate();

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

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <ProfilePage>
      <Table>
        <TableCaption>A list of your recent bidding products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Product Description</TableHead>
            <TableHead>Bid Count</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Remaining Time</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {biddingProducts?.content.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word text-gray-400">
                  {index + 1 + page * biddingProducts.size}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
                  {product.name}
                </p>
              </TableCell>
              <TableCell className="max-w-sm ">
                <p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
                  {product.description}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {product.bidCount}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {product.categoryName}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {product.currentPrice}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {formatDateTime(product.endTime)}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {product.timeRemaining}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {formatDateTime(product.createdAt)}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <div
                  className="p-1 rounded-md bg-black"
                  onClick={() => handleViewDetails(product.id)}
                >
                  <Eye className="text-white" size={16} />
                </div>
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
