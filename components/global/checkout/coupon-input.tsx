"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Tag, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AppliedCoupon {
  couponId: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  discountAmount: number;
}

interface CouponInputProps {
  orgId: string;
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

export function CouponInput({
  orgId,
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("coupons")
      .select(
        "couponId, code, discount_type, discount_value, min_purchase, max_uses, used_count, expires_at, is_active"
      )
      .eq("orgId", orgId)
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast.error("Invalid or expired coupon code");
      setLoading(false);
      return;
    }

    // Validate: expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This coupon has expired");
      setLoading(false);
      return;
    }

    // Validate: usage limit
    if (data.max_uses !== null && data.used_count >= data.max_uses) {
      toast.error("This coupon has reached its usage limit");
      setLoading(false);
      return;
    }

    // Validate: minimum purchase
    if (subtotal < data.min_purchase) {
      toast.error(
        `Minimum purchase of Rp ${data.min_purchase.toLocaleString("id-ID")} required for this coupon`
      );
      setLoading(false);
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.discount_type === "percentage") {
      discountAmount = Math.round((subtotal * data.discount_value) / 100);
    } else {
      discountAmount = Math.min(data.discount_value, subtotal);
    }

    onApply({
      couponId: data.couponId,
      code: data.code,
      discount_type: data.discount_type as "percentage" | "flat",
      discount_value: data.discount_value,
      discountAmount,
    });

    toast.success(`Coupon applied! Save Rp ${discountAmount.toLocaleString("id-ID")}`);
    setCode("");
    setLoading(false);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-primary">
              −Rp {appliedCoupon.discountAmount.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Enter coupon code"
          className="pl-9 uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
      </div>
      <Button onClick={handleApply} disabled={loading || !code.trim()} className="shrink-0">
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
