import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface ProductCardProps {
  productId: string;
  name: string;
  price: number;
  image_url: string | null;
  avgRating: number;
  reviewCount: number;
  org: {
    orgName: string;
    slug: string;
    initials: string;
    logoUrl: string | null;
  };
  className?: string;
}

/** Format a number as Indonesian Rupiah, e.g. 200000 → "Rp 200.000" */
function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID", { minimumFractionDigits: 0 });
}

export function ProductCard({
  productId,
  name,
  price,
  image_url,
  avgRating,
  reviewCount,
  org,
  className,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-card border border-transparent hover:border-border/50 overflow-hidden relative",
        className,
      )}
    >
      <Link 
        href={`/products/${productId}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View ${name}`}
      />
      
      {/* Image container */}
      <div className="relative overflow-hidden aspect-square border-b">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
            No image
          </div>
        )}

        {/* Glassmorphic store badge overlay */}
        <Link 
          href={`/stores/${org.slug}`}
          className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10 max-w-[85%] transition-all duration-300 group-hover:translate-y-[-2px] hover:scale-105"
        >
          <Avatar className="size-6 border border-white/20">
            {org.logoUrl && (
               <AvatarImage
                 src={org.logoUrl}
                 alt={org.orgName}
                 className="object-cover"
               />
            )}
            <AvatarFallback className="text-[8px] font-bold bg-primary text-primary-foreground">
               {org.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-semibold text-white truncate leading-none tracking-tight">
            {org.orgName}
          </span>
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3 pt-0 z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-sm tracking-tight text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors h-9">
            {name}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-extrabold text-lg text-foreground tracking-tight">
            {formatRupiah(price)}
          </p>

          <div className="flex items-center gap-1.5 h-4">
            <div className="flex items-center gap-0.5">
              <Star
                className={cn(
                  "size-3 fill-chart-3 text-chart-3",
                  avgRating === 0 && "fill-muted text-muted",
                )}
              />
              <span className="text-[11px] font-bold text-foreground">
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/60">|</span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {reviewCount > 0 ? `${reviewCount}+ reviews` : "New"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
