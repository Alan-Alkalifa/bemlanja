"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/providers/cart-provider";
import { toast } from "sonner";
import { AddressSelector, UserAddress } from "@/components/global/checkout/address-selector";
import { ShippingSelector, ShippingService } from "@/components/global/checkout/shipping-selector";
import { CouponInput, AppliedCoupon } from "@/components/global/checkout/coupon-input";
import { OrderSummary } from "@/components/global/checkout/order-summary";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Truck,
  Tag,
  ShoppingBag,
  Store,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

function SectionCard({
  icon: Icon,
  title,
  children,
  step,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  step: number;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
          {step}
        </div>
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cartItems, removeItem } = useCart();
  const supabase = useMemo(() => createClient(), []);

  // Parse selected items from URL
  const selectedItemKeys = useMemo(() => {
    const raw = searchParams.get("items") ?? "";
    return new Set(raw.split(",").filter(Boolean));
  }, [searchParams]);

  const orgId = searchParams.get("orgId") ?? "";

  // Resolve selected cart items
  const selectedItems = useMemo(
    () =>
      cartItems.filter((item) => {
        const key = `${item.productId}-${item.variantId ?? "base"}`;
        return selectedItemKeys.has(key);
      }),
    [cartItems, selectedItemKeys]
  );

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingService | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [notes, setNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDistrictId, setOrgDistrictId] = useState<string | null>(null);
  const [snapReady, setSnapReady] = useState(false);

  // Totals
  const subtotal = useMemo(
    () =>
      selectedItems.reduce((acc, item) => {
        const price = item.variant?.price ?? item.product?.price ?? 0;
        return acc + price * item.quantity;
      }, 0),
    [selectedItems]
  );

  const totalWeightGrams = useMemo(
    () =>
      selectedItems.reduce(
        (acc, item) => acc + (item.variant?.weight_grams ?? 0) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const discount = appliedCoupon?.discountAmount ?? 0;
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  // Fetch addresses + org info + auth check
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?next=/checkout");
        return;
      }

      const [addrRes, orgRes] = await Promise.all([
        supabase
          .from("user_addresses")
          .select("*")
          .eq("userId", user.id)
          .is("deleted_at", null)
          .order("is_default", { ascending: false }),
        supabase
          .from("organizations")
          .select("orgName, district_id")
          .eq("orgId", orgId)
          .single(),
      ]);

      if (addrRes.data) {
        setAddresses(addrRes.data as UserAddress[]);
        const def = addrRes.data.find((a: UserAddress) => a.is_default);
        if (def) setSelectedAddress(def as UserAddress);
      }

      if (orgRes.data) {
        setOrgName(orgRes.data.orgName);
        setOrgDistrictId(orgRes.data.district_id);
      }
    };
    if (orgId) load();
  }, [supabase, orgId]);

  // Reset shipping when address changes
  useEffect(() => {
    setSelectedShipping(null);
  }, [selectedAddress]);

  const summaryItems = useMemo(
    () =>
      selectedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product?.name ?? "Product",
        variantName: item.variant?.name,
        imageUrl: item.product?.image_url,
        quantity: item.quantity,
        unitPrice: item.variant?.price ?? item.product?.price ?? 0,
      })),
    [selectedItems]
  );

  const handlePay = async () => {
    if (!selectedAddress) { toast.error("Please select a shipping address"); return; }
    if (!selectedShipping) { toast.error("Please select a shipping method"); return; }
    if (selectedItems.length === 0) { toast.error("No items selected"); return; }

    setPaying(true);

    try {
      const payload = {
        addressId: selectedAddress.addressId,
        orgId,
        couponId: appliedCoupon?.couponId,
        couponDiscount: appliedCoupon?.discountAmount ?? 0,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product?.name ?? "Product",
          variantName: item.variant?.name,
          quantity: item.quantity,
          unitPrice: item.variant?.price ?? item.product?.price ?? 0,
          weightGrams: item.variant?.weight_grams ?? 0,
        })),
        shippingCourier: selectedShipping.courier,
        shippingService: selectedShipping.service,
        shippingServiceDesc: selectedShipping.description,
        shippingCost: selectedShipping.cost,
        shippingEtd: selectedShipping.etd,
        notes: notes || undefined,
      };

      const res = await fetch("/api/payment/snap-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to initiate payment");
        setPaying(false);
        return;
      }

      const cleanupAndRedirect = (url: string) => {
        // Remove only the checked-out items
        selectedItems.forEach(item => {
          removeItem(item.productId, item.variantId);
        });
        router.push(url);
      };

      // Open Midtrans Snap popup
      if (!snapReady || !window.snap) {
        toast.error("Payment gateway not ready. Please wait a moment and try again.");
        setPaying(false);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => {
          cleanupAndRedirect(`/checkout/success?order_id=${data.midtransOrderId}`);
        },
        onPending: () => {
          toast.info("Payment pending. We'll notify you when confirmed.");
          cleanupAndRedirect(`/checkout/success?order_id=${data.midtransOrderId}&status=pending`);
        },
        onError: () => {
          toast.error("Payment failed.");
          cleanupAndRedirect("/protected");
        },
        onClose: () => {
          cleanupAndRedirect("/protected");
        },
      });
    } catch (e) {
      console.error("Payment error:", e);
      toast.error("An error occurred. Please try again.");
      setPaying(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-8">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-lg">No items selected</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Go back to your cart and select items to checkout.
          </p>
        </div>
        <Button onClick={() => router.push("/")}>Back to Shopping</Button>
      </div>
    );
  }

  return (
    <>
      {/* Load Midtrans Snap */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => {
          console.log("Midtrans script loaded");
          setSnapReady(true);
        }}
        onError={(e) => {
          console.error("Failed to load Midtrans script", e);
          toast.error("Failed to load payment gateway. Please check your internet connection.");
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <ShoppingBag className="size-4" />
          <span>Cart</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6 items-start">
          {/* Left column — steps */}
          <div className="laptop:col-span-2 flex flex-col gap-4">
            {/* Store info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <Store className="size-4" />
              <span>Ordering from</span>
              <span className="font-semibold text-foreground">{orgName || "Store"}</span>
            </div>

            {/* Step 1: Address */}
            <SectionCard icon={MapPin} title="Shipping Address" step={1}>
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddress?.addressId ?? null}
                onSelect={setSelectedAddress}
                onAddressAdded={(addr) => {
                  setAddresses((prev) => [addr, ...prev]);
                  setSelectedAddress(addr);
                }}
              />
            </SectionCard>

            {/* Step 2: Shipping method */}
            <SectionCard icon={Truck} title="Delivery Method" step={2}>
              {!selectedAddress ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select an address first to see shipping options.
                </p>
              ) : (
                <ShippingSelector
                  originDistrictId={orgDistrictId}
                  destinationDistrictId={selectedAddress.district_id}
                  totalWeightGrams={totalWeightGrams || 1000}
                  selectedService={selectedShipping}
                  onSelect={setSelectedShipping}
                />
              )}
            </SectionCard>

            {/* Step 3: Coupon */}
            <SectionCard icon={Tag} title="Coupon" step={3}>
              <CouponInput
                orgId={orgId}
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                onApply={setAppliedCoupon}
                onRemove={() => setAppliedCoupon(null)}
              />
            </SectionCard>

            {/* Notes */}
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <label className="text-sm font-semibold text-foreground block mb-2">
                Order Notes (optional)
              </label>
              <textarea
                className="w-full text-sm bg-input border border-border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-foreground placeholder:text-muted-foreground"
                rows={3}
                placeholder="Special instructions for the seller..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right column — summary */}
          <div className="flex flex-col gap-4 laptop:sticky laptop:top-24">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-border/40">
                <ShoppingBag className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Order Summary</h2>
              </div>
              <div className="p-4">
                <OrderSummary
                  items={summaryItems}
                  selectedShipping={selectedShipping}
                  appliedCoupon={appliedCoupon}
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-base font-bold gap-2"
              onClick={handlePay}
              disabled={paying || !selectedAddress || !selectedShipping}
            >
              {paying ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay Rp {total.toLocaleString("id-ID")}
                  <ChevronRight className="size-5" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secured by{" "}
              <span className="font-semibold text-foreground">Midtrans</span> · Your
              payment is encrypted
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
