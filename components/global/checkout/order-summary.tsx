"use client";

import Image from "next/image";
import { ShippingService } from "./shipping-selector";
import { AppliedCoupon } from "./coupon-input";
import { Receipt, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  selectedShipping: ShippingService | null;
  appliedCoupon: AppliedCoupon | null;
}

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

export function OrderSummary({
  items,
  selectedShipping,
  appliedCoupon,
}: OrderSummaryProps) {
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const shippingCost = selectedShipping?.cost ?? 0;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  return (
    <div className="flex flex-col gap-4">
      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const key = `${item.productId}-${item.variantId ?? "base"}-${idx}`;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="relative size-14 rounded-lg overflow-hidden bg-muted border border-border/40 shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Package className="size-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity} × {formatRupiah(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">
                {formatRupiah(item.unitPrice * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Pricing breakdown */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>

        {selectedShipping && (
          <div className="flex justify-between text-muted-foreground">
            <span>
              Shipping ({selectedShipping.code.toUpperCase()} {selectedShipping.service})
            </span>
            <span>{formatRupiah(shippingCost)}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between text-primary">
            <span>Coupon ({appliedCoupon.code})</span>
            <span>−{formatRupiah(discount)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-foreground" />
          <span className="font-bold text-foreground">Total</span>
        </div>
        <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
