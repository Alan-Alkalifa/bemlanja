"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ProductCard } from "@/components/global/products/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/ui/empty";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { StoreProductGridSkeleton } from "./store-product-grid-skeleton";

interface StoreProductGridProps {
  orgId: string;
  initialProducts?: any[];
  initialTotal?: number;
}

// Ensure you have a standard fetch function for React Query to read the params and call Supabase
export function StoreProductGrid({ orgId }: StoreProductGridProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const sort = searchParams.get("sort") || "latest";

  // Use React Query for client-side fetching to easily handle all combination of filters
  const { data, isLoading } = useQuery({
    queryKey: ["store-products", orgId, q, category, minPrice, maxPrice, sort],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          productId, name, price, image_url,
          organizations ( orgId, orgName, slug, logoUrl ),
          product_reviews ( rating ),
          product_org_categories!inner ( orgCategoryId )
        `,
          { count: "exact" },
        )
        .eq("orgId", orgId)
        .eq("is_active", true)
        .is("deletedAt", null);

      // Apply Search
      if (q) {
        query = query.ilike("name", `%${q}%`);
      }

      // Apply Category (using inner join mapped above)
      if (category && category !== "all") {
        // We need the orgCategoryId for this slug.
        // In a real app we'd fetch the ID or use a view, but here we can do a subquery or secondary fetch
        const { data: catData } = await supabase
          .from("org_categories")
          .select("orgCategoryId")
          .eq("slug", category)
          .single();
        if (catData) {
          query = query.eq(
            "product_org_categories.orgCategoryId",
            catData.orgCategoryId,
          );
        }
      }

      // Apply Price
      if (minPrice) {
        query = query.gte("price", parseInt(minPrice));
      }
      if (maxPrice) {
        query = query.lte("price", parseInt(maxPrice));
      }

      // Apply Sort
      switch (sort) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "latest":
        default:
          query = query.order("createdAt", { ascending: false });
          break;
      }

      const { data: products, count, error } = await query;

      if (error) throw error;
      return { products, count };
    },
  });

  // Handle sort change
  const handleSortChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value !== "latest") {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  if (isLoading) {
    return <StoreProductGridSkeleton />;
  }

  const products = data?.products || [];
  const total = data?.count || 0;

  return (
    <section className="flex flex-col gap-6 w-full">
      {/* Top Bar: Title & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-foreground">All Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {products.length} of {total} products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Sort by:
          </span>
          <Select
            value={sort}
            onValueChange={handleSortChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-[160px] h-9 shadow-sm">
              <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Newest</SelectItem>
              <SelectItem value="price_asc">Lowest Price</SelectItem>
              <SelectItem value="price_desc">Highest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p: any) => {
            const org = Array.isArray(p.organizations)
              ? p.organizations[0]
              : p.organizations;
            const reviews = Array.isArray(p.product_reviews)
              ? p.product_reviews
              : [];
            const totalReviews = reviews.length;
            const avgRating =
              totalReviews > 0
                ? reviews.reduce(
                    (sum: number, r: any) => sum + (r.rating || 0),
                    0,
                  ) / totalReviews
                : 0;

            return (
              <ProductCard
                key={p.productId}
                productId={p.productId}
                name={p.name}
                price={Number(p.price)}
                image_url={p.image_url}
                avgRating={avgRating}
                reviewCount={totalReviews}
                org={{
                  orgName: org?.orgName ?? "Store",
                  slug: org?.slug ?? "",
                  initials: (org?.orgName ?? "S").slice(0, 2).toUpperCase(),
                  logoUrl: org?.logoUrl ?? null,
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-12 border border-dashed rounded-xl">
          <Empty>
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Search className="h-10 w-10 mb-4 text-muted-foreground/50" />
              <p className="font-semibold text-lg text-foreground mb-1">
                No products found
              </p>
              <p className="text-sm">
                Try adjusting your search filters or categories.
              </p>
            </div>
          </Empty>
        </div>
      )}
    </section>
  );
}
