"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";

export interface ProductVariant {
  variantId: string;
  name: string;
  price: number;
  stock: number;
  weight_grams: number;
}

interface ProductDetailClientProps {
  productId: string;
  name: string;
  imageUrl: string;
  variants: ProductVariant[];
  basePrice: number;
  organization?: {
    orgId: string;
    orgName: string;
    slug: string;
  };
}

function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID", { minimumFractionDigits: 0 });
}

export function ProductDetailClient({
  productId,
  name,
  imageUrl,
  variants,
  basePrice,
  organization,
}: ProductDetailClientProps) {
  const hasVariants = variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? variants[0] : null,
  );
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const currentPrice = selectedVariant?.price ?? basePrice;
  const currentStock = selectedVariant?.stock ?? 0;

  function increment() {
    setQty((q) => Math.min(q + 1, currentStock));
  }
  function decrement() {
    setQty((q) => Math.max(1, q - 1));
  }
  function handleVariantSelect(v: ProductVariant) {
    setSelectedVariant(v);
    setQty(1);
  }

  function handleAddToCart() {
    addItem({
      productId,
      variantId: selectedVariant?.variantId,
      quantity: qty,
      product: {
        name,
        price: basePrice,
        image_url: imageUrl,
        organizations: organization,
      },
      variant: selectedVariant
        ? {
            name: selectedVariant.name,
            price: selectedVariant.price,
            stock: selectedVariant.stock,
            weight_grams: selectedVariant.weight_grams,
          }
        : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      <p className="text-3xl font-bold text-foreground tracking-tight">
        {formatRupiah(currentPrice)}
      </p>

      {/* Variant Selector */}
      {hasVariants && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Select Variant
            </span>
            <span className="text-sm text-muted-foreground">
              Stock: {currentStock} units
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <Button
                key={v.variantId}
                variant={
                  selectedVariant?.variantId === v.variantId
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleVariantSelect(v)}
                disabled={v.stock === 0}
                className={cn(
                  "px-4 py-2 h-auto font-medium transition-all",
                  v.stock === 0 && "opacity-40 cursor-not-allowed line-through",
                )}
              >
                {v.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Stock (no variants case) */}
      {!hasVariants && (
        <p className="text-sm text-muted-foreground">
          Stock:{" "}
          <span className="font-medium text-foreground">
            {currentStock} units
          </span>
        </p>
      )}

      {/* Quantity + Subtotal */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrement}
            disabled={qty <= 1}
            className="h-10 w-10 rounded-none hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>
          <span className="px-4 py-2 min-w-12 text-center text-sm font-medium select-none border-x border-border">
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={increment}
            disabled={qty >= currentStock}
            className="h-10 w-10 rounded-none hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Subtotal:{" "}
          <span className="font-semibold text-foreground">
            {formatRupiah(currentPrice * qty)}
          </span>
        </p>
      </div>

      {/* Add to Cart */}
      <Button
        size="lg"
        className="w-full gap-2 text-base font-semibold"
        disabled={currentStock === 0}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="size-5" />
        {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
