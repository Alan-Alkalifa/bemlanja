"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Intercept the unconfirmed email error
        if (error.message.includes("Email not confirmed")) {
          // Automatically resend the verification email
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/protected`,
            },
          });

          if (resendError) {
            toast.error("Please verify your email address to log in.");
          } else {
            toast.error(
              "Please verify your email address. We just sent a new link to your inbox!",
            );
          }
          setIsLoading(false);
          return;
        }
        throw error;
      }

      // Check for Organization Verification if they are a seller
      if (data?.user?.user_metadata?.role === "seller") {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("orgEmail, orgEmailVerified")
          .eq("userId", data.user.id)
          .single();

        if (!orgError && orgData && !orgData.orgEmailVerified) {
          toast.warning(
            "Your personal email is verified, but you still need to verify your organization contact email.",
          );
          // Push to verify org page, prefilling the email
          router.push(
            `/auth/verify-org?email=${encodeURIComponent(orgData.orgEmail)}`,
          );
          return;
        }
      }

      toast.success("Successfully logged in.");
      router.push("/protected");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm flex flex-col gap-2">
              <div>
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Want to be a seller?
                </span>{" "}
                <Link
                  href="/auth/sign-up-org"
                  className="underline underline-offset-4 font-medium"
                >
                  Register an Organization
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
