import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductyContainer from "./ProductContainer";
import ProductyFilter from "./ProductFilter";
import {
  useFetchProductsyBySubCategoryId,
  useSearchProdutcs,
} from "@/hooks/product-hooks";
import ProductPagination from "./ProductPagination";
import { useProductStore } from "@/store/product-store";

import { ProductListContext } from "@/store/context/product-list-context";

function ProductListPage() {
  const [filterWithEndTime, setFilterWithEndTime] = useState<"desc" | "asc">(
    "asc"
  );
  const [filterWithPrice, setFilterWithPrice] = useState<"desc" | "asc">("asc");
  const [filterWithNewPublish, setFilterWithNewPublish] =
    useState<boolean>(false);

  const setCategoryId = useProductStore((state) => state.setCategoryId);
  const setSubCategoryId = useProductStore((state) => state.setSubCategoryId);
  const page = useProductStore((state) => state.page);
  const size = useProductStore((state) => state.size);
  const setTotalPages = useProductStore((state) => state.setTotalPages);

  const location = useLocation();
  const locationState = location.state as {
    categoryId?: number;
    subCategoryId?: number;
    searchQuery?: string;
  } | null;

  const categoryId = locationState?.categoryId;
  const subCategoryId = locationState?.subCategoryId;

  // read search from location state or search params
  const searchParam = new URLSearchParams(location.search).get("search");
  const searchQuery = locationState?.searchQuery ?? searchParam ?? undefined;

  useEffect(() => {
    if (typeof categoryId === "number") setCategoryId(categoryId);

    // when searching, clear category filter
    if (searchQuery) setCategoryId(null);
  }, [categoryId, setCategoryId, searchQuery]);

  useEffect(() => {
    if (typeof subCategoryId === "number") setSubCategoryId(subCategoryId);

    // when searching, clear subcategory filter
    if (searchQuery) setSubCategoryId(null);
  }, [subCategoryId, setSubCategoryId, searchQuery]);

  // If a search query exists, use the search hook; otherwise fall back to subcategory fetch
  const { data: searchData } = useSearchProdutcs(
    (searchQuery as string) ?? "",
    page,
    size,
    undefined
  );

  const { data: subData } = useFetchProductsyBySubCategoryId(
    subCategoryId ?? 0,
    page,
    size
  );

  const products = (searchQuery ? searchData?.content : subData?.content) ?? [];

  // update total pages in store so pagination reflects current data
  useEffect(() => {
    if (searchQuery && searchData) {
      setTotalPages(searchData.totalPages ?? 0);
    } else if (!searchQuery && subData) {
      setTotalPages(subData.totalPages ?? 0);
    }
  }, [searchQuery, searchData, subData, setTotalPages]);

  return (
    <ProductListContext.Provider
      value={{
        endtime: filterWithEndTime,
        setEndtime: setFilterWithEndTime,
        price: filterWithPrice,
        setPrice: setFilterWithPrice,
        newPublish: filterWithNewPublish,
        setNewPublish: setFilterWithNewPublish,
      }}
    >
      <div className="grid grid-cols-4 mt-20">
        <ProductyFilter />

        <div className="col-span-3 flex flex-col gap-4">
          {products && <ProductyContainer data={products} />}

          {products && products.length > 0 && (
            <div className="mt-12 flex justify-center">
              <ProductPagination
                page={page}
                totalPages={
                  searchQuery
                    ? searchData?.totalPages ?? 0
                    : subData?.totalPages ?? 0
                }
                onPageChange={(newPage) => {
                  // Update the page in the store
                  useProductStore.getState().setPage(newPage);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ProductListContext.Provider>
  );
}

export default ProductListPage;
