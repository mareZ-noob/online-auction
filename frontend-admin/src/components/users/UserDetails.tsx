import { formatDateTime } from "@/lib/utils";
import type { USER } from "@/types/Users";

function UserDetails({ user }: { user: USER }) {
	return (
		<div>
			<div className="border-b border-gray-200 mb-4" />
			<div className="mb-4 text-md">
				<p className="text-md font-semibold mb-2">User Information</p>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-light">
						<p>FullName:</p> <p>{user.fullName}</p>
					</div>
					<div className="flex items-center gap-2 font-light">
						<p>Email:</p> <p>{user.email}</p>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-light">
						<p>Role:</p> <p>{user.role}</p>
					</div>
					<div className="flex items-center gap-2 font-light">
						<p>Verified:</p> <p>{user.emailVerified ? "Yes" : "No"}</p>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-light">
						<p>Rating:</p>{" "}
						<p>
							{user.ratingPercentage
								? Number(user.ratingPercentage).toFixed(2) + "%"
								: "N/A"}
						</p>
					</div>
					<div className="flex items-center gap-2 font-light">
						<p>Region:</p> <p>{user.region || "Unknown"}</p>
					</div>
				</div>
				<div className="flex items-center gap-2 font-light text-md">
					<p>Joined:</p> <p>{formatDateTime(user.createdAt)}</p>
				</div>
			</div>
			<div className="border-b border-gray-200 my-4" />
			<div className="mb-4 text-md">
				<p className="text-md font-semibold mb-2">Profile Details</p>
				<div className="flex items-center gap-2 font-light">
					<p>Address:</p>
					<div className="flex items-center gap-2 font-light">
						<p>{user.address}</p>
					</div>
				</div>
				<div className="flex items-center gap-2 font-light">
					<p>Preferred Language:</p>{" "}
					<p>{user.preferredLanguage ? user.preferredLanguage : "N/A"}</p>
				</div>
				<div className="flex items-center gap-2 font-light">
					<p>Date of Birth:</p>
					<div className="flex items-center gap-2 font-light">
						<p>{user.dateOfBirth ? formatDateTime(user.dateOfBirth) : "N/A"}</p>
					</div>
				</div>
			</div>
			<div className="border-b border-gray-200 my-4" />
			<div className="mb-4 text-md">
				<p className="text-md font-semibold mb-2">Account Metadata</p>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 font-light">
						<p>Positive Ratings:</p> <p>{user.positiveRatings}</p>
					</div>
					<div className="flex items-center gap-2 font-light">
						<p>Negative Ratings:</p> <p>{user.negativeRatings}</p>
					</div>
				</div>
				<div className="flex items-center gap-2 font-light">
					<p>Providers:</p> <p>{user.linkedProviders.join(", ")}</p>
				</div>
			</div>
		</div>
	);
}

export default UserDetails;
