import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Orders List Skeleton ────────────────────────────────────────────────────

export function OrdersListSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="size-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Filter Tabs — card style */}
      <div className="flex gap-1.5 mb-6 bg-muted/60 p-1 rounded-xl border border-border/30">
        {[72, 148, 104, 104, 104].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Order Cards */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border-l-4 border border-border/40 rounded-2xl border-l-border"
          >
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="size-9 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Order Detail Skeleton ───────────────────────────────────────────────────

export function OrderDetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh]">
      {/* Back link */}
      <Skeleton className="h-4 w-28 mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between w-full px-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center flex-1 relative">
              {i > 0 && (
                <div className="absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 bg-border" />
              )}
              <Skeleton className="relative z-10 size-8 rounded-full" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="md:col-span-2 space-y-6">
          {/* Items card */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 border border-border/30 rounded-xl"
                >
                  <Skeleton className="size-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24 self-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {[1, 2].map((card) => (
            <div
              key={card}
              className="bg-card border border-border/50 rounded-2xl overflow-hidden"
            >
              <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2.5">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
