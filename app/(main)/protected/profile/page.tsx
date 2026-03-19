import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileContent from "@/components/global/profile/ProfileContent";
import { getAddresses, getProfile } from "@/lib/actions/queries";

export const metadata: Metadata = {
  title: "My Profile | Bemlanja",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileFetcher />
    </Suspense>
  );
}

async function ProfileFetcher() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/protected/profile");

  const [{ data: profile }, { data: addresses }] = await Promise.all([
    getProfile(),
    getAddresses(),
  ]);

  return (
    <ProfileContent
      profile={profile}
      addresses={addresses ?? []}
      userEmail={user.email ?? ""}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh] space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="size-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar card skeleton */}
        <div className="md:col-span-1">
          <Skeleton className="h-[380px] rounded-[2.5rem]" />
        </div>

        {/* Right: Info + Addresses skeleton */}
        <div className="md:col-span-2 space-y-8">
          <Skeleton className="h-[400px] rounded-4xl" />
          <Skeleton className="h-[300px] rounded-4xl" />
        </div>
      </div>
    </div>
  );
}
