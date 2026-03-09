import { LoadMoreProducts } from "@/components/global/products/load-more-products";
import {
  HeroCarousel,
  HeroCarouselSkeleton,
} from "@/components/global/cms/hero-carousel";
import { ProductGrid } from "@/components/global/products/product-grid";
import { ProductGridSkeleton } from "@/components/global/products/product-grid-skeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
      <div className="flex-1 flex flex-col gap-12 mobile:gap-16 laptop:gap-20 w-full max-w-7xl p-4 mobile:p-6 laptop:p-8 py-8 laptop:py-12">
        {/* Hero Carousel */}
        <Suspense fallback={<HeroCarouselSkeleton />}>
          <HeroCarousel />
        </Suspense>

        {/* Product Grid */}
        <div className="flex flex-col gap-6 laptop:gap-8">
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid title="Latest Products" limit={12} />
          </Suspense>

          {/* Subsequent loads */}
          <LoadMoreProducts initialOffset={12} pageSize={12} />
        </div>
      </div>
    </main>
  );
}
