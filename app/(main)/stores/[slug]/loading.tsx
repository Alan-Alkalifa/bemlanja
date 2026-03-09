import { StoreHeaderSkeleton } from "@/components/global/stores/store-header-skeleton";
import { StoreProductGridSkeleton } from "@/components/global/stores/store-product-grid-skeleton";
import { StoreSidebarSkeleton } from "@/components/global/stores/store-sidebar-skeleton";

export default function LoadingStoreProfile() {
  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto mobile:px-4 laptop:px-8 pb-12 pt-0 md:pt-6 gap-6 md:gap-8">
      <StoreHeaderSkeleton />

      {/* 2-Column Layout Skeleton */}
      <div className="flex flex-col md:flex-row gap-8 px-4 md:px-0 mt-2">
        {/* Sidebar Skeleton */}
        <aside className="w-full md:w-[260px] shrink-0">
          <StoreSidebarSkeleton />
        </aside>

        {/* Main Content (Grid) Skeleton */}
        <div className="flex-1 min-w-0">
          <StoreProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}
