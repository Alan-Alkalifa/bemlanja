import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function StoreHeaderSkeleton() {
  return (
    <div className="w-full bg-background rounded-b-lg md:rounded-lg overflow-hidden border-b md:border shadow-sm">
      {/* Banner Skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      {/* Content Area */}
      <div className="px-4 md:px-8 pb-6 relative">
        {/* Avatar Area Skeleton */}
        <div className="absolute -top-16">
          <Skeleton className="h-32 w-32 border-4 border-background rounded-2xl" />
        </div>

        {/* Info Area Skeleton */}
        <div className="pt-20 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Stats Skeleton */}
        <div className="flex flex-wrap items-center gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
