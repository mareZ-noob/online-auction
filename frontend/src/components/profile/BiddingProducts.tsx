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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function BiddingProducts() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        <div>{t("profile.biddingProducts.empty")}</div>
      </ProfilePage>
    );
  }

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <ProfilePage>
      <Table>
        <TableCaption>{t("profile.biddingProducts.caption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t("profile.common.index")}</TableHead>
            <TableHead>{t("profile.common.productName")}</TableHead>
            <TableHead>{t("profile.common.productDescription")}</TableHead>
            <TableHead>{t("profile.common.bidCount")}</TableHead>
            <TableHead>{t("profile.common.categoryName")}</TableHead>
            <TableHead>{t("profile.common.currentPrice")}</TableHead>
            <TableHead>{t("profile.common.endTime")}</TableHead>
            <TableHead>{t("profile.common.remainingTime")}</TableHead>
            <TableHead>{t("profile.common.createdAt")}</TableHead>
            <TableHead className="text-center">
              {t("profile.common.details")}
            </TableHead>
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
                <p className="font-light whitespace-normal wrap-break-word text-center">
                  {formatCurrency(product.currentPrice)}
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
              <TableCell>
                <div
                  className="max-w-8 flex items-center justify-center p-1 rounded-md bg-black mx-auto"
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
