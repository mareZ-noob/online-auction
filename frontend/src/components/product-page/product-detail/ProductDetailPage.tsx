import ProductGallery from "@/components/product-page/product-detail/ProductGallery";
import ProductInfo from "@/components/product-page/product-detail/ProductInformation";
import { CarouselPlugin } from "@/components/dashboard-page/CarouselPlugin.tsx";
import RelatedProductItemCard from "@/components/product-page/product-detail/RelatedProductItemCard.tsx";
import ProductComments from "@/components/product-page/product-detail/ProductComments.tsx";
import {
  useFetchProductDetailsById,
  useFetchRelatedProducts,
} from "@/hooks/product-hooks";
import { CardItemInformationMapper } from "@/lib/utils";
import { useParams } from "react-router-dom";
import ProductDetailPageFallback from "./ProductDetailPageFallback";

function ProductDetailPage() {
  const productId = useParams().id as string;

  const { data: relatedProducts } = useFetchRelatedProducts(Number(productId));
  const {
    data: productDetails,
    isLoading: isLoadingProductDetails,
    isError: isErrorProductDetails,
  } = useFetchProductDetailsById(Number(productId));

  if (isLoadingProductDetails) {
    return <div>Loading...</div>;
  }
  if (isErrorProductDetails || !productDetails) {
    return <ProductDetailPageFallback />;
  }

  const { id, images, ...rest } = productDetails;

  return (
    <div>
      <section className="grid grid-cols-3 mt-18">
        <ProductGallery
          mainImage={productDetails?.images[0]}
          subImages={productDetails?.images?.slice(1) || []}
        />
        <ProductInfo data={rest} />
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">Additional Details</p>
        <p className="font-light text-gray-500">
          {productDetails?.description}
        </p>
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">Comments</p>
        <ProductComments />
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">You May Also Like</p>
        {relatedProducts?.length ? (
          <CarouselPlugin>
            {relatedProducts.map((product) => (
              <RelatedProductItemCard
                key={product.id}
                data={CardItemInformationMapper(product)}
              />
            ))}
          </CarouselPlugin>
        ) : (
          <p className="font-light text-gray-500">No related products found.</p>
        )}
      </section>
    </div>
  );
}

export default ProductDetailPage;
