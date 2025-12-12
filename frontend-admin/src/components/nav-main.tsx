import { ChevronRight, type LucideIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useContext, useState } from "react";
import { CommonLayoutContext } from "@/store/context/common-layout-context";
import { Link } from "react-router-dom";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		icon: LucideIcon;
		items: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const { tabName, subTabName, setTabName, setSubTabName } = useContext(
		CommonLayoutContext,
	);
	const [openTab, setOpenTab] = useState<string | null>("Dashboard");

	const toggleTab = (title: string) => {
		setOpenTab((prev) => (prev === title ? null : title));
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible
						key={item.title}
						asChild
						open={openTab === item.title}
						onOpenChange={() => toggleTab(item.title)}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton
									tooltip={item.title}
									isActive={tabName === item.title}
								>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton
												asChild
												onClick={() => {
													setTabName(item.title);
													setSubTabName(subItem.title);
												}}
												isActive={
													subTabName === subItem.title && tabName === item.title
												}
											>
												<Link to={subItem.url}>
													<span>{subItem.title}</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
