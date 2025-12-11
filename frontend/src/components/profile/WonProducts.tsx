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
import { useFetchWonProducts } from "@/hooks/user-hooks";
import ProductPagination from "../product-page/product-list/ProductPagination";
import ProfilePage from "./ProfilePage";
import { formatDateTime } from "@/lib/utils";
import { CreditCard, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function WonProducts() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: wonProducts } = useFetchWonProducts(page);

  useEffect(() => {
    if (wonProducts) {
      setPage(wonProducts.page);
      setTotalPages(wonProducts.totalPages);
    }
  }, [wonProducts]);

  if (!wonProducts || wonProducts.content.length === 0) {
    return (
      <ProfilePage>
        <div>You haven't won any products.</div>
      </ProfilePage>
    );
  }

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <ProfilePage>
      <Table>
        <TableCaption>A list of your recent won products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Product Description</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Bid Count</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wonProducts?.content.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word text-gray-400">
                  {index + 1 + page * wonProducts.size}
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
                  {formatDateTime(product.endTime)}
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
                  {formatDateTime(product.createdAt)}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <div
                  className="max-w-8 flex items-center justify-center py-1 rounded-md bg-black"
                  onClick={() => handleViewDetails(product.id)}
                >
                  <Eye className="text-white" size={16} />
                </div>
              </TableCell>
              <TableCell className="max-w-sm">
                <div className="max-w-8 flex items-center justify-center py-1 rounded-md bg-black">
                  <CreditCard className="text-white" size={16} />
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

export default WonProducts;
