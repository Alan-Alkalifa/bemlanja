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
import { StoreProductGridSkeleton } from "@/components/global/stores/store-product-grid-skeleton";
import { ProductPagination } from "@/components/global/products/product-pagination";

const PAGE_SIZE = 40;

export function SearchProductGrid() {
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
  const orgId = searchParams.get("orgId") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const offset = (page - 1) * PAGE_SIZE;

  // Use React Query for client-side fetching to easily handle all combination of filters
  const { data, isLoading } = useQuery({
    queryKey: ["global-products", q, category, minPrice, maxPrice, sort, orgId, page],
    queryFn: async () => {
      // Dynamic select to use !inner join only when filtering by category
      const categoryFilterActive = category && category !== "all";
      const selectStr = `
        productId, name, price, image_url, createdAt,
        organizations!inner ( orgId, orgName, slug, logoUrl ),
        product_reviews ( rating ),
        product_categories${categoryFilterActive ? "!inner" : ""} ( categoryId )
      `;

      let query = supabase
        .from("products")
        .select(selectStr, { count: "exact" })
        .eq("is_active", true)
        .is("deletedAt", null);

      // Apply Filter by Store/Org
      if (orgId) {
        query = query.eq("orgId", orgId);
      }

      // Apply Search
      if (q) {
        query = query.ilike("name", `%${q}%`);
      }

      // Apply Category (using global categories table)
      if (categoryFilterActive) {
        const { data: catData } = await supabase
          .from("categories")
          .select("categoryId")
          .eq("slug", category)
          .single();
          
        if (catData) {
          query = query.eq(
            "product_categories.categoryId",
            catData.categoryId,
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

      // Apply Pagination
      query = query.range(offset, offset + PAGE_SIZE - 1);

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
      // Reset to page 1 on sort change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  if (isLoading) {
    return <StoreProductGridSkeleton />;
  }

  const products = data?.products || [];
  const total = data?.count || 0;

  return (
    <section className="flex flex-col gap-6 w-full mt-4 lg:mt-0">
      {/* Top Bar: Title & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-foreground">
            {q ? `Results for "${q}"` : "All Products"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {products.length} of {total} products
          </p>
        </div>

        <div className="flex flex-row items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap hidden mobile:inline">
              Sort by:
            </span>
            <Select
              value={sort}
              onValueChange={handleSortChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-[130px] sm:w-[160px] h-9 shadow-sm">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Newest</SelectItem>
                <SelectItem value="price_asc">Lowest Price</SelectItem>
                <SelectItem value="price_desc">Highest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top Pagination */}
          <ProductPagination
            totalItems={total}
            pageSize={PAGE_SIZE}
            currentPage={page}
            variant="top"
          />
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 xl:grid-cols-5 gap-4">
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
                Try adjusting your search filters.
              </p>
            </div>
          </Empty>
        </div>
      )}

      {/* Bottom Pagination */}
      <div className="mt-8">
        <ProductPagination
          totalItems={total}
          pageSize={PAGE_SIZE}
          currentPage={page}
          variant="bottom"
        />
      </div>
    </section>
  );
}
