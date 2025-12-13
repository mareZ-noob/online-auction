import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { MouseEvent } from "react";

type PaginationProps = {
	className?: string;
	page: number;
	totalPages: number;
	onPageChange: (newPage: number) => void;
};

function getVisiblePages(currentPageIndex: number, totalPages: number) {
	const total = Math.max(totalPages, 0);
	if (total === 0) {
		return [];
	}

	const currentPage = currentPageIndex + 1; // convert to 1-based for display
	const maxPagesToShow = 3;
	if (total <= maxPagesToShow) {
		return Array.from({ length: total }, (_, index) => index + 1);
	}

	const halfWindow = Math.floor(maxPagesToShow / 2);
	let start = Math.max(1, currentPage - halfWindow);
	const end = Math.min(total, start + maxPagesToShow - 1);

	if (end - start + 1 < maxPagesToShow) {
		start = Math.max(1, end - maxPagesToShow + 1);
	}

	return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function CustomPagination({
	className,
	page,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const handleSetPage = (newPage: number) => {
		if (newPage === page) {
			return;
		}
		if (newPage < 0 || newPage >= totalPages) {
			return;
		}
		onPageChange(newPage);
	};

	const handleLinkClick =
		(targetPage: number) => (event: MouseEvent<HTMLAnchorElement>) => {
			event.preventDefault();
			handleSetPage(targetPage);
		};

	if (totalPages <= 0) {
		return null;
	}

	const visiblePages = getVisiblePages(page, totalPages);
	if (visiblePages.length === 0) {
		return null;
	}
	const firstVisible = visiblePages[0];
	const lastVisible = visiblePages[visiblePages.length - 1];
	const isFirstPage = page === 0;
	const isLastPage = page >= totalPages - 1;
	const showFirstPage = firstVisible !== 1;
	const showLastPage = lastVisible !== totalPages;
	const showLeadingEllipsis = showFirstPage && firstVisible > 2;
	const showTrailingEllipsis = showLastPage && lastVisible < totalPages - 1;

	return (
		<Pagination className={className}>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={handleLinkClick(page - 1)}
						aria-disabled={isFirstPage}
						tabIndex={isFirstPage ? -1 : undefined}
						className={
							isFirstPage ? "pointer-events-none opacity-50" : undefined
						}
					/>
				</PaginationItem>
				{showFirstPage && (
					<PaginationItem>
						<PaginationLink
							href="#"
							isActive={page === 0}
							onClick={handleLinkClick(0)}
						>
							1
						</PaginationLink>
					</PaginationItem>
				)}
				{showLeadingEllipsis && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}
				{visiblePages.map((pageNumber) => {
					const pageIndex = pageNumber - 1;
					return (
						<PaginationItem key={pageNumber}>
							<PaginationLink
								href="#"
								isActive={pageIndex === page}
								onClick={handleLinkClick(pageIndex)}
							>
								{pageNumber}
							</PaginationLink>
						</PaginationItem>
					);
				})}
				{showTrailingEllipsis && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}
				{showLastPage && (
					<PaginationItem>
						<PaginationLink
							href="#"
							isActive={isLastPage}
							onClick={handleLinkClick(totalPages - 1)}
						>
							{totalPages}
						</PaginationLink>
					</PaginationItem>
				)}
				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={handleLinkClick(page + 1)}
						aria-disabled={isLastPage}
						tabIndex={isLastPage ? -1 : undefined}
						className={
							isLastPage ? "pointer-events-none opacity-50" : undefined
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

export default CustomPagination;
