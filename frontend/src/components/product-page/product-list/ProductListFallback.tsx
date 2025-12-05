import EmptyBox from "@/assets/EmptyBox.jpg";

function ProductListFallback() {
  return (
    <div className="flex flex-col items-center justify-center mb-36 max-w-sm max-h-sm">
      <img src={EmptyBox} />
      <p className="text-xl">Haven't had any product yet !!!</p>
    </div>
  );
}

export default ProductListFallback;
