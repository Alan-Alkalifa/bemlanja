import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SearchSidebarFilter } from "@/components/global/search/search-sidebar-filter";
import { SearchProductGrid } from "@/components/global/search/search-product-grid";
import { ProductBannerActions } from "@/components/global/search/product-banner-actions";
import { StoreHeader } from "@/components/global/stores/store-header";
import { Package, Store, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    orgId?: string;
    productId?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const supabase = await createClient();
  const params = await searchParams;

  // Fetch Global Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("categoryId, name, slug");

  // Fetch optional Org Banner data
  let storeData = null;
  let storeStats = null;
  if (params.orgId) {
    const { data: store } = await supabase
      .from("organizations")
      .select("*")
      .eq("orgId", params.orgId)
      .single();

    if (store) {
      storeData = store;
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("orgId", store.orgId)
        .eq("is_active", true)
        .is("deletedAt", null);

      const { data: orgProducts } = await supabase
        .from("products")
        .select("productId")
        .eq("orgId", store.orgId);

      let avgRating = 0;
      if (orgProducts && orgProducts.length > 0) {
        const productIds = orgProducts.map((p) => p.productId);
        const { data: reviews } = await supabase
          .from("product_reviews")
          .select("rating")
          .in("productId", productIds);

        if (reviews && reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          avgRating = sum / reviews.length;
        }
      }

      const joinedDate = new Date(store.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      storeStats = {
        rating: avgRating > 0 ? avgRating.toFixed(1) : "-",
        productCount: productCount ?? 0,
        joinedDate,
      };
    }
  }

  // Fetch optional Product Banner data
  let productData = null;
  let productAvgRating = 0;
  let productReviewCount = 0;
  if (params.productId && !storeData) {
    const { data: product } = await supabase
      .from("products")
      .select(`*, organizations(orgName, logoUrl, slug)`)
      .eq("productId", params.productId)
      .single();
    if (product) {
      productData = product;

      const { data: reviews } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("productId", params.productId);

      if (reviews && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        productAvgRating = sum / reviews.length;
        productReviewCount = reviews.length;
      }
    }
  }

  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto mobile:px-4 laptop:px-8 pb-12 pt-0 md:pt-6 gap-6 md:gap-8">
      {/* Dynamic Headers based on Search Selection */}
      {storeData && storeStats && (
        <StoreHeader store={storeData} stats={storeStats} />
      )}

      {productData && !storeData && (
        <div className="w-full bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row p-4 md:p-6 gap-6 items-start">
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shrink-0 border bg-muted flex items-center justify-center">
            {productData.image_url ? (
              <Image
                src={productData.image_url}
                alt={productData.name}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1 text-left">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground justify-start">
              {(() => {
                const org = Array.isArray(productData.organizations)
                  ? productData.organizations[0]
                  : productData.organizations;
                return org?.logoUrl ? (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border">
                    <Image
                      src={org.logoUrl}
                      alt={org.orgName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Store className="w-4 h-4" />
                );
              })()}
              <Link
                href={`/stores/${Array.isArray(productData.organizations) ? productData.organizations[0]?.slug : productData.organizations?.slug}`}
                className="hover:underline hover:text-primary transition-colors"
              >
                {Array.isArray(productData.organizations)
                  ? productData.organizations[0]?.orgName
                  : productData.organizations?.orgName}
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {productData.name}
            </h1>
            <p className="text-xl font-semibold text-primary mt-2">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(productData.price)}
            </p>

            {/* Rating */}
            <div className="flex items-center justify-start gap-1 h-4 mt-1">
              <div className="flex items-center gap-0.5">
                <Star
                  className={cn(
                    "size-4 fill-chart-3 text-chart-3",
                    productAvgRating === 0 && "fill-muted text-muted",
                  )}
                />
                <span className="text-sm font-bold text-foreground">
                  {productAvgRating > 0 ? productAvgRating.toFixed(1) : "0.0"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground/60 ml-1">|</span>
              <span className="text-sm text-muted-foreground font-medium ml-1">
                {productReviewCount > 0
                  ? `${productReviewCount}+ reviews`
                  : "New"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl mt-2 line-clamp-3">
              {productData.description}
            </p>

            <ProductBannerActions
              productId={productData.productId}
              name={productData.name}
              price={Number(productData.price)}
              imageUrl={productData.image_url}
              organization={
                Array.isArray(productData.organizations)
                  ? productData.organizations[0]
                  : productData.organizations
              }
            />
          </div>
        </div>
      )}

      {!storeData && !productData && (
        <div className="w-full bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden flex flex-col p-6 items-center md:items-start text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {params.q ? `Search results for "${params.q}"` : "Search"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {params.q
              ? "Showing products matching your search across all stores."
              : "Search products across all stores in Bemlanja."}
          </p>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-0 mt-2">
        <aside className="w-full lg:w-[260px] shrink-0 z-20 sticky top-16 lg:top-24 h-fit py-4 lg:py-0">
          <Suspense
            fallback={
              <div className="h-96 w-full animate-pulse bg-muted rounded-xl" />
            }
          >
            <SearchSidebarFilter categories={categories || []} />
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="h-96 w-full animate-pulse bg-muted rounded-xl" />
            }
          >
            <SearchProductGrid />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
