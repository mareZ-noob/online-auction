import { useContext, useState } from "react";
import {
  GalleryVerticalEnd,
  Heart,
  LogOut,
  Mail,
  // Moon,
  SearchIcon,
  User,
  UserPen,
  ChartBarStacked,
  SquarePlus,
  Languages,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button.tsx";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store.ts";
import { cn } from "@/lib/utils.ts";
import { useSignOut } from "@/hooks/auth-hooks.ts";
import { useFetchCategories } from "@/hooks/product-hooks";
import { useUserStore } from "@/store/user-store";
import { useFetchUser } from "@/hooks/user-hooks";
import { CommonLayoutContext } from "@/store/context/common-layout-context";
import ChangeLanguageButton from "@/components/custom-ui/change-language-button/ChangeLanguageButton";
import { useTranslation } from "react-i18next";
import ParticleSky from "@/components/custom-ui/particle-sky/ParticleSky";

function WatchList() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToWatchList = () => {
    navigate("/watch-list");
  };

  return (
    <Button
      variant="outline"
      className="flex items-center justify-center"
      onClick={goToWatchList}
    >
      <Heart />
      <p>{t("userNav.watchList")}</p>
    </Button>
  );
}

function NavUser({ handleSignOut }: { handleSignOut?: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const id = useUserStore((state) => state.id);
  const isSeller = useUserStore((state) => state.isSeller);

  const { data } = useFetchUser(id ?? 0);

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToPublishProduct = () => {
    if (isSeller) {
      navigate("/products/publish");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-center">
          <User />
          <p>{data?.fullName}</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center gap-2 text-gray-500">
          <Mail size={16} />
          <p className="font-light">{data?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center" onClick={goToProfile}>
            <UserPen className="text-black" />
            {t("userNav.profile")}
          </DropdownMenuItem>
          {isSeller && (
            <DropdownMenuItem
              className="flex items-center"
              onClick={goToPublishProduct}
            >
              <SquarePlus className="text-black" />
              {t("userNav.publishNewProduct")}
            </DropdownMenuItem>
          )}
          {/* <DropdownMenuItem className="flex items-center">
            <Moon className="text-black" />
            {t("userNav.darkMode")}
          </DropdownMenuItem> */}
          <DropdownMenuItem className="flex items-center">
            <Languages className="text-black" />
            <ChangeLanguageButton lang="vi" />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center">
            <Languages className="text-black" />
            <ChangeLanguageButton lang="en" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
          <LogOut className="text-black" />
          {t("userNav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToggleCategory() {
  const { setIsActiveFilter, isActiveFilter } = useContext(CommonLayoutContext);

  const handleToggle = () => {
    setIsActiveFilter(!isActiveFilter);
  };

  return (
    <Button
      variant={isActiveFilter ? "default" : "secondary"}
      onClick={handleToggle}
    >
      <ChartBarStacked />
    </Button>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");

  const onSearch = () => {
    // navigate to Product list page and pass the search query
    if (inputValue && inputValue.trim().length > 0) {
      navigate(`/products?search=${encodeURIComponent(inputValue.trim())}`, {
        state: { searchQuery: inputValue.trim() },
      });
    }
  };

  return (
    <>
      <InputGroup className="mx-4">
        <InputGroupInput
          placeholder="Search..."
          onChange={(e) => setInputValue(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <div className="flex gap-2 items-center">
        <Button onClick={onSearch}>{t("userNav.search")}</Button>
        <ToggleCategory />
      </div>
    </>
  );
}

function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

  const { mutate, isPending } = useSignOut();

  const handleSignIn = () => {
    navigate("/auth/sign-in");
  };

  const handleSignUp = () => {
    navigate("/auth/sign-up");
  };

  const handleSignOut = () => {
    mutate(undefined, {
      onSuccess: () => {
        navigate("/auth/sign-in");
      },
    });
  };

  return (
    <div className="flex items-center justify-between w-full py-4 px-16 bg-white border-b border-[#ddd] z-50">
      <div className="flex items-center w-[50%]">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/me" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <p className="text-nowrap">Online Auction</p>
          </a>
        </div>
        <SearchBar />
      </div>
      <div>
        {isTokenExpired() ? (
          <div className="flex items-center justify-center">
            <Button variant="outline" className="mr-4" onClick={handleSignIn}>
              {t("userNav.login")}
            </Button>
            <Button onClick={handleSignUp}>{t("userNav.signup")}</Button>
          </div>
        ) : isPending ? (
          <Button disabled>{t("userNav.loggingOut")}</Button>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <WatchList />
            <NavUser handleSignOut={handleSignOut} />
          </div>
        )}
      </div>
    </div>
  );
}

function Category() {
  const navigate = useNavigate();

  const { isActiveFilter } = useContext(CommonLayoutContext);

  const { data: categories } = useFetchCategories();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(
    null
  );
  const cats = categories ?? [];

  const handleCategoryClick = (categoryName: string, categoryId: number) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
    navigate(`/products?category=${categoryName}`, {
      state: {
        categoryId: categoryId,
      },
    });
  };

  const handleResetCategory = () => {
    setActiveCategory(null);
    setActiveSubCategory(null);
  };

  const handleSubCategoryClick = (
    categoryName: string,
    categoryId: number,
    subCategoryName: string,
    subCategoryId: number
  ) => {
    setActiveSubCategory(subCategoryId);
    navigate(
      `/products?category=${categoryName}&subCategory=${subCategoryName}`,
      {
        state: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
        },
      }
    );
  };

  const activeData = cats.find((c) => c.id === activeCategory);

  return (
    <div className="w-full flex flex-col relative">
      {isActiveFilter && (
        <div className="flex items-center justify-between w-full border-b border-[#ddd] px-16">
          <div>
            {cats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name, cat.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary hover:cursor-pointer",
                  activeCategory === cat.id
                    ? "border-b-2 border-black text-black"
                    : "text-muted-foreground"
                )}
              >
                <p className="py-4 pr-16">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {isActiveFilter && activeCategory && (
        <div
          className="absolute left-0 top-full w-full bg-white px-16 border-b border-[#ddd] flex gap-10 z-1"
          onClick={() => setActiveCategory(activeCategory)}
          onBlur={handleResetCategory}
        >
          {activeData &&
            activeData?.children.map((subCategory) => (
              <p
                key={subCategory.id}
                className={cn(
                  "py-4 px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:cursor-pointer",
                  activeSubCategory === subCategory.id
                    ? "border-b-2 border-black text-black"
                    : "text-muted-foreground"
                )}
                onClick={() =>
                  handleSubCategoryClick(
                    activeData.name,
                    activeData.id,
                    subCategory.name,
                    subCategory.id
                  )
                }
              >
                {subCategory.name}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative bg-black text-white mt-32 py-16">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleSky count={100} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto text-center">
        <p>© 2025 - Online Auction …</p>
        <div className="flex justify-center gap-8">
          <p>22127286 - Nguyễn Thanh Nam</p>
          <p>22127441 - Thái Huyễn Tùng</p>
        </div>
      </div>
    </footer>
  );
}

function CommonLayout() {
  const [isActiveFilter, setIsActiveFilter] = useState(true);

  const commonLayoutContextValue = {
    isActiveFilter,
    setIsActiveFilter,
  };

  return (
    <CommonLayoutContext.Provider value={commonLayoutContextValue}>
      <div>
        <Header />
        <Category />
      </div>
      <main className="px-16">
        <Outlet />
      </main>
      <Footer />
    </CommonLayoutContext.Provider>
  );
}

export default CommonLayout;
