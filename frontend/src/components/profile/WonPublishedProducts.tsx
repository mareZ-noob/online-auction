import {
  useCheckRatedProducts,
  useFetchAllSales,
  useRateABidder,
} from "@/hooks/seller-hooks";
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
import { formatDateTime, queryClient } from "@/lib/utils";
import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import z from "zod";
import { toastSuccess, toastError } from "../custom-ui/toast/toast-ui";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { Input } from "../ui/input";

const rate_a_bidder_schema = z.object({
  comment: z.string().max(500, "Comment must be at most 500 characters."),
});

function WonPublishedProducts() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(20);

  const [comment, setComment] = useState("");

  const { data: salesData } = useFetchAllSales();
  const { mutate: rateABidder } = useRateABidder();
  const { ratedProducts } = useCheckRatedProducts(salesData?.content || []);

  useEffect(() => {
    if (salesData) {
      setPage(salesData.page);
      setTotalPages(salesData.totalPages);
    }
  }, [salesData]);

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleRateABidder = (
    bidderId: number,
    productId: number,
    isPositive: boolean
  ) => {
    const parsed = rate_a_bidder_schema.safeParse({ comment });

    if (!parsed.success) {
      toastError(parsed.error.issues[0].message);
      return;
    }

    rateABidder(
      {
        userId: bidderId,
        productId,
        isPositive,
        comment: parsed.data.comment,
      },
      {
        onSuccess: (result) => {
          setComment("");
          toastSuccess(result.message);

          queryClient.invalidateQueries({
            queryKey: ["check-rated-bidder-on-product"],
            exact: false,
          });
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
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
            <TableHead className="text-center">Rate Bidder</TableHead>
            <TableHead className="text-center">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesData?.content.map((sale, index) => (
            <TableRow key={sale.id}>
              <TableCell>
                <p className="font-light">{index + 1}</p>
              </TableCell>
              <TableCell>
                <p className="font-light">{sale.productName}</p>
              </TableCell>
              <TableCell>
                <p className="font-light">{sale.buyerName}</p>
              </TableCell>
              <TableCell>
                <p className="font-light">{sale.amount.toFixed(2)}</p>
              </TableCell>
              <TableCell>
                <p className="font-light">{formatDateTime(sale.createdAt)}</p>
              </TableCell>
              <TableCell className="flex items-center justify-center">
                {ratedProducts.includes(sale.productId) ? (
                  <p className="font-light text-center text-sm">Rated</p>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#C1E1C1] mx-auto">
                      <NotificationDialog
                        triggerElement={
                          <ThumbsUp className="text-balck" size={16} />
                        }
                        title="Thank you for your feedback!"
                        description="Your positive rating has been recorded."
                        actionText="Send"
                        cancelText="Cancel"
                        onAction={() =>
                          handleRateABidder(sale.buyerId, sale.productId, true)
                        }
                      >
                        <Input
                          type="text"
                          placeholder="Leave a comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </NotificationDialog>
                    </div>
                    <div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#FAA0A0] mx-auto">
                      <NotificationDialog
                        triggerElement={
                          <ThumbsDown className="text-balck" size={16} />
                        }
                        title="Thank you for your feedback!"
                        description="Your negative rating has been recorded."
                        actionText="Send"
                        cancelText="Cancel"
                        onAction={() =>
                          handleRateABidder(sale.buyerId, sale.productId, false)
                        }
                      >
                        <Input
                          type="text"
                          placeholder="Leave a comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </NotificationDialog>
                    </div>
                  </div>
                )}
              </TableCell>
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
