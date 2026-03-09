"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartButton } from "./cart-button";

function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID", { minimumFractionDigits: 0 });
}

export function CartSheet() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart,
  } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          <CartButton />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full mobile:max-w-md p-0 gap-0 border-l border-border/40">
        <SheetHeader className="p-6 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Your Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {cartItems.length > 0 ? (
            <>
              <ScrollArea className="flex-1 px-6">
                <div className="flex flex-col gap-6 py-6">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "base"}`}
                      className="flex gap-4"
                    >
                      <div className="relative size-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                        <Image
                          src={item.product?.image_url || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex flex-col gap-0.5">
                          <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                            {item.product?.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">
                              Variant: {item.variant.name}
                            </p>
                          )}
                          <p className="text-sm font-medium text-foreground">
                            {formatRupiah(
                              item.variant?.price ?? item.product?.price ?? 0,
                            )}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                  item.variantId,
                                )
                              }
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="px-2 text-xs font-medium min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variantId,
                                )
                              }
                              disabled={
                                item.quantity >=
                                (item.variant?.stock ??
                                  item.product?.stock ??
                                  100)
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() =>
                              removeItem(item.productId, item.variantId)
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border/40 bg-muted/30 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Button className="w-full font-bold h-11" size="lg">
                    Checkout Now
                  </Button>
                  <Button
                    variant="link"
                    className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-foreground">
                  Your cart is empty
                </h3>
                <p className="text-sm text-muted-foreground px-8">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
              </div>
              <SheetTrigger asChild>
                <Button variant="outline" className="mt-2 text-sm">
                  Continue Shopping
                </Button>
              </SheetTrigger>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
