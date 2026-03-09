"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReviewSkeleton } from "./product-review-skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Review {
  rating: number;
  body: string;
  createdAt: string;
  profiles: { email: string }[];
  product_review_images: { url: string }[];
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  totalCount: number;
}

const PAGE_SIZE = 5;

export function ProductReviews({
  productId,
  initialReviews,
  totalCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialReviews.length < totalCount);
  const supabase = createClient();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const start = reviews.length;
    const end = start + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        `
        rating, 
        body, 
        createdAt,
        profiles ( email ),
        product_review_images ( url )
      `,
      )
      .eq("productId", productId)
      .order("createdAt", { ascending: false })
      .range(start, end);

    if (!error && data) {
      const fetchedReviews = data as unknown as Review[];
      setReviews((prev) => {
        const next = [...prev, ...fetchedReviews];
        setHasMore(next.length < totalCount);
        return next;
      });
    } else {
      setHasMore(false);
    }

    setLoading(false);
  }, [productId, reviews.length, totalCount, loading, hasMore, supabase]);

  return (
    <div className="mt-10 flex flex-col gap-4">
      <Separator />
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">Buyer Reviews</h2>
        <Badge variant="default">{totalCount}</Badge>
      </div>

      {totalCount === 0 ? (
        <Card className="py-0 shadow-none">
          <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            No reviews for this product yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r, i) => {
            const reviewerProfile = Array.isArray(r.profiles)
              ? r.profiles[0]
              : (r.profiles as unknown as { email: string });
            const reviewerName = reviewerProfile?.email
              ? reviewerProfile.email.split("@")[0]
              : "Anonymous";
            const maskedName =
              reviewerName.slice(0, 3) + "***" + reviewerName.slice(-1);
            const reviewDate = new Date(r.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            );

            return (
              <Card
                key={`${i}-${r.createdAt}`}
                className="py-0 shadow-none border-none bg-muted/30"
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {reviewerName.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {maskedName}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className={`size-3 ${
                                s < r.rating
                                  ? "fill-chart-3 text-chart-3"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {reviewDate}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed pl-11">
                    {r.body}
                  </p>
                  {r.product_review_images &&
                    r.product_review_images.length > 0 && (
                      <div className="flex gap-2 pb-2 pl-11 mt-1">
                        {r.product_review_images.slice(0, 2).map((img, idx) => {
                          const isLastVisible =
                            idx === 1 && r.product_review_images.length > 2;
                          const remainingCount =
                            r.product_review_images.length - 2;

                          return (
                            <Dialog key={idx}>
                              <DialogTrigger asChild>
                                <button className="relative size-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/10 hover:opacity-90 transition-opacity">
                                  <Image
                                    src={img.url}
                                    alt={`Review image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  {isLastVisible && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        +{remainingCount}
                                      </span>
                                    </div>
                                  )}
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] tablet:max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                                <DialogHeader className="sr-only">
                                  <DialogTitle>Review Images</DialogTitle>
                                </DialogHeader>
                                <Card className="border-none shadow-2xl bg-background overflow-hidden rounded-2xl">
                                  <CardContent className="p-0 relative flex flex-col">
                                    <Carousel
                                      opts={{
                                        startIndex: idx,
                                        loop:
                                          r.product_review_images.length > 1,
                                      }}
                                      className="w-full"
                                    >
                                      <CarouselContent>
                                        {r.product_review_images.map(
                                          (fullImg, fIdx) => (
                                            <CarouselItem
                                              key={fIdx}
                                              className="flex items-center justify-center p-0"
                                            >
                                              <div className="relative w-full aspect-square mobile:aspect-4/5 bg-muted/20">
                                                <Image
                                                  src={fullImg.url}
                                                  alt={`Review image ${fIdx + 1}`}
                                                  fill
                                                  className="object-contain"
                                                  unoptimized
                                                />
                                              </div>
                                            </CarouselItem>
                                          ),
                                        )}
                                      </CarouselContent>
                                      {r.product_review_images.length > 1 && (
                                        <>
                                          <CarouselPrevious className="left-4 mobile:flex" />
                                          <CarouselNext className="right-4 mobile:flex" />
                                        </>
                                      )}
                                    </Carousel>

                                    {/* Info Overlay at the bottom of the card */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent text-white pointer-events-none">
                                      <div className="flex items-end justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-base font-bold tracking-tight">
                                            {maskedName}
                                          </span>
                                          <span className="text-xs font-medium opacity-70">
                                            {reviewDate}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-1">
                                          {Array.from({ length: 5 }).map(
                                            (_, s) => (
                                              <Star
                                                key={s}
                                                className={`size-3.5 ${
                                                  s < r.rating
                                                    ? "fill-chart-3 text-chart-3"
                                                    : "text-white/20"
                                                }`}
                                              />
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </DialogContent>
                            </Dialog>
                          );
                        })}
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })}

          {loading && (
            <div className="flex flex-col gap-4">
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
