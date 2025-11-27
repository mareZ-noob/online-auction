import {useState} from "react";
import { GalleryVerticalEnd, SearchIcon, ChevronUp } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button.tsx";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store.ts";
import {cn} from "@/lib/utils.ts";

function Header() {
	const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

	return (
		<div className="flex items-center justify-between w-full py-4 px-16 border-b-1 border-[#ddd]">
			<div className="flex items-center w-[50%]">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<GalleryVerticalEnd className="size-4" />
						</div>
						<p className="text-nowrap">Online Auction</p>
					</a>
				</div>
				<InputGroup className="mx-4">
					<InputGroupInput placeholder="Search..." />
					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>
				</InputGroup>
			</div>
			<div>
				{isTokenExpired() && (
					<div className="flex items-center justify-center">
						<Button variant="outline" className="mr-4">
							Login
						</Button>
						<Button>Signup</Button>
					</div>
				)}
			</div>
		</div>
	);
}

const categories = [
    {
        id: "electronics",
        label: "Electronics",
        subCategories: [
            { id: "phones", title: "Smartphones" },
            { id: "laptops", title: "Laptops" },
        ],
    },
    {
        id: "fashion",
        label: "Fashion",
        subCategories: [
            { id: "men", title: "Men's Wear" },
            { id: "women", title: "Women's Wear" },
        ],
    },
    {
        id: "home",
        label: "Home & Garden",
        subCategories: [
            { id: "kitchen", title: "Kitchen" },
            { id: "furniture", title: "Furniture" },
        ],
    },
];

function Category() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleCategoryClick = (id: string) => {
        setActiveCategory(prev => (prev === id ? null : id));
    };

    const handleResetCategory = () => {
        setActiveCategory(null);
    }

    const activeData = categories.find((c) => c.id === activeCategory);

    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center justify-between w-full border-b border-[#ddd] px-16">
                <div>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary hover:cursor-pointer",
                                activeCategory === cat.id
                                    ? "border-b-2 border-black text-black"
                                    : "text-muted-foreground"
                            )}
                        >
                            <p className="py-4 pr-16">{cat.label}</p>
                        </button>
                    ))}
                </div>
                <Button variant="outline" onClick={handleResetCategory} disabled={!activeCategory}><ChevronUp /></Button>
            </div>

            <div>
                {activeCategory && activeData ? (
                    <div className="px-16 py-4 border-b-1  border-[#ddd] flex gap-10">
                        {activeData.subCategories.map(subCategory => <p key={subCategory.id} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:cursor-pointer">{subCategory.title}</p>)}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function LayoutWithHeader() {
	return (
		<div>
			<div>
                <Header />
                <Category />
            </div>
			<main className="px-16">
				<Outlet />
			</main>
		</div>
	);
}

export default LayoutWithHeader;
