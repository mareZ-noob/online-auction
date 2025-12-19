import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  User,
  PackageOpen,
  Box,
  Mail,
  ShoppingBag,
  MessageCircleQuestionMark,
  CircleCheckBig,
} from "lucide-react";

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
import { useTranslation } from "react-i18next";

type NavEntry = {
  titleKey: string;
  url: string;
  icon: LucideIcon;
  isSeller?: boolean;
};

const NAV_ITEMS: NavEntry[] = [
  {
    titleKey: "profile.nav.personalInformation",
    url: "/profile/personal-information",
    icon: User,
  },
  {
    titleKey: "profile.nav.biddingProducts",
    url: "/profile/bidding-products",
    icon: PackageOpen,
  },
  {
    titleKey: "profile.nav.wonProducts",
    url: "/profile/won-products",
    icon: Box,
  },
  {
    titleKey: "profile.nav.myPublishedProducts",
    url: "/profile/published-products",
    icon: ShoppingBag,
    isSeller: true,
  },
  {
    titleKey: "profile.nav.wonPublishedProducts",
    url: "/profile/won-published-products",
    icon: CircleCheckBig,
    isSeller: true,
  },
  {
    titleKey: "profile.nav.unansweredQuestions",
    url: "/profile/unanswered-questions",
    icon: MessageCircleQuestionMark,
    isSeller: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const id = useUserStore((state) => state.id);
  const isSeller = useUserStore((state) => state.isSeller);
  const { data: userData } = useFetchUser(id ?? 0);
  const { t } = useTranslation();

  const handleBackToDashboard = () => {
    navigate("/me");
  };

  const navData = useMemo(() => {
    const entries = isSeller
      ? NAV_ITEMS
      : NAV_ITEMS.filter((item) => !item.isSeller);

    return entries.map((item) => ({
      title: t(item.titleKey),
      url: item.url,
      icon: item.icon,
    }));
  }, [isSeller, t]);

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
