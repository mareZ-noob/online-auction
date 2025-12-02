import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { CardItemInformation } from "@/types/CardItem";
import ProductItemCard from "../dashboard-page/ProductItemCard";
import { Pagination } from "../ui/pagination";

function WatchList() {
  const [inputValue, setInputValue] = useState("");

  const onSearch = () => {
    console.log("Searching for:", inputValue);
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
    bidCount: 10,
    categoryName: "Smartphones",
  } as CardItemInformation;

  return (
    <div className="mt-24">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-semibold">Your Watch List</p>
        <div className="flex items-center">
          <InputGroup className="mx-4 max-w-sm">
            <InputGroupInput
              placeholder="Search your watch list..."
              onChange={(e) => setInputValue(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={onSearch}>Search</Button>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-16">
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
        <ProductItemCard data={fakeData} isWatchList={false} />
      </div>
      <Pagination />
    </div>
  );
}

export default WatchList;
