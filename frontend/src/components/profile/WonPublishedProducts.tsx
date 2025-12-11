import { useFetchAllSales } from "@/hooks/seller-hooks";
import ProfilePage from "./ProfilePage";
import { useEffect, useState } from "react";
import ProductPagination from "../product-page/product-list/ProductPagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function WonPublishedProducts() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(20);

  const { data } = useFetchAllSales();

  useEffect(() => {
    if (data) {
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <ProfilePage>
      <Table>
        <TableCaption>A list of products you have sold.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Final Price</TableHead>
            <TableHead>Sold At</TableHead>
            <TableHead className="text-center">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.content.map((sale, index) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{sale.productName}</TableCell>
              <TableCell>{sale.buyerName}</TableCell>
              <TableCell>{sale.amount.toFixed(2)}</TableCell>
              <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
              <TableCell>
                <div
                  className="max-w-8 flex items-center justify-center p-1 rounded-md bg-black mx-auto"
                  onClick={() => handleViewDetails(sale.productId)}
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

export default WonPublishedProducts;
