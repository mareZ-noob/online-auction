import ProductGallery from "@/components/product-page/ProductGallery.tsx";
import ProductInfo from "@/components/product-page/ProductInformation.tsx";
import type {CardItemInformation} from "@/types/CardItem";
import {CarouselPlugin} from "@/components/dashboard-page/CarouselPlugin.tsx";
import RelatedProductItemCard from "@/components/product-page/RelatedProductItemCard.tsx";
import ProductComments from "@/components/product-page/ProductComments.tsx";

function ProductDetailPage() {
  const data = {
    id: "prd_001",

    mainImage: {
      url: "https://images2.alphacoders.com/877/thumb-1920-877749.jpg",
      alt: "Main product image of vintage camera",
    },
    subImages: [
      {
        url: "https://images2.alphacoders.com/877/thumb-1920-877749.jpg",
        alt: "Main product image of vintage camera",
      },
      {
        url: "https://4kwallpapers.com/images/wallpapers/bugatti-chiron-pur-3840x2160-17262.jpg",
        alt: "Side view of camera",
      },
      {
        url: "https://wallpapers.com/images/featured/bugatti-4k-bi2unqbryvz7m9k6.jpg",
        alt: "Back view of camera",
      },
    ],

    productName: "Vintage Film Camera – Canon AE-1",
    currentPrice: 125.5,
    buyNowPrice: 250,

    seller: {
      id: "seller_123",
      name: "John's Antique Store",
      rating: 4.8,
      totalReviews: 320,
    },

    highestBidder: {
      id: "bidder_991",
      name: "Alice Nguyen",
      rating: 4.6,
      totalReviews: 58,
    },

    timeInfo: {
      postedAt: "2025-08-12T10:00:00Z",
      endsAt: "2025-08-20T10:00:00Z",
    },

    description: `
        A beautifully preserved Canon AE-1 film camera from the 1980s.
        Fully functional, minimal cosmetic wear, and perfect for collectors
        or anyone wanting to experience the charm of analog photography.
        Includes 50mm f/1.8 lens.
    `,
  };

  const fakeData = {
    productName: "Iphone 17 of Elon Musk",
    currentPrice: 1000,
    buyNowPrice: 9999,
    productImage:
        "https://www.macobserver.com/wp-content/uploads/2025/09/iphone-17-wallpapers.png",
    bidderName: "Donald Trump",
    bidderPrice: 2000,
    publishedDate: "November 29th, 2025 | 7:00 AM",
    remainingTime: "1 hour",
    bidTurns: 10,
  } as CardItemInformation;

  return (
    <div>
      <section className="grid grid-cols-3 mt-18">
        <ProductGallery mainImage={data.mainImage} subImages={data.subImages} />
        <ProductInfo data={data} />
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">Additional Details</p>
        <p className="font-light text-gray-500">{data.description}</p>
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">Comments</p>
        <ProductComments />
      </section>
      <div className="my-8 border-b" />
      <section>
        <p className="text-xl mb-4">You May Also Like</p>
        <CarouselPlugin>
          <RelatedProductItemCard data={fakeData} />
          <RelatedProductItemCard data={fakeData} />
          <RelatedProductItemCard data={fakeData} />
          <RelatedProductItemCard data={fakeData} />
          <RelatedProductItemCard data={fakeData} />
        </CarouselPlugin>
      </section>
    </div>
  );
}

export default ProductDetailPage;
