import { useState } from "react";
import {
	GalleryVerticalEnd,
	Heart,
	LogOut,
	Moon,
	SearchIcon,
	User,
	UserPen,
	WalletCards,
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

function WatchList() {
	return (
		<Button variant="outline" className="flex items-center justify-center">
			<Heart />
			<p>Watchlist</p>
		</Button>
	);
}

function NavUser({ handleSignOut }: { handleSignOut?: () => void }) {
	const fullName = useUserStore((state) => state.fullName);
	const email = useUserStore((state) => state.email);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="flex items-center justify-center">
					<User />
					<p>{fullName}</p>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60" align="end">
				<DropdownMenuLabel className="flex items-center gap-2">
					My Account
					<p className="font-light text-gray-300">|</p>
					<p className="font-light text-gray-500">{email}</p>
				</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem className="flex items-center">
						<UserPen className="text-black" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem className="flex items-center">
						<WalletCards className="text-black" />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem className="flex items-center">
						<Moon className="text-black" />
						Dark Mode
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} className="flex items-center">
					<LogOut className="text-black" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SearchBar() {
	return (
		<>
			<InputGroup className="mx-4">
				<InputGroupInput placeholder="Search..." />
				<InputGroupAddon>
					<SearchIcon />
				</InputGroupAddon>
			</InputGroup>
			<Button>Search</Button>
		</>
	);
}

function Header() {
	const navigate = useNavigate();
	const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

	const { mutate, isPending } = useSignOut();

	const handleSignOut = () => {
		mutate(undefined, {
			onSuccess: () => {
				navigate("/auth/sign-in");
			},
		});
	};

	return (
		<div className="flex items-center justify-between w-full py-4 px-16 border-b-1 border-[#ddd]">
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
						<Button variant="outline" className="mr-4">
							Login
						</Button>
						<Button>Signup</Button>
					</div>
				) : isPending ? (
					<Button disabled>Logging out...</Button>
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

	const { data: categories } = useFetchCategories();
	const [activeCategory, setActiveCategory] = useState<number | null>(null);
	const cats = categories ?? [];

	const handleCategoryClick = (id: number) => {
		setActiveCategory((prev) => (prev === id ? null : id));
	};

	const handleResetCategory = () => {
		setActiveCategory(null);
	};

	const handleSubCategoryClick = (
		categoryName: string,
		categoryId: number,
		subCategoryName: string,
		subCategoryId: number,
	) => {
		navigate(
			`/products/category/${categoryName}/subCategory/${subCategoryName}`,
			{
				state: {
					categoryId: categoryId,
					subCategoryId: subCategoryId,
				},
			},
		);
	};

	const activeData = cats.find((c) => c.id === activeCategory);

	return (
		<div className="w-full flex flex-col relative">
			<div className="flex items-center justify-between w-full border-b border-[#ddd] px-16">
				<div>
					{cats.map((cat) => (
						<button
							key={cat.id}
							onMouseEnter={() => handleCategoryClick(cat.id)}
							className={cn(
								"text-sm font-medium transition-colors hover:text-primary hover:cursor-pointer",
								activeCategory === cat.id
									? "border-b-2 border-black text-black"
									: "text-muted-foreground",
							)}
						>
							<p className="py-4 pr-16">{cat.name}</p>
						</button>
					))}
				</div>
			</div>

			{activeCategory && (
				<div
					className="absolute left-0 top-full w-full bg-white px-16 py-4 border-b border-[#ddd] flex gap-10 z-50"
					onMouseEnter={() => setActiveCategory(activeCategory)}
					onMouseLeave={handleResetCategory}
				>
					{activeData &&
						activeData?.children.map((subCategory) => (
							<p
								key={subCategory.id}
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:cursor-pointer"
								onClick={() =>
									handleSubCategoryClick(
										activeData.name,
										activeData.id,
										subCategory.name,
										subCategory.id,
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
		<div className="bg-[#173127] flex flex-col items-center justify-center text-white mt-32 py-16">
			<div className="max-w-lg">
				<p>© 2025 - Online Auction - Advanced Web Development - 22KTPM1</p>
				<div className="flex justify-center gap-8">
					<p>22127286 - Nguyễn Thanh Nam</p>
					<p>22127441 - Thái Huyễn Tùng</p>
				</div>
			</div>
		</div>
	);
}

function CommonLayout() {
	return (
		<div>
			<div>
				<Header />
				<Category />
			</div>
			<main className="px-16">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}

export default CommonLayout;
