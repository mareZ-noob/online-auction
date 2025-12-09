import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, PackageOpen, Box, Mail, ShoppingBag } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useFetchUser } from "@/hooks/user-hooks";
import { useUserStore } from "@/store/user-store";

const data = {
	navMain: [
		{
			title: "Personal Infomation",
			url: "/profile/personal-information",
			icon: User,
			isActive: true,
		},
		{
			title: "Bidding Products",
			url: "/profile/bidding-products",
			icon: PackageOpen,
		},
		{
			title: "Won Products",
			url: "/profile/won-products",
			icon: Box,
		},
		{
			title: "My Published Products",
			url: "/profile/published-products",
			icon: ShoppingBag,
			isSeller: true,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();

	const id = useUserStore((state) => state.id);
	const isSeller = useUserStore((state) => state.isSeller);
	const { data: userData } = useFetchUser(id ?? 0);

	const handleBackToDashboard = () => {
		navigate("/me");
	};

	const navData = useMemo(() => {
		if (isSeller) {
			return data.navMain;
		}

		return data.navMain.filter((item) => !item.isSeller);
	}, [isSeller]);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" onClick={handleBackToDashboard}>
							<div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<Mail size={16} />
							</div>

							<div
								className="grid flex-1 text-left text-sm leading-tight 
                        group-data-[collapsible=icon]:hidden"
							>
								<p className="text-md font-normal">{userData?.fullName}</p>

								<p className="text-sm font-light text-gray-500">
									{userData?.email}
								</p>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navData} />
			</SidebarContent>
			<SidebarFooter></SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
