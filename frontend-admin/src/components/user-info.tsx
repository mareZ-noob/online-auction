import * as React from "react";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useSignOut } from "@/hooks/auth-hooks";
import { useFetchUserById } from "@/hooks/user-hooks";
import { useAuthStore } from "@/store/auth-store";

export function UserInfo() {
	const navigate = useNavigate();

	const { isMobile } = useSidebar();

	const userId = useAuthStore(state => state.getUserId());

	if (!userId) {
		navigate("/auth/sign-in");
		return;
	}

	const { data } = useFetchUserById(userId);
	const { mutate } = useSignOut();

	const handleLogout = () => {
		mutate(undefined, {
			onSuccess: () => {
				navigate("/auth/sign-in");
			},
			onError: () => {
				navigate("/auth/sign-in");
			},
		});
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<User size={16} />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{data?.fullName}</span>
								<span className="truncate text-xs">{data?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuItem className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<LogOut className="size-4" />
							</div>
							<div
								className="text-muted-foreground font-medium"
								onClick={handleLogout}
							>
								Logout
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
