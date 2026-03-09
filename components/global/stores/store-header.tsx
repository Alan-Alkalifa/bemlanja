"use client";

import Image from "next/image";
import { BadgeCheck, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreStats } from "./store-stats";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface StoreHeaderProps {
  store: {
    orgName: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    status: string;
    createdAt: string;
  };
  stats: {
    rating: string | number;
    productCount: number;
    joinedDate: string;
  };
}

export function StoreHeader({ store, stats }: StoreHeaderProps) {
  const isVerified = store.status === "active";
  const handle = store.orgName.toUpperCase();

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/stores/${store.slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Store link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="w-full bg-background rounded-b-lg md:rounded-lg overflow-hidden border-b md:border">
      {/* Banner */}
      <div className="h-48 w-full bg-secondary xl:bg-accent relative">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt={`${store.orgName} Banner`}
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>

      {/* Content Area */}
      <div className="px-4 md:px-8 pb-6 relative">
        {/* Avatar Area - Overlapping */}
        <div className="absolute -top-16">
          <div className="relative h-32 w-32 bg-secondary border-4 border-background rounded-2xl flex items-center justify-center overflow-visible shadow-sm">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={`${store.orgName} Logo`}
                fill
                className="object-cover rounded-sm"
                unoptimized
              />
            ) : (
              <span className="text-5xl font-bold text-foreground">
                {store.orgName.charAt(0).toUpperCase()}
              </span>
            )}

            {/* Verified Badge positioned bottom right of the avatar */}
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-[2px] border-[3px] border-background shadow-sm">
                <BadgeCheck className="h-5 w-5 fill-background text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="pt-20 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{store.orgName}</h1>
              {isVerified && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-primary hover:bg-blue-100 border-none px-2 rounded-full font-medium"
                >
                  Official Store
                </Badge>
              )}
            </div>
            {store.description && (
              <p className="text-sm text-foreground mt-3 max-w-2xl leading-relaxed">
                {store.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-full h-10 px-5">
              <MessageSquare className="h-4 w-4" />
              Chat Store
            </Button>
            <Button
              className="gap-2 rounded-full h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <StoreStats
          rating={stats.rating}
          productCount={stats.productCount}
          joinedDate={stats.joinedDate}
        />
      </div>
    </div>
  );
}
