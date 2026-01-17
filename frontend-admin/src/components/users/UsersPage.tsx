import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDisableUser, useEnableUser, useFetchUsers, useResetPasswordUser } from "@/hooks/user-hooks";
import { useEffect, useState } from "react";
import Spinner from "../custom-ui/loading-spinner/LoadingSpinner";
import CustomPagination from "../custom-ui/pagination/CustomPagination";
import NotificationDialog from "../custom-ui/dialog/NotificationDialog";
import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import UserDetails from "./UserDetails";
import { cn, formatDateTime } from "@/lib/utils";
import { toastError, toastSuccess } from "../custom-ui/toast/toast-ui";
import { Button } from "../ui/button";

function UsersPage() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [search, setSearch] = useState("");
	const [role, setRole] = useState<string | undefined>(undefined);
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(0);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	const { data: users, isLoading } = useFetchUsers(page, 20, debouncedSearch, role);

	const { mutate: enableUser, isPending: enableUserLoading } = useEnableUser(page);
	const { mutate: disableUser, isPending: disableUserLoading } = useDisableUser(page);
	const { mutate: resetPasswordUser, isPending: resetPasswordUserLoading } = useResetPasswordUser(page);

	useEffect(() => {
		if (users) {
			setTotalPages(users.totalPages);
		}
	}, [users]);

	const handleEnableUser = (userId: string | number) => {
		enableUser({ id: userId }, {
			onSuccess: (result) => {
				toastSuccess(result.message);
			},
			onError: (error) => {
				toastError(error);
			}
		});
	};

	const handleDisableUser = (userId: string | number) => {
		disableUser({ id: userId }, {
			onSuccess: (result) => {
				toastSuccess(result.message);
			},
			onError: (error) => {
				toastError(error);
			}
		});
	};

	const [resettingUserId, setResettingUserId] = useState<string | number | null>(null);

	const handleResetPasswordUser = (userId: string | number) => {
		setResettingUserId(userId);
		resetPasswordUser({ id: userId }, {
			onSuccess: (result) => {
				toastSuccess(result.message);
				setResettingUserId(null);
			},
			onError: (error) => {
				toastError(error);
				setResettingUserId(null);
			}
		});
	};

	return (
		<div>
			<div className="flex gap-4 mb-4">
				<Input
					placeholder="Search by name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>
				<Select
					value={role || "ALL"}
					onValueChange={(val) => {
						setRole(val === "ALL" ? undefined : val);
						setPage(0);
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by Role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Roles</SelectItem>
						<SelectItem value="BIDDER">Bidder</SelectItem>
						<SelectItem value="SELLER">Seller</SelectItem>
						<SelectItem value="ADMIN">Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<Table>
				{!isLoading && <TableCaption>A list of users.</TableCaption>}
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Login Provider</TableHead>
						<TableHead>Verified</TableHead>
						<TableHead>Rating</TableHead>
						<TableHead>Region</TableHead>
						<TableHead>Joined</TableHead>
						<TableHead className="text-center">Active</TableHead>
						<TableHead className="text-center">Details</TableHead>
						<TableHead className="text-center">Enable/Disable</TableHead>
						<TableHead className="text-center">Reset Password</TableHead>
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
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{user.linkedProviders.map((provider) => (
											<span
												key={provider}
												className={cn(
													"px-2 py-1 rounded-md text-xs font-medium",
													provider === "LOCAL" && "bg-blue-100 text-blue-800",
													provider === "KEYCLOAK" && "bg-purple-100 text-purple-800",
												)}
											>
												{provider}
											</span>
										))}
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
									<p className="text-center">{user.isActive ? "Yes" : "No"}</p>
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
								<TableCell>
									<div className="flex justify-center">
										{!user.isActive && (
											<div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#C1E1C1]">
												<NotificationDialog
													triggerElement={
														<ThumbsUp className="text-balck" size={16} />
													}
													title={cn(
														"Are you sure want to ENABLE",
														user.fullName,
														"?",
													)}
													description="This action will enable the user."
													actionText={cn(
														enableUserLoading ? "Enabling..." : "Enable",
													)}
													cancelText="Cancel"
													onAction={() => handleEnableUser(user.id)}
												>
													<p>
														Do you want to ENABLE this user? This can cause the
														user to be able to bid and sell.
													</p>
												</NotificationDialog>
											</div>
										)}
										{user.isActive && (
											<div className="flex items-center justify-center py-1 px-2 rounded-md bg-[#FAA0A0]">
												<NotificationDialog
													triggerElement={
														<ThumbsDown className="text-balck" size={16} />
													}
													title={cn(
														"Are you sure want to DISABLE",
														user.fullName,
														"?",
													)}
													description="This action will disable the user."
													actionText={cn(
														disableUserLoading ? "Disabling..." : "Disable",
													)}
													cancelText="Cancel"
													onAction={() => handleDisableUser(user.id)}
												>
													<p>
														Do you want to DISABLE this user? This can cause the
														user to be unable to bid and sell.
													</p>
												</NotificationDialog>
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center justify-center">
										<Button
											variant="default"
											size="sm"
											onClick={() => handleResetPasswordUser(user.id)}
											disabled={user.linkedProviders.includes("KEYCLOAK")}
											title={user.linkedProviders.includes("KEYCLOAK") ? "Password managed by Keycloak" : ""}
										>
											{resetPasswordUserLoading && resettingUserId === user.id ? "Resetting..." : "Reset"}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table >
			{isLoading && (
				<Spinner className="mt-12 flex items-center justify-center" />
			)
			}
			{
				!isLoading && (
					<CustomPagination
						className="mt-12"
						page={page}
						totalPages={totalPages}
						onPageChange={(page) => setPage(page)}
					/>
				)
			}
		</div >
	);
}

export default UsersPage;
