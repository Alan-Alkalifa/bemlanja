"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? "";
  const isPending = searchParams.get("status") === "pending";

  return (
    <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
      {/* Icon */}
      <div
        className={`size-24 rounded-full flex items-center justify-center ${
          isPending
            ? "bg-amber-500/10 text-amber-500"
            : "bg-green-500/10 text-green-500"
        }`}
      >
        {isPending ? (
          <Clock className="size-12" />
        ) : (
          <CheckCircle2 className="size-12" />
        )}
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {isPending ? "Payment Pending" : "Order Confirmed!"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isPending
            ? "Your payment is being processed. We'll send a confirmation once it's verified."
            : "Thank you for your order! The seller has been notified and will process it shortly."}
        </p>
      </div>

      {/* Order ID */}
      {orderId && (
        <div className="w-full rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <p className="font-mono text-sm font-medium text-foreground break-all">
            {orderId}
          </p>
        </div>
      )}

      {/* What's next */}
      <div className="w-full rounded-2xl border border-border/50 bg-card p-4 text-left">
        <p className="text-sm font-semibold text-foreground mb-3">What happens next?</p>
        <div className="flex flex-col gap-2.5">
          {[
            isPending
              ? "Payment verification in progress"
              : "Payment confirmed ✓",
            "Seller packs your order",
            "Courier picks up & ships",
            "You receive your package 📦",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className={`size-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 && !isPending
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={
                  i === 0 && !isPending
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-muted-foreground"
                }
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full">
        <Button asChild className="w-full gap-2">
          <Link href="/">
            <ShoppingBag className="size-4" />
            Continue Shopping
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full gap-2">
          <Link href="/protected">
            My Orders
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
