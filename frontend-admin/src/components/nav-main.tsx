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
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProfileContext } from "@/store/context/profile-context";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const { setTabName } = useContext(ProfileContext);

  const [isActiveTab, setIsActiveTab] = useState(0);
  const location = useLocation();

  const handleChangeIsActiveTab = (index: number) => {
    setIsActiveTab(index);
    // keep immediate feedback on click
    setTabName(items[index].title);
  };

  // Sync active tab and tabName when the route changes. This ensures
  // the header reflects the current page immediately after navigation
  // (avoids needing to click twice when navigation occurs before the
  // local state update).
  useEffect(() => {
    const idx = items.findIndex((it) =>
      location.pathname.startsWith(it.url)
    );

    if (idx !== -1 && idx !== isActiveTab) {
      setIsActiveTab(idx);
      setTabName(items[idx].title);
    }
  }, [location.pathname, items, isActiveTab, setTabName]);

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
