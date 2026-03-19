"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      // Check if the email exists in our database first
      const { data: emailExists, error: existenceError } = await supabase.rpc(
        "check_email_exists",
        {
          p_email: email,
        },
      );

      if (existenceError) {
        console.error("Error checking email existence:", existenceError);
      } else if (!emailExists) {
        toast.error("No account found with this email address.");
        setIsLoading(false);
        return;
      }

      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent.");
      setSuccess(true);
    } catch (error: unknown) {

      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground">
              Password reset instructions sent
            </p>
          </div>
          <div className="grid gap-6">
            <p className="text-sm text-muted-foreground">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Type in your email and we&apos;ll send you a link to reset your
              password
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Send reset email"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm flex flex-row justify-center items-center gap-2 text-muted-foreground">
                <span>Already have an account?</span>
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
