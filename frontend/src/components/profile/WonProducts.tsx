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
import {
  useFetchWonProducts,
  useRateASeller,
  useCheckRatedProducts,
} from "@/hooks/user-hooks";
import ProductPagination from "../product-page/product-list/ProductPagination";
import ProfilePage from "./ProfilePage";
import { formatDateTime, queryClient } from "@/lib/utils";
import { Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toastSuccess, toastError } from "../custom-ui/toast/toast-ui";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { Input } from "../ui/input";
import z from "zod";
import { useTranslation } from "react-i18next";

const rate_a_seller_schema = z.object({
  comment: z.string().max(500, "profile.validation.commentMax"),
});

function WonProducts() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [comment, setComment] = useState("");

  const { data: wonProducts } = useFetchWonProducts(page);
  const { mutate: rateASeller } = useRateASeller();
  const { ratedProducts } = useCheckRatedProducts(wonProducts?.content || []);

  useEffect(() => {
    if (wonProducts) {
      setPage(wonProducts.page);
      setTotalPages(wonProducts.totalPages);
    }
  }, [wonProducts]);

  if (!wonProducts || wonProducts.content.length === 0) {
    return (
      <ProfilePage>
        <div>{t("profile.wonProducts.empty")}</div>
      </ProfilePage>
    );
  }

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleRateASeller = (
    sellerId: number,
    productId: number,
    isPositive: boolean
  ) => {
    const parsed = rate_a_seller_schema.safeParse({ comment });

    if (!parsed.success) {
      toastError(t(parsed.error.issues[0].message));
      return;
    }

    const { comment: validatedComment } = parsed.data;

    rateASeller(
      {
        userId: sellerId,
        productId: productId,
        isPositive: isPositive,
        comment: validatedComment,
      },
      {
        onSuccess: (result) => {
          setComment("");
          toastSuccess(result.message);

          queryClient.invalidateQueries({
            queryKey: ["check-rated-seller-on-product"],
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
        <TableCaption>{t("profile.wonProducts.caption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t("profile.common.index")}</TableHead>
            <TableHead>{t("profile.common.productName")}</TableHead>
            <TableHead>{t("profile.common.productDescription")}</TableHead>
            <TableHead>{t("profile.common.endTime")}</TableHead>
            <TableHead>{t("profile.common.bidCount")}</TableHead>
            <TableHead>{t("profile.common.categoryName")}</TableHead>
            <TableHead>{t("profile.common.createdAt")}</TableHead>
            <TableHead className="text-center">
              {t("profile.common.rateSeller")}
            </TableHead>
            <TableHead className="text-center">
              {t("profile.common.details")}
            </TableHead>
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
                <p className="font-light whitespace-normal wrap-break-word text-center">
                  {product.bidCount}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word text-center">
                  {product.categoryName}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {formatDateTime(product.createdAt)}
                </p>
              </TableCell>
              {ratedProducts.includes(product.id) ? (
                <p className="font-light text-center mt-4 text-sm">
                  {t("profile.common.rated")}
                </p>
              ) : (
                <TableCell>
                  <div className="flex justify-around">
                    <div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#C1E1C1] mx-auto">
                      <NotificationDialog
                        triggerElement={
                          <ThumbsUp className="text-balck" size={16} />
                        }
                        title={t("profile.ratingDialog.title")}
                        description={t(
                          "profile.ratingDialog.positiveDescription"
                        )}
                        actionText={t("profile.ratingDialog.send")}
                        cancelText={t("profile.ratingDialog.cancel")}
                        onAction={() =>
                          handleRateASeller(product.sellerId, product.id, true)
                        }
                      >
                        <Input
                          type="text"
                          placeholder={t("profile.ratingDialog.placeholder")}
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
                        title={t("profile.ratingDialog.title")}
                        description={t(
                          "profile.ratingDialog.negativeDescription"
                        )}
                        actionText={t("profile.ratingDialog.send")}
                        cancelText={t("profile.ratingDialog.cancel")}
                        onAction={() =>
                          handleRateASeller(product.sellerId, product.id, false)
                        }
                      >
                        <Input
                          type="text"
                          placeholder={t("profile.ratingDialog.placeholder")}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </NotificationDialog>
                    </div>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div
                  className="max-w-8 flex items-center justify-center py-1 rounded-md bg-black mx-auto"
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

export default WonProducts;
