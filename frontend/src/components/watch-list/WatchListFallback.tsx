import EmptyCartImage from "@/assets/EmptyCartImage.png";

function WatchListFallback() {
  return (
    <div className="flex flex-col items-center justify-center mb-36">
      <img src={EmptyCartImage} />
      <p className="text-xl">You haven't wished anything yet !!!</p>
    </div>
  );
}

export default WatchListFallback;
