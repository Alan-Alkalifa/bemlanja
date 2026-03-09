import { Star, Package, Calendar } from "lucide-react";

interface StoreStatsProps {
  rating: number | string;
  productCount: number;
  joinedDate: string;
}

export function StoreStats({
  rating,
  productCount,
  joinedDate,
}: StoreStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-3/20 text-chart-3">
          <Star className="h-5 w-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{rating}</span>
          <span className="text-xs text-muted-foreground">Rating</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{productCount}</span>
          <span className="text-xs text-muted-foreground">Products</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20 text-chart-2">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{joinedDate}</span>
          <span className="text-xs text-muted-foreground">Joined</span>
        </div>
      </div>
    </div>
  );
}
