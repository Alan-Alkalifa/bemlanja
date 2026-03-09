import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full rounded-2xl">
      {/* Image */}
      <div className="w-full">
        <AspectRatio ratio={1 / 1}>
          <Skeleton className="w-full h-full rounded-none" />
        </AspectRatio>
      </div>
      {/* Info */}
      <CardContent className="p-4 flex flex-col gap-2 flex-1 justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <Skeleton className="h-3 w-1/3 mt-2" />
      </CardContent>
    </Card>
  );
}
