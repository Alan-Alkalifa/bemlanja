import { Search, Store, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSearchSkeleton() {
  return (
    <div className="relative w-full max-w-sm ml-4 lg:ml-8 lg:max-w-md hidden md:block">
      <div className="relative flex items-center w-full h-10 px-3 bg-muted/50 rounded-full border border-muted-foreground/20">
        <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
        <div className="h-3 bg-muted-foreground/20 rounded w-[150px] animate-pulse"></div>
      </div>
    </div>
  );
}

export function NavbarSearchDropdownSkeleton() {
  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Stores Skeleton */}
      <div className="p-2 border-b">
        <div className="px-2 py-1 mb-2">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col gap-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="p-2">
        <div className="px-2 py-1 mb-2">
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex flex-col gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-10 h-10 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-2 w-1/4" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
