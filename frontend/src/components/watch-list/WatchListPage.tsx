import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import ProductItemCard from "../dashboard-page/ProductItemCard";
import { useFetchMyWatchList } from "@/hooks/watch-list-hooks";
import { CardItemInformationMapper } from "@/lib/utils";
import ProductPagination from "../product-page/product-list/ProductPagination";
import WatchListFallback from "./WatchListFallback";
import WatchListSearchResult from "./WatchListSearchResult";
import type { PRODUCTS_BY_SUB_CATEGORY_ID } from "@/types/Product";
import { useTranslation } from "react-i18next";

function WatchList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchResultMode, setIsSearchResultMode] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { t } = useTranslation();

  const { data: productsInWatchList } = useFetchMyWatchList(page);

  const [searchedProducts, setSearchedProducts] = useState<
    PRODUCTS_BY_SUB_CATEGORY_ID[]
  >([]);
  const onSearch = () => {
    if (
      searchTerm &&
      productsInWatchList &&
      productsInWatchList.content.length > 0
    ) {
      const results = productsInWatchList.content.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchedProducts(results);
      setIsSearchResultMode(true);
    } else {
      setSearchedProducts([]);
      setIsSearchResultMode(false);
    }
  };

  useEffect(() => {
    if (productsInWatchList) {
      setPage(productsInWatchList.page);
      setTotalPages(productsInWatchList.totalPages);
    }
  }, [productsInWatchList]);

  return (
    <div className="mt-24">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-semibold">{t("watchList.title")}</p>
        <div className="flex items-center">
          <InputGroup className="mx-4 max-w-sm">
            <InputGroupInput
              placeholder={t("watchList.searchPlaceholder")}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={onSearch}>{t("watchList.searchButton")}</Button>
          {isSearchResultMode && (
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => {
                setIsSearchResultMode(false);
                setSearchTerm("");
              }}
            >
              {t("watchList.backButton")}
            </Button>
          )}
        </div>
      </div>

      {!isSearchResultMode ? (
        <>
          {productsInWatchList && productsInWatchList.content.length > 0 ? (
            <>
              <div className="mt-8 grid grid-cols-3 gap-16">
                {productsInWatchList.content.map((product) => (
                  <ProductItemCard
                    key={product.id}
                    data={CardItemInformationMapper(product)}
                    isWatchList={true}
                  />
                ))}
              </div>
              <ProductPagination
                className="mt-24"
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          ) : (
            <WatchListFallback />
          )}
        </>
      ) : (
        <WatchListSearchResult data={searchedProducts} />
      )}
    </div>
  );
}

export default WatchList;
