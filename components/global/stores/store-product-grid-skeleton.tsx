import { ProductCardSkeleton } from "@/components/global/products/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreProductGridSkeletonProps {
  count?: number;
}

export function StoreProductGridSkeleton({
  count = 10,
}: StoreProductGridSkeletonProps) {
  return (
    <section className="flex flex-col gap-6 w-full">
      {/* Top Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-[160px] rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
