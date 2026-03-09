import { Skeleton } from "@/components/ui/skeleton";

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-2xl overflow-hidden min-h-[220px] md:min-h-[280px] lg:min-h-[340px] bg-muted/50 p-8 md:p-12 lg:p-16 flex flex-col justify-center gap-4">
        <Skeleton className="h-8 md:h-10 lg:h-12 w-3/4 max-w-md" />
        <Skeleton className="h-4 md:h-5 w-full max-w-sm" />
        <Skeleton className="h-4 md:h-5 w-2/3 max-w-xs" />
        <Skeleton className="h-10 w-32 mt-2 rounded-lg" />
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <Skeleton className="h-2 w-6 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}
