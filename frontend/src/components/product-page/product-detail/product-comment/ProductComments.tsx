import { usePostCommentOnAProduct } from "@/hooks/product-hooks";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toastError, toastSuccess } from "@/components/toast/toast-ui";
import { useEffect, useState } from "react";
import { useFetchComments } from "@/hooks/product-hooks";
import type { USER_QUESTIONS } from "@/types/User";
import ProductPagination from "../../product-list/ProductPagination";

function CreateComment({ productId }: { productId: number }) {
  const [questionValue, setQuestionValue] = useState("");
  const { mutate } = usePostCommentOnAProduct();

  const handleQuestionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionValue(e.target.value);
  };

  const handlePostComment = () => {
    mutate(
      {
        productId,
        question: questionValue,
      },
      {
        onSuccess: (result) => {
          toastSuccess(result.message || "Comment posted successfully!");
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  return (
    <div className="flex w-full max-w-xl gap-2">
      <Textarea
        placeholder="Type your message here."
        className="min-h-0"
        value={questionValue}
        onChange={handleQuestionInput}
      />
      <Button onClick={handlePostComment}>Send</Button>
    </div>
  );
}

function QuestionComment({ questions }: { questions: USER_QUESTIONS[] }) {
  return (
    <div className="mt-4 space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <p className="font-light">
              {question.userName} has asked a question:
            </p>
            <p className="font-medium">{question.question}</p>
            <p className="font-light text-gray-400 italic">
              [{question.createdAt}]
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-light">Seller has answered:</p>
            {question.answer ? (
              <>
                <p className=" font-medium">Answer: {question.answer}</p>
                <p className="font-light text-gray-400 italic">
                  [{question.answeredAt}]
                </p>
              </>
            ) : (
              <p className=" font-light italic text-gray-500">
                Seller hasn't answered yet.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductComments({ productId }: { productId: number }) {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data } = useFetchComments(page);

  useEffect(() => {
    if (data) {
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  if (!data || data.content.length === 0) {
    return <div>No comments available.</div>;
  }

  return (
    <div>
      <CreateComment productId={productId} />
      <QuestionComment questions={data?.content} />
      <ProductPagination
        className="mt-12"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

export default ProductComments;
