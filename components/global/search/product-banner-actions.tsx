"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductBannerActionsProps {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  organization?: {
    orgId: string;
    orgName: string;
    slug: string;
  };
}

export function ProductBannerActions({
  productId,
}: ProductBannerActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <Link href={`/products/${productId}`}>
        <Button variant="default" className="gap-2 h-10 w-full sm:w-auto">
          <ExternalLink className="h-4 w-4" />
          See Detail
        </Button>
      </Link>
    </div>
  );
}
