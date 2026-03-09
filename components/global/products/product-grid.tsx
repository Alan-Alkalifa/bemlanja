import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/global/products/product-card";

interface ProductGridProps {
  title?: string;
  /** Max number of products to show. Defaults to 12. */
  limit?: number;
  orgId?: string;
}

export async function ProductGrid({
  title = "Latest Products",
  limit = 12,
  orgId,
}: ProductGridProps) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `productId, name, price, image_url,
       organizations ( orgId, orgName, slug, logoUrl ),
       product_reviews ( rating )`,
    )
    .eq("is_active", true)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (orgId) {
    query = query.eq("orgId", orgId);
  }

  const { data: products, error } = await query;

  if (error || !products || products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg mobile:text-xl laptop:text-2xl text-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4 laptop:gap-6">
        {products.map((p) => {
          const org = Array.isArray(p.organizations)
            ? p.organizations[0]
            : p.organizations;

          const reviews = Array.isArray(p.product_reviews)
            ? p.product_reviews
            : [];
          const totalReviews = reviews.length;
          const avgRating =
            totalReviews > 0
              ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                totalReviews
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
                initials: (org?.orgName ?? "T").slice(0, 2).toUpperCase(),
                logoUrl: org?.logoUrl ?? null,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
