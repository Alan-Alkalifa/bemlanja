"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 py-20 text-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <h1 className="text-[120px] md:text-[180px] font-black text-primary/10 select-none leading-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <Search className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Oops! Page not found
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a new
          lair. Don't worry, even the best shoppers get lost sometimes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 gap-2 shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 gap-2 hover:bg-muted/50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-7xl w-full border-t border-border/50 pt-12">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Need help?</h4>
          <p className="text-sm text-muted-foreground">
            Check our Help Center or contact support.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Quick Search</h4>
          <p className="text-sm text-muted-foreground">
            Search for products, categories, or stores.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Explore</h4>
          <p className="text-sm text-muted-foreground">
            Browse latest products and popular deals.
          </p>
        </div>
      </div>
    </main>
  );
}
