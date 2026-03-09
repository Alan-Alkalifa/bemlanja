import { Skeleton } from "@/components/ui/skeleton";
import { StoreProductGridSkeleton } from "@/components/global/stores/store-product-grid-skeleton";

export function SearchPageSkeleton() {
  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto mobile:px-4 laptop:px-8 pb-12 pt-0 md:pt-6 gap-6 md:gap-8 animate-in fade-in duration-500">
      {/* Search Header Banner Skeleton */}
      <div className="w-full bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row p-6 items-center md:items-start border-muted gap-4">
         <div className="flex flex-col gap-3 w-full max-w-2xl">
             <Skeleton className="h-8 w-[200px]" />
             <Skeleton className="h-4 w-[350px]" />
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-0 mt-2">
        {/* Sidebar Filter Skeleton */}
        <aside className="w-full lg:w-[260px] shrink-0">
          <div className="hidden lg:flex flex-col gap-6 sticky top-24">
            <div className="flex flex-col gap-3">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-3">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-9 w-full" />
               <Skeleton className="h-9 w-full" />
               <Skeleton className="h-9 w-full" />
               <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-4">
               <Skeleton className="h-4 w-28" />
               <Skeleton className="h-6 w-full mt-2" />
               <div className="flex items-center gap-2 mt-2">
                 <Skeleton className="h-12 flex-1" />
                 <Skeleton className="h-12 flex-1" />
               </div>
               <Skeleton className="h-9 w-full mt-2" />
            </div>
          </div>

          {/* Mobile Filter Button Skeleton */}
          <div className="lg:hidden w-full sticky top-16 z-10 bg-background/95 backdrop-blur pt-4 pb-2">
             <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <div className="flex-1 min-w-0">
          <StoreProductGridSkeleton />
        </div>
      </div>
    </main>
  );
}
