"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OrderPaymentButton({
  token,
  orderId,
}: {
  token: string;
  orderId: string;
}) {
  const [paying, setPaying] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const router = useRouter();

  const handlePay = () => {
    if (!snapReady || !window.snap) {
      toast.error("Payment gateway is still loading. Please wait a moment.");
      return;
    }

    setPaying(true);

    window.snap.pay(token, {
      onSuccess: () => {
        toast.success("Payment successful!");
        router.refresh();
      },
      onPending: () => {
        toast.info("Payment pending. Please complete your payment.");
        router.refresh();
      },
      onError: () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      },
      onClose: () => {
        toast("Payment window closed.");
        setPaying(false);
      },
    });
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => setSnapReady(true)}
        onReady={() => setSnapReady(true)}
        onError={() => toast.error("Failed to load payment gateway.")}
      />
      <Button
        size="lg"
        className="w-full sm:w-auto gap-2 font-bold relative overflow-hidden"
        onClick={handlePay}
        disabled={paying || !snapReady}
        title={!snapReady ? "Loading payment gateway…" : undefined}
      >
        {/* shimmer overlay while snap is loading */}
        {!snapReady && !paying && (
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
        )}
        {paying ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard className="size-4" />
            {!snapReady ? "Loading…" : "Pay Now"}
          </>
        )}
      </Button>
    </>
  );
}
