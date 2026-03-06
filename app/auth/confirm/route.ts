import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Route based on OTP type for the best post-verification UX
      if (type === "recovery") {
        redirect("/auth/update-password");
      }
      if (type === "signup") {
        redirect("/protected");
      }
      // Use explicit `next` param as fallback, then root
      redirect(next ?? "/protected");
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect("/auth/error?error=No+token+hash+or+type");
}
