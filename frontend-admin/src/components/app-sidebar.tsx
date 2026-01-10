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
					url: "/admin/dashboard/reports",
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
					url: "/admin/categories",
				},
				{
					title: "Create categories",
					url: "/admin/categories/creation",
				},
				{
					title: "Delete categories",
					url: "/admin/categories/deletion",
				},
			],
		},
		{
			title: "Products",
			icon: Boxes,
			items: [
				{
					title: "List of Products",
					url: "/admin/products",
				},
				{
					title: "Aunction Settings",
					url: "/admin/products/auction-settings",
				}
			],
		},
		{
			title: "Users",
			icon: User,
			items: [
				{
					title: "List of Users",
					url: "/admin/users",
				},
				{
					title: "Upgrade Requests",
					url: "/admin/users/upgrade-requests",
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
