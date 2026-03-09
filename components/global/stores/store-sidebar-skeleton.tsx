import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function StoreSidebarSkeleton() {
  const SkeletonContent = (
    <div className="flex flex-col gap-6">
      {/* Search Section Skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <Separator />

      {/* Categories Section Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <Skeleton className="h-9 w-full rounded-md bg-secondary" />
          <Skeleton className="h-9 w-3/4 rounded-md" />
          <Skeleton className="h-9 w-5/6 rounded-md" />
          <Skeleton className="h-9 w-4/6 rounded-md" />
        </div>
      </div>

      <Separator />

      {/* Price Range Section Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />

        <div className="px-2 pt-2">
          <Skeleton className="h-2 w-full my-4" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col flex-1 gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col flex-1 gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Helper Note Skeleton */}
      <div className="bg-secondary/40 rounded-xl p-4 flex flex-col gap-2 mt-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex w-[260px] flex-col">{SkeletonContent}</div>
      <div className="lg:hidden w-full">
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </>
  );
}
