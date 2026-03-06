"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewSkeleton } from "./product-review-skeleton";

interface Review {
  rating: number;
  body: string;
  createdAt: string;
  profiles: { email: string }[];
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
        profiles ( email )
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
        <Badge variant="secondary">{totalCount}</Badge>
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
                                  ? "fill-yellow-400 text-yellow-400"
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
