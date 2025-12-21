import { useFetchProductDetailsById } from "@/hooks/product-hooks";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function ProductSummary({ productId }: { productId: number }) {
  const { data: product } = useFetchProductDetailsById(productId);

  if (!product) {
    return <Spinner text="Loading Product Summary..." />;
  }

  return (
    <div>
      <div className="flex items-start gap-8">
        <img src={product.images[0]} className="max-w-64 max-h-64" />
        <div className="flex flex-col gap-1">
          <p>Product Name: {product.name}</p>
          <p>Product price: {formatCurrency(product.currentPrice)}</p>
          <p>Product's Category: {product.categoryName}</p>
          <div className="flex items-center gap-16">
            <p>Bidder: {product.currentBidderName}</p>
            {product.currentBidderRating !== null ? (
              <p>
                Bidder's Ratings: {product.currentBidderRating.toFixed(2) + "%"}
              </p>
            ) : (
              <p>Bidder's Ratings: "N/A"</p>
            )}
          </div>
          <div className="flex items-center gap-16">
            <p>Seller: {product.sellerName}</p>
            <p>Seller's Ratings: {product.sellerRating.toFixed(2) + "%"}</p>
          </div>
          <p>End Time: {formatDateTime(product.endTime)}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductSummary;
