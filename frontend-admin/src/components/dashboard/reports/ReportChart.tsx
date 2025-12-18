import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFetchDashboardMonthlyOrYearlyStatistics } from "@/hooks/dashboard-hooks";
import { formatDashboardLabel } from "@/lib/utils";

export const description = "An interactive area chart";

const chartConfig = {
	newUsers: { label: "New Users", color: "var(--chart-1)" },
	newProducts: { label: "New Products", color: "var(--chart-2)" },
	revenue: { label: "Revenue", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ReportChart() {
	const [timeRange, setTimeRange] = React.useState<"MONTHLY" | "YEARLY">(
		"MONTHLY",
	);

	const { data: statistics } =
		useFetchDashboardMonthlyOrYearlyStatistics(timeRange);

	if (!statistics) {
		return <p className="text-center text-gray-500">There is no statistics</p>;
	}

	return (
		<Card className="pt-0 mt-6">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<CardTitle>Area Chart - Users - Products - Revenue</CardTitle>
					<CardDescription>
						Showing total users, products, and revenue MONTHLY or YEARLY
					</CardDescription>
				</div>
				<Select
					value={timeRange}
					onValueChange={(value) => setTimeRange(value as "MONTHLY" | "YEARLY")}
				>
					<SelectTrigger
						className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
						aria-label="Select a value"
					>
						<SelectValue placeholder="Last 3 months" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="MONTHLY" className="rounded-lg">
							Monthly
						</SelectItem>
						<SelectItem value="YEARLY" className="rounded-lg">
							Yearly
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart data={statistics}>
						<defs>
							<linearGradient id="fullNewUsers" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-chart-1)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-chart-1)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillNewProducts" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-chart-2)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-chart-2)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-chart-3)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-chart-3)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="label"
							tickFormatter={formatDashboardLabel}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={formatDashboardLabel}
									indicator="dot"
								/>
							}
						/>
						<Area
							dataKey="newUsers"
							type="monotone"
							fill="url(#fillNewUsers)"
							stroke="var(--color-newUsers)"
						/>
						<Area
							dataKey="newProducts"
							type="monotone"
							fill="url(#fillNewProducts)"
							stroke="var(--color-newProducts)"
						/>
						<Area
							dataKey="revenue"
							type="monotone"
							fill="url(#fillRevenue)"
							stroke="var(--color-revenue)"
						/>
						<ChartLegend content={<ChartLegendContent />} />
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
