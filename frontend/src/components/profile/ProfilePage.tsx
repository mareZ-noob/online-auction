import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProfileContext } from "@/store/context/profile-context";
import { useTranslation } from "react-i18next";

function ProfilePage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [tabName, setTabName] = useState(() =>
    t("profile.nav.personalInformation")
  );

  return (
    <ProfileContext.Provider
      value={{
        tabName,
        setTabName,
      }}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <p className="text-md font-medium">{tabName}</p>
            </div>
          </header>
          <div className={`p-4 pt-0 ${className}`}>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileContext.Provider>
  );
}

export default ProfilePage;
