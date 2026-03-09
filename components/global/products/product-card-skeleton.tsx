import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
      {/* Image container */}
      <div className="relative aspect-square border-b bg-muted/20 animate-pulse">
        {/* Store badge placeholder */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-muted/40 backdrop-blur-md rounded-full px-2 py-1 border border-border/20">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3 pt-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          <Skeleton className="h-6 w-1/2" />

          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-1 shrink-0" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
