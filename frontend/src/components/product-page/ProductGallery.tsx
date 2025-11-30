import { useState } from "react";
import MyReactImageMagnify from "@/components/product-page/MyReactImageMagnify";

const ProductGallery = ({
  mainImage,
  subImages,
}: {
  mainImage: { url: string; alt: string };
  subImages: { url: string; alt: string }[];
}) => {
  const [activeImg, setActiveImg] = useState(mainImage);

  return (
    <div className="col-span-2 flex gap-4">
      <div className="flex flex-col gap-4">
        {subImages.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveImg(item)}
            className={`
                     min-w-[100px] h-[100px] border-2 overflow-hidden
                     ${
                       activeImg.url === item.url
                         ? "border-2 border-black"
                         : "border-transparent"
                     }
                   `}
          >
            <img
              src={item.url}
              alt={item.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <div className="w-[800px] h-[600px] bg-white relative z-10 flex items-center justify-center border border-gray-100">
        <MyReactImageMagnify imageObj={activeImg} />
      </div>
    </div>
  );
};

export default ProductGallery;
