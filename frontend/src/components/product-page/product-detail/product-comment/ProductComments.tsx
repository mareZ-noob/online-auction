import {
  useFetchCommentsOfAProduct,
  usePostCommentOnAProduct,
} from "@/hooks/product-hooks";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import { useEffect, useState } from "react";
import type { USER_QUESTIONS } from "@/types/User";
import ProductPagination from "../../product-list/ProductPagination";
import { useUserStore } from "@/store/user-store";
import { usePostAnswerToAQuestionProduct } from "@/hooks/seller-hooks";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function CreateComment({
  productId,
  page,
}: {
  productId: number;
  page: number;
}) {
  const [questionValue, setQuestionValue] = useState("");
  const { mutate } = usePostCommentOnAProduct(page);
  const { t } = useTranslation();

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
          toastSuccess(
            result.message || t("productDetail.comments.postedSuccess")
          );
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
        placeholder={t("productDetail.comments.placeholder")}
        className="min-h-0"
        value={questionValue}
        onChange={handleQuestionInput}
      />
      <Button onClick={handlePostComment}>
        {t("productDetail.comments.send")}
      </Button>
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
  const { t } = useTranslation();

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
          toastSuccess(
            result.message || t("productDetail.comments.answeredSuccess")
          );
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
                {t("productDetail.comments.hasAsked", {
                  userName: question.userName,
                })}
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
                    ? t("productDetail.comments.cancel")
                    : t("productDetail.comments.answerQuestion")}
                </p>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-light">
              {t("productDetail.comments.sellerAnswered")}
            </p>
            {question.answer ? (
              <>
                <p className=" font-medium">{question.answer}</p>
                <p className="font-light text-gray-400 italic">
                  [{formatDateTime(question.answeredAt!)}]
                </p>
              </>
            ) : (
              <p className=" font-light italic text-gray-500">
                {t("productDetail.comments.noAnswer")}
              </p>
            )}
          </div>
          {isSeller && isAnswering === question.id && (
            <div className="flex w-full max-w-xl gap-2">
              <Textarea
                placeholder={t("productDetail.comments.placeholder")}
                className="min-h-0"
                value={answerValue}
                onChange={(e) => handleAnswerInput(e, question.id)}
              />
              <Button onClick={handlePostAnswer}>
                {t("productDetail.comments.send")}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductComments({
  isCurrentUserBlocked,
  productId,
}: {
  isCurrentUserBlocked: boolean;
  productId: number;
}) {
  const isSeller = useUserStore((state) => state.isSeller);
  const { t } = useTranslation();

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
        {!isSeller && <CreateComment productId={productId} page={page} />}
        <p className="mt-4 font-light text-gray-400">
          {t("productDetail.comments.noComments")}
        </p>
      </div>
    );
  }

  return (
    <div>
      {!isSeller && !isCurrentUserBlocked && (
        <CreateComment productId={productId} page={page} />
      )}
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
