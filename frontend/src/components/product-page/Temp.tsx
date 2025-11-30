import MyReactImageMagnify from "@/components/product-page/MyReactImageMagnify.tsx";
import coverImg from "@/assets/cover.png";

function Temp() {
    return (
        <div className="grid grid-cols-2">
            <MyReactImageMagnify imageUrl={coverImg}/>
            <div>abc</div>
        </div>
    )
}

export  default Temp;