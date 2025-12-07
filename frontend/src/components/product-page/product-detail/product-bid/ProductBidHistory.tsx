import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetchBidHistoryOfAProduct } from "@/hooks/bid-hooks";

function ProductBidHistory({ productId }: { productId: number }) {
  const { data: bidHistoryList } = useFetchBidHistoryOfAProduct(productId);

  return (
    <Table className="max-w-2xl">
      <TableCaption>A list of bid history in this product.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Bid Time</TableHead>
          <TableHead className="w-1/3">Bidder's Name</TableHead>
          <TableHead className="text-right w-1/3">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bidHistoryList &&
          bidHistoryList.data &&
          bidHistoryList.data.map((history) => (
            <TableRow key={history.createdAt}>
              <TableCell className="font-medium">{history.createdAt}</TableCell>
              <TableCell className="font-medium">
                {history.maskedUserName}
              </TableCell>
              <TableCell className="font-medium text-right">
                {history.amount}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

export default ProductBidHistory;
