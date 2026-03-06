import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12 max-w-4xl mx-auto mt-12">
      <Alert className="bg-primary/5 border-primary/20 text-foreground">
        <InfoIcon className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">
          Authentication Successful
        </AlertTitle>
        <AlertDescription>
          This is a protected page that you can only see as an authenticated
          user.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your user details</CardTitle>
          <CardDescription>
            These are your authentication claims retrieved from the active
            session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm font-mono p-4 rounded-xl bg-card border text-card-foreground max-h-[500px] overflow-auto shadow-inner">
            <Suspense
              fallback={
                <div className="text-muted-foreground animate-pulse">
                  Loading user details...
                </div>
              }
            >
              <UserDetails />
            </Suspense>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
