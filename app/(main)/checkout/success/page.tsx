import { Suspense } from "react";
import type { Metadata } from "next";
import { SuccessClient } from "./success-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed | Bemlanja",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p>Loading order details...</p>
          </div>
        }
      >
        <SuccessClient />
      </Suspense>
    </main>
  );
}
