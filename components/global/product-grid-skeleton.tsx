import { ProductCardSkeleton } from "@/components/global/product-card-skeleton";

interface ProductGridSkeletonProps {
  /** How many skeleton cards to show. Defaults to 6. */
  count?: number;
}

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <section className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="h-7 w-40 bg-muted animate-pulse rounded-md" />
      {/* Grid */}
      <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4 laptop:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
