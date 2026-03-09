import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreHeader } from "@/components/global/stores/store-header";
import { StoreSidebarFilter } from "@/components/global/stores/store-sidebar-filter";
import { StoreProductGrid } from "@/components/global/stores/store-product-grid";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("organizations")
    .select("orgName, description, logoUrl, city_name, province_name")
    .eq("slug", slug)
    .single();

  if (!store) return { title: "Store Not Found" };

  const title = `${store.orgName} — Toko di Bemlanja`;
  const description = store.description
    ? store.description.slice(0, 160)
    : `Kunjungi toko ${store.orgName}${
        store.city_name ? ` di ${store.city_name}` : ""
      } dan temukan produk pilihan terbaik di Bemlanja.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: store.logoUrl
        ? [{ url: store.logoUrl, alt: store.orgName, width: 400, height: 400 }]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
  };
}


export default async function StoreProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch store details
  const { data: store, error: storeError } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (storeError || !store) notFound();

  // Fetch store stats: Product Count
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("orgId", store.orgId)
    .eq("is_active", true)
    .is("deletedAt", null);

  // Fetch store stats: Average Rating
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

  // Format joined date (e.g., "January 2026")
  const joinedDate = new Date(store.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const stats = {
    rating: avgRating > 0 ? avgRating.toFixed(1) : "-",
    productCount: productCount ?? 0,
    joinedDate,
  };

  // Fetch Categories for sidebar
  const { data: categories } = await supabase
    .from("org_categories")
    .select("orgCategoryId, name, slug")
    .eq("orgId", store.orgId);

  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto mobile:px-4 laptop:px-8 pb-12 pt-0 md:pt-6 gap-6 md:gap-8">
      <StoreHeader store={store} stats={stats} />

      {/* 2-Column Layout below Header */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-0 mt-2">
        {/* Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 z-20 sticky top-16 lg:top-24 h-fit py-4 lg:py-0">
          <StoreSidebarFilter
            categories={categories || []}
            storeName={store.orgName}
          />
        </aside>

        {/* Main Content (Grid) */}
        <div className="flex-1 min-w-0">
          <StoreProductGrid orgId={store.orgId} />
        </div>
      </div>
    </main>
  );
}
