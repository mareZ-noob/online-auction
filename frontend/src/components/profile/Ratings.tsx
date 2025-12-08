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
import { useFetchUserRatings } from "@/hooks/user-hooks";
import ProductPagination from "../product-page/product-list/ProductPagination";

function Ratings() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: ratings } = useFetchUserRatings(page);

  useEffect(() => {
    if (ratings) {
      setPage(ratings.page);
      setTotalPages(ratings.totalPages);
    }
  }, [ratings]);

  if (!ratings || ratings.content.length === 0) {
    return <div>No ratings available.</div>;
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent ratings.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Seller Name</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Is Positive</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratings?.content.map((rating) => (
            <TableRow key={rating.id}>
              <TableCell className="font-medium">{rating.userName}</TableCell>
              <TableCell>{rating.productName}</TableCell>
              <TableCell>{rating.isPositive ? "Yes" : "No"}</TableCell>
              <TableCell>{rating.comment}</TableCell>
              <TableCell>{rating.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ProductPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}

export default Ratings;
