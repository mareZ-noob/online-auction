import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  className?: string;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
};

function PageManagement(currentPage: number, totalPages: number) {
  const pages = [];
  const maxPagesToShow = 3;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

function ProductPagination({
  className,
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handleSetPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handleSetPage(page - 1)}
            isActive={page > 0}
          />
        </PaginationItem>
        <PaginationItem>
          {PageManagement(page, totalPages).map((pageNumber) => (
            <PaginationLink
              key={pageNumber}
              href="#"
              isActive={pageNumber === page}
              onClick={() => handleSetPage(pageNumber)}
            >
              {pageNumber}
            </PaginationLink>
          ))}
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => handleSetPage(page + 1)}
            isActive={page < totalPages - 1}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default ProductPagination;
