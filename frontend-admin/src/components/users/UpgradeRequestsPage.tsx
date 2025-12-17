import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useFetchUpgradeRequests,
	useReviewUpgradeRequest,
} from "@/hooks/user-hooks";
import CustomPagination from "../custom-ui/pagination/CustomPagination";
import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toastSuccess, toastError } from "../custom-ui/toast/toast-ui";
import { formatDateTime } from "@/lib/utils";

export default function UpgradeRequestsPage() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const { data } = useFetchUpgradeRequests(page);

	const { mutate } = useReviewUpgradeRequest();

	useEffect(() => {
		if (data) {
			setPage(data.page);
			setTotalPages(data.totalPages);
		}
	}, [data]);

	if (!data || data.content.length === 0) {
		return (
			<div>
				<p className="mt-4 font-light text-gray-400">
					No upgrade requests available.
				</p>
			</div>
		);
	}

	const handleApprove = (id: number, approved: boolean) => {
		mutate(
			{ id, approved },
			{
				onSuccess: (result) => {
					toastSuccess(result.message);
				},
				onError: (error) => {
					toastError(error);
				},
			},
		);
	};

	return (
		<div>
			<Table>
				<TableCaption>A list of your recent invoices.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Username</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Reason</TableHead>
						<TableHead>Reviewed By</TableHead>
						<TableHead>Reviewed At</TableHead>
						<TableHead>Created At</TableHead>
						<TableHead className="text-center">Approve</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.content.map((request) => (
						<TableRow key={request.id}>
							<TableCell>{request.id}</TableCell>
							<TableCell>{request.userName}</TableCell>
							<TableCell>{request.userEmail}</TableCell>
							<TableCell>{request.status}</TableCell>
							<TableCell>{request.reason}</TableCell>
							<TableCell>{request.reviewedByName}</TableCell>
							<TableCell>{formatDateTime(request.reviewedAt)}</TableCell>
							<TableCell>{formatDateTime(request.createdAt)}</TableCell>
							<TableCell className="flex items-center justify-center">
								<div className="flex items-center gap-2">
									<div
										className="py-1 px-2 rounded-md bg-[#C1E1C1]"
										onClick={() => handleApprove(request.id, true)}
									>
										<ThumbsUp className="text-black" size={16} />
									</div>
									<div
										className="py-1 px-2 rounded-md bg-[#FAA0A0]"
										onClick={() => handleApprove(request.id, false)}
									>
										<ThumbsDown className="text-black" size={16} />
									</div>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<CustomPagination
				className="mt-12"
				page={page}
				totalPages={totalPages}
				onPageChange={setPage}
			/>
		</div>
	);
}
