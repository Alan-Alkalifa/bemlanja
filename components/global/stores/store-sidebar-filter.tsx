"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Layers, Info, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDebounce } from "@/hooks/use-debounce";

interface Category {
  orgCategoryId: string;
  name: string;
  slug: string;
}

interface StoreSidebarFilterProps {
  categories: Category[];
  storeName: string;
}

export function StoreSidebarFilter({
  categories,
  storeName,
}: StoreSidebarFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search State
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  // Category State
  const currentCategory = searchParams.get("category") || "all";

  // Price Range State
  const initialMinPrice = searchParams.get("min_price") || "0";
  const initialMaxPrice = searchParams.get("max_price") || "10000000";
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  // Slider state expects number array
  const [priceRange, setPriceRange] = useState([
    parseInt(initialMinPrice),
    parseInt(initialMaxPrice),
  ]);

  // Update URL function
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  // Handle Search Input Change
  useEffect(() => {
    if (debouncedQuery !== (searchParams.get("q") || "")) {
      startTransition(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (debouncedQuery) {
          newParams.set("q", debouncedQuery);
        } else {
          newParams.delete("q");
        }
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
      });
    }
  }, [debouncedQuery, pathname, router, searchParams]);

  // Handle Category click
  const handleCategoryChange = (slug: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("category", slug)}`, {
        scroll: false,
      });
    });
  };

  // Handle Price Apply
  const handleApplyPrice = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (minPrice && parseInt(minPrice) > 0) {
        params.set("min_price", minPrice);
      } else {
        params.delete("min_price");
      }

      if (maxPrice && parseInt(maxPrice) < 10000000) {
        params.set("max_price", maxPrice);
      } else {
        params.delete("max_price");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Handle Slider Change
  const handleSliderChange = (value: number[]) => {
    setPriceRange(value);
    setMinPrice(value[0].toString());
    setMaxPrice(value[1].toString());
  };

  const FilterContent = (
    <div className="flex flex-col gap-6">
      {/* Search Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          Search in Store
        </h3>
        <div className="relative">
          <Input
            placeholder={`Search in ${storeName}...`}
            className="pl-3 pr-10 shadow-sm rounded-lg border-muted"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="absolute right-0 top-0 h-full px-3 border-l text-primary-foreground flex items-center justify-center bg-primary hover:bg-primary/90 rounded-r-lg">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Categories Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          Categories
        </h3>
        <div className="flex flex-col gap-1">
          <Button
            variant={currentCategory === "all" ? "secondary" : "ghost"}
            className={`justify-start w-full font-medium ${currentCategory === "all" ? "bg-primary" : "text-muted-foreground"}`}
            onClick={() => handleCategoryChange("all")}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.orgCategoryId}
              variant={currentCategory === cat.slug ? "default" : "ghost"}
              className={`justify-start w-full uppercase text-xs tracking-wider ${currentCategory === cat.slug ? "bg-primary font-bold" : "text-muted-foreground"}`}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-foreground">Price Range</h3>

        <div className="px-2 pt-2">
          <Slider
            value={priceRange}
            onValueChange={handleSliderChange}
            max={10000000}
            step={10000}
            className="my-4"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col flex-1 gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase">
              Min
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                Rp
              </span>
              <Input
                className="pl-8 text-xs h-9"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                type="number"
              />
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase">
              Max
            </span>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">
                Rp
              </span>
              <Input
                className="pl-8 text-xs h-9"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                type="number"
              />
            </div>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full text-xs font-semibold bg-primary hover:bg-primary/80"
          onClick={handleApplyPrice}
          disabled={isPending}
        >
          Apply Price
        </Button>
      </div>

      {/* Helper Note */}
      <div className="bg-primary/40 rounded-xl p-4 flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-foreground/70" />
        <p>Use price and category filters to find the products you need.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex w-[260px] flex-col sticky top-4">
        {FilterContent}
      </div>

      {/* Tablet & Mobile View */}
      <div className="lg:hidden w-full">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2 justify-center shadow-sm h-11"
            >
              <Filter className="w-4 h-4" />
              Filter Products
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left px-4">
              <DrawerTitle>Filter Products</DrawerTitle>
              <DrawerDescription>
                Adjust product search in this store.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
              {FilterContent}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
