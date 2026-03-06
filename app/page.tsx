import {
  HeroCarousel,
  HeroCarouselSkeleton,
} from "@/components/global/hero-carousel";
import { Navbar } from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center w-full">
      <div className="w-full flex flex-col gap-12 mobile:gap-16 laptop:gap-20 items-center">
        <Navbar />

        <div className="flex-1 flex flex-col gap-12 mobile:gap-16 laptop:gap-20 w-full max-w-7xl p-4 mobile:p-6 laptop:p-8">
          <Suspense fallback={<HeroCarouselSkeleton />}>
            <HeroCarousel />
          </Suspense>

          <main className="flex-1 flex flex-col gap-6 w-full max-w-5xl mx-auto">
            <h2 className="font-semibold text-lg mobile:text-xl laptop:text-2xl mb-2 mobile:mb-4 text-center laptop:text-left text-foreground">
              Next steps
            </h2>
          </main>
        </div>

        <Footer />
      </div>
    </main>
  );
}
