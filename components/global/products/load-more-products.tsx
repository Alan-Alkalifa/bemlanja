"use client";

import * as React from "react";
import { ProductCard } from "@/components/global/products/product-card";
import { ProductCardSkeleton } from "@/components/global/products/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Product {
  productId: string;
  name: string;
  price: number;
  image_url: string | null;
  organizations: {
    orgId: string;
    orgName: string;
    slug: string;
    logoUrl: string | null;
  } | {
    orgId: string;
    orgName: string;
    slug: string;
    logoUrl: string | null;
  }[];
  product_reviews: { rating: number }[];
}

interface LoadMoreProductsProps {
  initialOffset: number;
  pageSize?: number;
  orgId?: string;
}

export function LoadMoreProducts({
  initialOffset,
  pageSize = 12,
  orgId,
}: LoadMoreProductsProps) {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(initialOffset);
  const [isMobile, setIsMobile] = React.useState(false);
  const observerRef = React.useRef<HTMLDivElement>(null);
  const fetchingRef = React.useRef(false); // Ref to prevent concurrent fetches
  const supabase = createClient();

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is laptop breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProducts = React.useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      let query = supabase
        .from("products")
        .select(
          `productId, name, price, image_url,
           organizations ( orgId, orgName, slug, logoUrl ),
           product_reviews ( rating )`
        )
        .eq("is_active", true)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (orgId) {
        query = query.eq("orgId", orgId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        setHasMore(false);
      } else {
        const fetchedProducts = data.map((p: any) => {
          const org = Array.isArray(p.organizations) ? p.organizations[0] : p.organizations;
          const reviews = Array.isArray(p.product_reviews) ? p.product_reviews : [];
          const totalReviews = reviews.length;
          const avgRating = totalReviews > 0
            ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
            : 0;

          return {
            ...p,
            org: {
              orgName: org?.orgName ?? "Store",
              slug: org?.slug ?? "",
              initials: (org?.orgName ?? "T").slice(0, 2).toUpperCase(),
              logoUrl: org?.logoUrl ?? null,
            },
            avgRating,
            reviewCount: totalReviews,
            price: Number(p.price),
          };
        });

        setProducts((prev) => {
          // Deduplicate by productId to prevent React key errors
          const existingIds = new Set(prev.map(p => p.productId));
          const newUniqueProducts = fetchedProducts.filter(p => !existingIds.has(p.productId));
          return [...prev, ...newUniqueProducts];
        });
        
        setOffset((prev) => prev + pageSize);
        if (data.length < pageSize) setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, offset, pageSize, orgId, supabase]);

  // Intersection Observer for mobile
  React.useEffect(() => {
    if (!isMobile || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, hasMore, loading, fetchProducts]);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Dynamic Grid for Loaded Products */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4 laptop:gap-6 w-full">
          {products.map((p) => (
            <ProductCard
              key={p.productId}
              productId={p.productId}
              name={p.name}
              price={p.price}
              image_url={p.image_url}
              avgRating={p.avgRating}
              reviewCount={p.reviewCount}
              org={p.org}
            />
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4 laptop:gap-6 w-full">
          {Array.from({ length: pageSize }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Sentinel / Load More Button */}
      {hasMore && (
        <div className="flex justify-center w-full py-8" ref={observerRef}>
          {!isMobile && !loading && (
            <Button
              onClick={fetchProducts}
              variant="outline"
              size="lg"
              className="rounded-full px-8 font-bold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20"
            >
              Load More Products
            </Button>
          )}
          {loading && isMobile && (
            <div className="flex items-center gap-2 text-muted-foreground font-medium animate-pulse">
              <Loader2 className="size-5 animate-spin" />
              <span>Loading more products...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
