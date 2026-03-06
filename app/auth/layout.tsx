import React, { Suspense } from "react";
import { AuthBanner } from "@/components/auth/auth-banner";
import { AuthBannerSkeleton } from "@/components/auth/auth-banner-skeleton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side: CMS-driven banner — wrapped in Suspense because AuthBanner
          is an async server component that reads cookies via createClient() */}
      <Suspense fallback={<AuthBannerSkeleton />}>
        <AuthBanner />
      </Suspense>

      {/* Right side: Authentication Forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 xl:p-24 relative overflow-y-auto">
        <div className="w-full max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col justify-center min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
