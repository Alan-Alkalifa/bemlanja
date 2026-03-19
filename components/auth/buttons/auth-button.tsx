import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { UserAvatarMenu } from "@/components/global/user-avatar-menu";
import { getProfile } from "@/lib/actions/queries";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  // Use the cached profile for avatar info to avoid N+1 queries in the Navbar
  const { data: profile } = await getProfile();

  return (
    <UserAvatarMenu
      email={user.email as string}
      fullName={profile?.full_name || ""}
      avatarUrl={profile?.avatar_url || ""}
    />
  );
}
