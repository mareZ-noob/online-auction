import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useContext, useState } from "react";
import { ProfileContext } from "@/store/context/profile-context";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const { setTabName } = useContext(ProfileContext);

  const [isActiveTab, setIsActiveTab] = useState(0);

  const handleChangeIsActiveTab = (index: number) => {
    setIsActiveTab(index);
    setTabName(items[index].title);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item, index) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActiveTab === index}
              onClick={() => handleChangeIsActiveTab(index)}
              asChild
            >
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-2",
                    isActive && "bg-muted font-medium"
                  )
                }
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
