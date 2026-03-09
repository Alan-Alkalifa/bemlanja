import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="size-20 rounded-lg shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex items-center justify-between mt-1">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="size-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
