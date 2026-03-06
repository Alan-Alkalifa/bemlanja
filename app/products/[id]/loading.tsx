import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductDetailLoading() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl p-4 mobile:p-6 laptop:p-8 py-8 laptop:py-12">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8 laptop:gap-12">
          {/* Image skeleton */}
          <Skeleton className="w-full aspect-square rounded-xl" />

          {/* Info skeleton */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
            <Separator />
            <Skeleton className="h-9 w-1/3 rounded-md" />
            {/* Variant chips */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-lg" />
              ))}
            </div>
            {/* Qty row */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            {/* Button */}
            <Skeleton className="h-12 w-full rounded-lg" />
            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            {/* Seller info skeleton */}
            <div className="flex flex-col gap-3 pt-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 flex flex-col gap-4">
          <Separator />
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-4/6 rounded-md" />
        </div>

        {/* Reviews */}
        <div className="mt-10 flex flex-col gap-4">
          <Separator />
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
