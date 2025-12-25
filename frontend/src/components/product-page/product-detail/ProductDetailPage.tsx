import ProductGallery from "@/components/product-page/product-detail/ProductGallery";
import ProductInfo from "@/components/product-page/product-detail/ProductInformation";
import { CarouselPlugin } from "@/components/dashboard-page/CarouselPlugin.tsx";
import RelatedProductItemCard from "@/components/product-page/product-detail/RelatedProductItemCard.tsx";
import ProductComments from "@/components/product-page/product-detail/product-comment/ProductComments";
import {
  useFetchProductDetailsById,
  useFetchRelatedProducts,
} from "@/hooks/product-hooks";
import { CardItemInformationMapper } from "@/lib/utils";
import { useParams } from "react-router-dom";
import ProductDetailPageFallback from "./ProductDetailPageFallback";
import ProductBidHistory from "./product-bid/ProductBidHistory";
import DOMPurify from "dompurify";
import { useUserStore } from "@/store/user-store";
import { useTranslation } from "react-i18next";
import { useProductSSE } from "@/hooks/sse-hooks";

function ProductDetailPage() {
  const productId = useParams().id as string;

  const { leadBidder } = useProductSSE(productId);

  const sellerId = useUserStore((state) => state.id);
  const { t } = useTranslation();

  const { data: relatedProducts } = useFetchRelatedProducts(Number(productId));
  const {
    data: productDetails,
    isLoading: isLoadingProductDetails,
    isError: isErrorProductDetails,
  } = useFetchProductDetailsById(Number(productId));

  if (isLoadingProductDetails) {
    return <div>{t("productDetail.loading")}</div>;
  }
  if (isErrorProductDetails || !productDetails) {
    return <ProductDetailPageFallback />;
  }

  const { images, ...rest } = productDetails;

  // isMine is checked for if the current product belongs to the logged-in seller
  const isMine = productDetails.sellerId === Number(sellerId);

  return (
    <div>
      <section className="grid grid-cols-3 mt-18">
        <ProductGallery
          mainImage={productDetails?.images[0]}
          subImages={productDetails?.images || []}
        />
        <ProductInfo data={rest} />
      </section>
      <div className="my-8 border-b border-gray-200" />
      <section>
        <p className="text-xl mb-4">{t("productDetail.sections.bidHistory")}</p>
        <ProductBidHistory
          isMine={isMine}
          productId={Number(productId)}
          leadBidder={leadBidder}
        />
      </section>
      <div className="my-8 border-b border-gray-200" />
      <section>
        <p className="text-xl mb-4">
          {t("productDetail.sections.additionalDetails")}
        </p>
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(productDetails?.description ?? ""),
          }}
        />
      </section>
      <div className="my-8 border-b border-gray-200" />
      <section>
        <p className="text-xl mb-4">{t("productDetail.sections.comments")}</p>
        <ProductComments productId={Number(productId)} />
      </section>
      <div className="my-8 border-b border-gray-200" />
      <section>
        <p className="text-xl mb-4">
          {t("productDetail.sections.relatedProducts")}
        </p>
        {relatedProducts?.length ? (
          <CarouselPlugin>
            {relatedProducts.map((product) => (
              <RelatedProductItemCard
                className="my-8"
                key={product.id}
                data={CardItemInformationMapper(product)}
              />
            ))}
          </CarouselPlugin>
        ) : (
          <p className="font-light text-gray-500">
            {t("productDetail.related.empty")}
          </p>
        )}
      </section>
    </div>
  );
}

export default ProductDetailPage;
