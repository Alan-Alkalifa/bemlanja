import React from "react";
import { AuthBanner } from "@/components/auth/auth-banner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side: visually stunning banner */}
      <AuthBanner />

      {/* Right side: Authentication Forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 xl:p-24 relative overflow-y-auto">
        <div className="w-full max-w-[500px] lg:max-w-[600px] mx-auto flex flex-col justify-center min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
