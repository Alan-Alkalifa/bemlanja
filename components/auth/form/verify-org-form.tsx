"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { sendOrgVerificationEmail } from "@/app/actions/send-org-email";

export function VerifyOrgForm() {
  const [orgEmail, setOrgEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Read the email query param safely on the client to avoid Suspense boundary requirements
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setOrgEmail(emailParam);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    try {
      // Call the secure RPC function to verify and update the organization
      const { data: isVerified, error } = await supabase.rpc(
        "verify_org_email",
        {
          p_email: orgEmail,
          p_token: token,
        },
      );

      if (error || !isVerified) {
        throw new Error("Invalid email or verification code.");
      }

      toast.success(
        `Organization email verified successfully! You can now log in.`,
      );
      router.push("/auth/login");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!orgEmail) {
      toast.error("Please enter your organization email first.");
      return;
    }

    setIsResending(true);
    const supabase = createClient();

    try {
      // Call the secure RPC to regenerate the token for this email
      const { data: newVerificationToken, error } = await supabase.rpc(
        "regenerate_org_token",
        {
          p_email: orgEmail,
        },
      );

      if (error || !newVerificationToken) {
        throw new Error(
          "Could not find an unverified organization with that email.",
        );
      }

      // Send the email
      const emailResult = await sendOrgVerificationEmail(
        orgEmail,
        newVerificationToken,
      );
      if (emailResult.error) {
        throw new Error(emailResult.error);
      }

      toast.success("A new verification code has been sent to your email!");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Organization Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to your organization contact email.
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgEmail">Organization Email</Label>
              <Input
                id="orgEmail"
                type="email"
                placeholder="contact@bemlanja.com"
                required
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="token" className="block text-center sm:text-left">
                6-Digit Verification Code
              </Label>
              <div className="flex justify-center sm:justify-start">
                <InputOTP
                  id="token"
                  maxLength={6}
                  value={token}
                  onChange={(value) => setToken(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isResending}
              >
                {isLoading ? <Spinner /> : "Verify Email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading || isResending}
                onClick={handleResendOTP}
              >
                {isResending ? <Spinner /> : "Resend Verification Code"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
