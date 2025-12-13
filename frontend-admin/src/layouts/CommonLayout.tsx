import { AppSidebar } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { CommonLayoutContext } from "@/store/context/common-layout-context";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function CommonLayout() {
	const [tabName, setTabName] = useState("Dashboard");
	const [subTabName, setSubTabName] = useState("Reports");

	return (
		<CommonLayoutContext.Provider
			value={{
				tabName,
				subTabName,
				setTabName,
				setSubTabName,
			}}
		>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="#">Admin</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>{tabName}</BreadcrumbPage>
									</BreadcrumbItem>
									{subTabName ? (
										<>
											<BreadcrumbSeparator className="hidden md:block" />
											<BreadcrumbItem>
												<BreadcrumbPage>{subTabName}</BreadcrumbPage>
											</BreadcrumbItem>
										</>
									) : null}
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</CommonLayoutContext.Provider>
	);
}
