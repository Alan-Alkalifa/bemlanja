import { Skeleton } from "@/components/ui/skeleton";

export function AuthBannerSkeleton() {
  return (
    <div className="hidden lg:flex w-1/2 bg-sidebar border-r border-border flex-col justify-between p-12">
      {/* Logo placeholder */}
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-24 h-6" />
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-1/2 h-10 bg-primary/20" />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-4/6 h-4" />
        </div>

        {/* Feature bullets */}
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="p-6 rounded-2xl bg-background/50 border border-border">
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-2/3 h-4 mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
