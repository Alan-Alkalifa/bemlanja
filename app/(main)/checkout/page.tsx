import { Suspense } from "react";
import { CheckoutClient } from "@/components/global/checkout/checkout-client";

// This page is client-rendered and uses dynamic hooks inside CheckoutClient

function CheckoutSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="size-4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        <div className="size-3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6 items-start">
        {/* Left column */}
        <div className="laptop:col-span-2 flex flex-col gap-4">
          <div className="h-4 w-48 bg-muted rounded animate-pulse ml-1 mb-1" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border/40">
                <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="size-4 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="p-4">
                <div className="h-20 w-full bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          ))}

          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-3" />
            <div className="h-24 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border/40">
              <div className="size-4 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="size-16 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="border-t border-border/40 pt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutClient />
      </Suspense>
    </main>
  );
}
