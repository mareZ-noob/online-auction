import {
  useFetchCommentsOfAProduct,
  usePostCommentOnAProduct,
} from "@/hooks/product-hooks";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toastError, toastSuccess } from "@/components/toast/toast-ui";
import { useEffect, useState } from "react";
import type { USER_QUESTIONS } from "@/types/User";
import ProductPagination from "../../product-list/ProductPagination";
import { useUserStore } from "@/store/user-store";
import { usePostAnswerToAQuestionProduct } from "@/hooks/seller-hooks";
import { formatDateTime } from "@/lib/utils";

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
          setQuestionValue("");
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
  const isSeller = useUserStore((state) => state.isSeller);

  const [answerValue, setAnswerValue] = useState("");
  const [isAnswering, setIsAnswering] = useState<number | null>(null);
  const [answeredQuestionId, setAnsweredQuestionId] = useState<number | null>(
    null
  );

  const { mutate } = usePostAnswerToAQuestionProduct(answeredQuestionId || "");

  const handleAnswerInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    questionId: number | null
  ) => {
    setAnswerValue(e.target.value);
    setAnsweredQuestionId(questionId);
  };

  const handlePostAnswer = () => {
    mutate(
      {
        answer: answerValue,
      },
      {
        onSuccess: (result) => {
          setAnswerValue("");
          toastSuccess(result.message || "Answer posted successfully!");
        },
        onError: (error) => {
          toastError(error);
        },
      }
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="p-4 border border-gray-200 rounded-lg max-w-full space-y-2"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <p className="font-light text-nowrap">
                {question.userName} has asked:
              </p>
              <p className="font-medium">{question.question}</p>
              <p className="font-light text-gray-400 italic text-nowrap">
                [{formatDateTime(question.createdAt)}]
              </p>
            </div>
            {isSeller && (
              <Button
                size="sm"
                variant="outline"
                className="py-0"
                onClick={() =>
                  setIsAnswering(
                    isAnswering === question.id ? null : question.id
                  )
                }
              >
                <p className="text-sm">
                  {isAnswering === question.id
                    ? "Cancel"
                    : "Answer this question"}
                </p>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-light">Seller has answered:</p>
            {question.answer ? (
              <>
                <p className=" font-medium">{question.answer}</p>
                <p className="font-light text-gray-400 italic">
                  [{formatDateTime(question.answeredAt!)}]
                </p>
              </>
            ) : (
              <p className=" font-light italic text-gray-500">
                Seller hasn't answered yet.
              </p>
            )}
          </div>
          {isSeller && isAnswering === question.id && (
            <div className="flex w-full max-w-xl gap-2">
              <Textarea
                placeholder="Type your message here."
                className="min-h-0"
                value={answerValue}
                onChange={(e) => handleAnswerInput(e, question.id)}
              />
              <Button onClick={handlePostAnswer}>Send</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductComments({ productId }: { productId: number }) {
  const isSeller = useUserStore((state) => state.isSeller);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data } = useFetchCommentsOfAProduct(productId, page);

  useEffect(() => {
    if (data) {
      setPage(data.page);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  if (!data || data.content.length === 0) {
    return (
      <div>
        {!isSeller && <CreateComment productId={productId} />}
        <p className="mt-4 font-light text-gray-400">No comments available.</p>
      </div>
    );
  }

  return (
    <div>
      {!isSeller && <CreateComment productId={productId} />}
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
