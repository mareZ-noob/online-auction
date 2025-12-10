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

function UnansweredQuestionList() {
  const navigate = useNavigate();

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
        <TableCaption>A list of your recent unanswered questions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Posted by</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead></TableHead>
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
              <TableCell className="max-w-4">
                <div
                  className="flex items-center justify-center p-1 rounded-md bg-black"
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
