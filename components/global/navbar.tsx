import { AuthButton } from "@/components/auth/buttons/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 h-16 mobile:h-14 laptop:h-16">
      <div className="w-full max-w-7xl flex flex-row justify-between items-center p-3 px-4 laptop:px-8 text-sm">
        <div className="flex gap-4 laptop:gap-6 items-center font-semibold">
          <Link
            href={"/"}
            className="text-foreground/90 hover:text-foreground transition-colors mobile:text-sm laptop:text-base font-bold"
          >
            Bemlanja
          </Link>
        </div>
        <div className="flex items-center gap-2 laptop:gap-4">
          <Suspense
            fallback={
              <div className="h-8 w-20 animate-pulse bg-muted rounded-md" />
            }
          >
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
