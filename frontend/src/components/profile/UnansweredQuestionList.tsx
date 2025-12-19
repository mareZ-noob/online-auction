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
import { useFetchUnansweredQuestions } from "@/hooks/seller-hooks";
import ProductPagination from "../product-page/product-list/ProductPagination";
import ProfilePage from "./ProfilePage";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function UnansweredQuestionList() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data: unansweredQuestions } = useFetchUnansweredQuestions(page);

  useEffect(() => {
    if (unansweredQuestions) {
      setPage(unansweredQuestions.page);
      setTotalPages(unansweredQuestions.totalPages);
    }
  }, [unansweredQuestions]);

  const handleViewDetails = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <ProfilePage>
      <Table>
        <TableCaption>{t("profile.unansweredQuestions.caption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t("profile.common.index")}</TableHead>
            <TableHead>{t("profile.common.productName")}</TableHead>
            <TableHead>{t("profile.common.question")}</TableHead>
            <TableHead>{t("profile.unansweredQuestions.postedBy")}</TableHead>
            <TableHead>{t("profile.common.createdAt")}</TableHead>
            <TableHead className="text-center">
              {t("profile.common.details")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unansweredQuestions?.content.map((question, index) => (
            <TableRow key={question.id}>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word text-gray-400">
                  {index + 1 + page * unansweredQuestions.size}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
                  {question.productName}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
                  {question.question}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
                  {question.userName}
                </p>
              </TableCell>
              <TableCell className="max-w-sm">
                <p className="font-light whitespace-normal wrap-break-word">
                  {formatDateTime(question.createdAt)}
                </p>
              </TableCell>
              <TableCell>
                <div
                  className="max-w-8 flex items-center justify-center p-1 rounded-md bg-black mx-auto"
                  onClick={() => handleViewDetails(question.productId)}
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

export default UnansweredQuestionList;
