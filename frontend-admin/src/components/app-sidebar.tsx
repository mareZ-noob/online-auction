import * as React from "react";
import {
	AudioWaveform,
	Boxes,
	ChartBarStacked,
	Command,
	GalleryVerticalEnd,
	House,
	User,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { UserInfo } from "@/components/user-info";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

const data = {
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			icon: House,
			items: [
				{
					title: "Reports",
					url: "/dashboard/reports",
				},
			],
		},
		{
			title: "Categories",
			icon: ChartBarStacked,
			isActive: true,
			items: [
				{
					title: "List of Categories",
					url: "/categories",
				},
				{
					title: "Create categories",
					url: "/categories/creation",
				},
				{
					title: "Delete categories",
					url: "/categories/deletion",
				},
			],
		},
		{
			title: "Products",
			icon: Boxes,
			items: [
				{
					title: "List of Products",
					url: "/products",
				},
				{
					title: "Aunction Settings",
					url: "/products/auction-settings",
				}
			],
		},
		{
			title: "Users",
			icon: User,
			items: [
				{
					title: "List of Users",
					url: "/users",
				},
				{
					title: "Upgrade Requests",
					url: "/users/upgrade-requests",
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<UserInfo />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
