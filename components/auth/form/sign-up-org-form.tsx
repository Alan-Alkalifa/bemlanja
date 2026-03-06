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
import { sendOrgVerificationEmail } from "@/app/actions/send-org-email";

export function SignUpOrgForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // Organization fields
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [orgEmail, setOrgEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Auto-generate slug from Org Name if slug is empty
  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setOrgName(newName);
    if (
      !slug ||
      slug ===
        orgName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
    ) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    if (password !== repeatPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Check if the personal email already exists in auth.users
      const { data: emailExists, error: existenceError } = await supabase.rpc(
        "check_email_exists",
        {
          p_email: email,
        },
      );

      if (existenceError) {
        console.error(
          "Error checking personal email existence:",
          existenceError,
        );
      } else if (emailExists) {
        toast.error(
          "An account with this personal login email already exists. Please log in.",
        );
        setIsLoading(false);
        return;
      }

      // 2. Check if the organization contact email is already registered
      const { data: orgExists, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("orgEmail", orgEmail)
        .maybeSingle();

      if (orgError) {
        console.error("Error checking org email existence:", orgError);
      } else if (orgExists) {
        toast.error(
          "An organization is already registered with this contact email.",
        );
        setIsLoading(false);
        return;
      }

      // 3. Check if the Organization Slug is already taken
      const { data: slugExists, error: slugError } = await supabase.rpc(
        "check_slug_exists",
        {
          p_slug: slug,
        },
      );

      if (slugError) {
        console.error("Error checking slug existence:", slugError);
      } else if (slugExists) {
        toast.error(
          "This Store URL Slug is already taken by another organization. Please choose a different one.",
        );
        setIsLoading(false);
        return;
      }

      // 4. Generate a simple 6-digit OTP for the organization email
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            role: "seller",
            orgName,
            slug,
            label,
            orgEmail,
            verificationToken,
          },
        },
      });
      if (error) throw error;

      // We log the token so you can see it in development
      console.log(`Generated OTP for ${orgEmail}: ${verificationToken}`);

      // Dispatch the physical email using Resend
      const emailResult = await sendOrgVerificationEmail(
        orgEmail,
        verificationToken,
      );
      if (emailResult.error) {
        console.warn("Failed to send email to org:", emailResult.error);
        // We don't throw here because the user is fundamentally created;
        // but we can warn them if the email failed to send.
        toast.warning(
          "Organization created, but we couldn't send the verification email. Check console or contact support.",
        );
      } else {
        toast.success(
          "Organization created successfully! Please check both your personal and organization emails.",
        );
      }
      router.push("/auth/verify-org");
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Register Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new seller account for Bemlanja
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Bemlanja Official Store"
                  required
                  value={orgName}
                  onChange={handleOrgNameChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="slug">Store URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="bemlanja-official"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="label">Brand Label / Tagline</Label>
                  <Input
                    id="label"
                    placeholder="Tech Gadgets"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="grid gap-2">
                <Label htmlFor="orgEmail">Organization Contact Email</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  placeholder="contact@bemlanja.com"
                  required
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Personal Login Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <PasswordInput
                  id="password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <PasswordInput
                  id="repeat-password"
                  required
                  placeholder="Repeat your password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Register Organization"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">Not a seller?</span>{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up as a regular user
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
