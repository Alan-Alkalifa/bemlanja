"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import * as React from "react";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  cta_text: string;
  cta_href: string;
  image_url: string;
  sort_order: number;
}

export function HeroCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-2xl overflow-hidden min-h-[220px] md:min-h-[280px] lg:min-h-[340px] bg-muted/50 p-8 md:p-12 lg:p-16 flex flex-col justify-center gap-4">
        <Skeleton className="h-8 md:h-10 lg:h-12 w-3/4 max-w-md" />
        <Skeleton className="h-4 md:h-5 w-full max-w-sm" />
        <Skeleton className="h-4 md:h-5 w-2/3 max-w-xs" />
        <Skeleton className="h-10 w-32 mt-2 rounded-lg" />
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <Skeleton className="h-2 w-6 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch banners from Supabase
  React.useEffect(() => {
    const fetchBanners = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .schema("cms")
        .from("banners")
        .select(
          "id, title, subtitle, cta_text, cta_href, image_url, sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setBanners(data);
      }
      setIsLoading(false);
    };

    fetchBanners();
  }, []);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play
  React.useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  if (isLoading) return <HeroCarouselSkeleton />;
  if (banners.length === 0) return null;

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-[280px] lg:min-h-[340px] flex flex-col justify-center">
                {/* Background image */}
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />

                <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-xl">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-sm md:text-base text-white/80 mb-6 max-w-md leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                  >
                    <Link href={banner.cta_href}>{banner.cta_text}</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-0 shadow-md" />
        <CarouselNext className="right-4 bg-white/80 hover:bg-white border-0 shadow-md" />
      </Carousel>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300 cursor-pointer",
              index === current
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
