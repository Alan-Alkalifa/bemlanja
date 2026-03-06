import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, ShieldCheck, Star, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  ProductDetailClient,
  type ProductVariant,
} from "@/components/global/product-detail-client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductReviews } from "@/components/global/product-reviews";
import { ProductDescription } from "@/components/global/product-description";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product + org + reviews + images + variants + categories
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      productId, name, description, price, image_url, stock,
      organizations (
        orgId, orgName, slug, logoUrl, description,
        city_name, province_name, status
      ),
      product_reviews ( 
        rating, 
        body, 
        createdAt,
        profiles ( email )
      ),
      product_images ( imageId, url, sort_order ),
      product_variants ( variantId, name, price, stock ),
      product_categories (
        categories ( categoryId, name, slug )
      ),
      product_org_categories (
        org_categories ( orgCategoryId, name, slug )
      )
    `,
    )
    .eq("productId", id)
    .eq("is_active", true)
    .is("deletedAt", null)
    .order("createdAt", { foreignTable: "product_reviews", ascending: false })
    .range(0, 4, { foreignTable: "product_reviews" })
    .single();

  if (error || !product) notFound();

  // Fetch total reviews count and average rating separately for accuracy
  const { count: totalReviewsCount } = await supabase
    .from("product_reviews")
    .select("*", { count: "exact", head: true })
    .eq("productId", id);

  const { data: allRatings } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("productId", id);

  const reviewCount = totalReviewsCount ?? 0;
  const avgRating =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

  // Derived data
  const org = Array.isArray(product.organizations)
    ? product.organizations[0]
    : product.organizations;

  const reviews = Array.isArray(product.product_reviews)
    ? product.product_reviews
    : [];

  const images: { imageId: string; url: string; sort_order: number }[] = (
    Array.isArray(product.product_images) ? product.product_images : []
  ).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order,
  );
  if (images.length === 0 && product.image_url) {
    images.push({ imageId: "main", url: product.image_url, sort_order: 0 });
  }

  const variants: ProductVariant[] = (
    Array.isArray(product.product_variants) ? product.product_variants : []
  ).map((v: ProductVariant) => ({
    ...v,
    price: Number(v.price),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalCategories: { categoryId: string; name: string; slug: string }[] =
    (
      Array.isArray(product.product_categories)
        ? product.product_categories
        : []
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((pc: any) => pc.categories)
      .filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgCategories: { orgCategoryId: string; name: string; slug: string }[] =
    (
      Array.isArray(product.product_org_categories)
        ? product.product_org_categories
        : []
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((poc: any) => poc.org_categories)
      .filter(Boolean);

  const orgInitials = (org?.orgName ?? "S").slice(0, 2).toUpperCase();
  const location = [org?.city_name, org?.province_name]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="flex-1 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl p-4 mobile:p-6 laptop:p-8 py-8 laptop:py-12">
        {/* Main product layout */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8 laptop:gap-12">
          {/* ─── LEFT: Image Slider ─── */}
          <div className="w-full">
            <Carousel opts={{ loop: images.length > 1 }} className="w-full">
              <CarouselContent>
                {images.map((img) => (
                  <CarouselItem key={img.imageId}>
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={img.url}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover"
                        priority
                      />
                    </div>
                  </CarouselItem>
                ))}
                {images.length === 0 && (
                  <CarouselItem>
                    <div className="aspect-square rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </div>

          {/* ─── RIGHT: Product Info ─── */}
          <div className="flex flex-col gap-5">
            {/* Name + meta */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl laptop:text-3xl font-bold text-foreground uppercase tracking-wide">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <span>
                    ({reviewCount} {reviewCount === 1 ? "Review" : "Reviews"})
                  </span>
                </div>

                {/* Ships from */}
                {location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>Ships from</span>
                    <span className="font-medium text-foreground">
                      {location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Interactive section: price, variants, qty, button */}
            <ProductDetailClient
              variants={variants}
              basePrice={Number(product.price)}
              baseStock={product.stock}
            />

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="py-0 shadow-none">
                <CardContent className="flex items-start gap-3 p-4">
                  <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Safe Guarantee
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Money back if the order doesn&apos;t match.
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="py-0 shadow-none">
                <CardContent className="flex items-start gap-3 p-4">
                  <Store className="size-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      Verified Merchant
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Seller verified by platform.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── Seller Information ─── */}
            <div className="flex flex-col gap-3 pt-2">
              <h2 className="text-sm font-bold text-foreground">
                Seller Information
              </h2>
              <Card className="py-0 shadow-none">
                <CardContent className="flex flex-col gap-4 p-4">
                  {/* Avatar + details */}
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      {org?.logoUrl && (
                        <AvatarImage
                          src={org.logoUrl}
                          alt={org?.orgName ?? ""}
                        />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {orgInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {org?.orgName ?? "Store"}
                        </span>
                        {org?.status === "active" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0"
                          >
                            Official Store
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-1">
                        {location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <MapPin className="size-3 shrink-0" />
                            {location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="xs"
                            className="gap-1 px-3 shadow-none border-border/50"
                          >
                            <MessageCircle className="size-3" />
                            Chat
                          </Button>
                          {org?.slug && (
                            <Button
                              size="xs"
                              className="px-3 shadow-none"
                              asChild
                            >
                              <Link href={`/stores/${org.slug}`}>
                                Visit Store
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ─── Product Description ─── */}
        <ProductDescription description={product.description ?? product.name} />

        {/* ─── Categories ─── */}
        {(globalCategories.length > 0 || orgCategories.length > 0) && (
          <div className="mt-6 flex flex-col gap-3">
            {globalCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-1">
                  Category:
                </span>
                {globalCategories.map((c) => (
                  <Badge key={c.categoryId} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
            {orgCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-1">
                  Store Category:
                </span>
                {orgCategories.map((c) => (
                  <Badge key={c.orgCategoryId} variant="outline">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Buyer Reviews ─── */}
        <ProductReviews
          productId={product.productId}
          initialReviews={reviews}
          totalCount={reviewCount}
        />
      </div>
    </main>
  );
}
