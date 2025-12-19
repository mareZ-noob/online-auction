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
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function Ratings() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: ratings } = useFetchUserRatings(page);
  const { t } = useTranslation();

  useEffect(() => {
    if (ratings) {
      setPage(ratings.page);
      setTotalPages(ratings.totalPages);
    }
  }, [ratings]);

  if (!ratings || ratings.content.length === 0) {
    return <div>{t("profile.ratings.empty")}</div>;
  }

  return (
    <div>
      <Table>
        <TableCaption>{t("profile.ratings.caption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              {t("profile.common.sellerName")}
            </TableHead>
            <TableHead>{t("profile.common.productName")}</TableHead>
            <TableHead>{t("profile.common.isPositive")}</TableHead>
            <TableHead>{t("profile.common.comment")}</TableHead>
            <TableHead>{t("profile.common.createdAt")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratings?.content.map((rating) => (
            <TableRow key={rating.id}>
              <TableCell className="font-medium">{rating.userName}</TableCell>
              <TableCell>{rating.productName}</TableCell>
              <TableCell>
                {rating.isPositive
                  ? t("profile.common.yes")
                  : t("profile.common.no")}
              </TableCell>
              <TableCell>{rating.comment}</TableCell>
              <TableCell>{formatDateTime(rating.createdAt)}</TableCell>
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
    </div>
  );
}

export default Ratings;
