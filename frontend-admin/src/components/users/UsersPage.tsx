import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useFetchUsers } from "@/hooks/user-hooks";
import { useEffect, useState } from "react";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";
import CustomPagination from "../custom-ui/pagination/CustomPagination";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { Eye } from "lucide-react";
import UserDetails from "./UserDetails";
import { cn, formatDateTime } from "@/lib/utils";

function UsersPage() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const { data: users, isLoading } = useFetchUsers(page);

	useEffect(() => {
		if (users) {
			setTotalPages(users.totalPages);
		}
	}, [users]);

	return (
		<div>
			<Table>
				{!isLoading && <TableCaption>A list of users.</TableCaption>}
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Verified</TableHead>
						<TableHead>Rating</TableHead>
						<TableHead>Region</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead className="text-center">Active</TableHead>
						<TableHead className="text-center">Details</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isLoading &&
						users?.content.map((user) => (
							<TableRow key={user.id}>
								<TableCell>{user.fullName}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<div
										className={cn(
											"max-w-18 px-2 py-1 rounded-md",
											user.role === "BIDDER" && "bg-[#F8DE7E]",
											user.role === "SELLER" && "bg-[#50C878]",
											user.role === "ADMIN" && "bg-[#DE3163]",
											user.role !== "BIDDER" &&
												user.role !== "SELLER" &&
												user.role !== "ADMIN" &&
												"bg-gray-500",
										)}
									>
										<p className="text-center">{user.role}</p>
									</div>
								</TableCell>
								<TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
								<TableCell>
									{user.ratingPercentage
										? Number(user.ratingPercentage).toFixed(2) + "%"
										: "N/A"}
								</TableCell>
								<TableCell>{user.region || "Unknown"}</TableCell>
								<TableCell>{formatDateTime(user.createdAt)}</TableCell>
								<TableCell>
									<p className="text-center">true</p>
								</TableCell>
								<TableCell>
									<NotificationDialog
										triggerElement={
											<div className="max-w-8 mx-auto flex items-center justify-center bg-black text-white py-1 px-2 rounded-md hover:cursor-pointer">
												<Eye size={16} />
											</div>
										}
										title="User Details"
										description={`Details of ${user.fullName} [ ID: ${user.id} ]`}
										cancelText="Close"
										className="min-w-xl"
									>
										<UserDetails user={user} />
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

export default UsersPage;
