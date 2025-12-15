import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useFetchProducts, useRemoveAProduct } from "@/hooks/product-hooks";
import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CustomPagination from "@/components/custom-ui/pagination/CustomPagination";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import ProductDetails from "./ProductDetails";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function ProductsPage() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const { data: products, isLoading } = useFetchProducts(page);
	const { mutate } = useRemoveAProduct(page);

	useEffect(() => {
		if (products) {
			setTotalPages(products.totalPages);
		}
	}, [products]);

	const handleRemoveAProduct = (id: number) => {
		mutate({ id });
	};

	return (
		<div>
			<Table>
				{!isLoading && (
					<TableCaption>A list of your recent products.</TableCaption>
				)}
				<TableHeader>
					<TableRow>
						<TableHead>Image</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Seller</TableHead>
						<TableHead>Current Price</TableHead>
						<TableHead>Buy Now Price</TableHead>
						<TableHead>Bids</TableHead>
						<TableHead>End Time</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-center">Details</TableHead>
						<TableHead className="text-center">Remove</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isLoading &&
						products?.content.map((product) => (
							<TableRow key={product.id}>
								<TableCell>
									<img
										src={product.thumbnailImage}
										alt={product.name}
										className="w-[80px] h-[60px] object-cover"
									/>
								</TableCell>
								<TableCell>
									<p className="line-clamp-2 font-light whitespace-normal wrap-break-word">
										{product.name}
									</p>
								</TableCell>
								<TableCell>{product.categoryName}</TableCell>
								<TableCell>{product.sellerName}</TableCell>
								<TableCell>{formatCurrency(product.currentPrice)}</TableCell>
								<TableCell>{formatCurrency(product.buyNowPrice)}</TableCell>
								<TableCell>{product.bidCount}</TableCell>
								<TableCell>{formatDateTime(product.endTime)}</TableCell>
								<TableCell>{product.isNew ? "New" : "Old"}</TableCell>
								<TableCell className="max-h-full">
									<NotificationDialog
										triggerElement={
											<div className="max-w-8 mx-auto flex items-center justify-center bg-black text-white py-1 px-2 rounded-md hover:cursor-pointer">
												<Eye size={16} />
											</div>
										}
										title="Product Details"
										description={`Details of ${product.name} [ ID: ${product.id} ]`}
										cancelText="Close"
										className="min-w-4xl"
									>
										<ProductDetails product={product} />
									</NotificationDialog>
								</TableCell>
								<TableCell className="max-h-full">
									<NotificationDialog
										triggerElement={
											<div className="max-w-8 mx-auto flex items-center justify-center bg-[#FAA0A0] text-black py-1 px-2 rounded-md hover:cursor-pointer">
												<Trash2 size={16} />
											</div>
										}
										title="Remove a product"
										description="Are you sure you want to remove this product?"
										actionText="Remove"
										cancelText="Cancel"
										onAction={() => handleRemoveAProduct(product.id)}
									>
										<p>
											Do you confirm to delete {product.name} from{" "}
											{product.sellerName}?
										</p>
									</NotificationDialog>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{isLoading && (
				<Spinner className="mt-12 flex items-center justify-center" />
			)}
			{!isLoading && (
				<CustomPagination
					className="mt-12"
					page={page}
					totalPages={totalPages}
					onPageChange={(page) => setPage(page)}
				/>
			)}
		</div>
	);
}

export default ProductsPage;
