import { useFetchDashboardStatistics } from "@/hooks/dashboard-hooks";
import { FigureCard, ChildFigureCard } from "./FigureCard";
import { ReportChart } from "./ReportChart";
import LiveStats from "../live-stats/LiveStats";

function ReportsPage() {
	const { data } = useFetchDashboardStatistics();

	if (!data) {
		return <p className="text-center text-gray-500">There is no statistics</p>;
	}

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<FigureCard
					title="Total Users"
					description="Total number of users"
					figure={data?.totalUsers}
				>
					<ChildFigureCard title="Total Bidders" figure={data.totalBidders} />
					<ChildFigureCard title="Total Sellers" figure={data.totalSellers} />
					<ChildFigureCard
						title="New Users This Month"
						figure={data.newUsersThisMonth}
					/>
				</FigureCard>
				<FigureCard
					title="Total Products"
					description="Total number of products"
					figure={data.totalProducts}
				>
					<ChildFigureCard
						title="Active Products"
						figure={data.activeProducts}
					/>
					<ChildFigureCard
						title="Completed Products"
						figure={data.completedProducts}
					/>
					<ChildFigureCard
						title="New Products This Month"
						figure={data.newProductsThisMonth}
					/>
				</FigureCard>
				<FigureCard
					title="Total Revenue"
					description="Total number of revenue"
					figure={data.totalRevenue}
				>
					<ChildFigureCard
						title="Upgrade Requests Pending"
						figure={data.upgradeRequestsPending}
					/>
				</FigureCard>
			</div>
			<LiveStats />
			<ReportChart />
		</div>
	);
}

export default ReportsPage;
