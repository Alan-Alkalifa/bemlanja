"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CartButton } from "./cart-button";
import { CartSkeleton } from "./cart-skeleton";


export function CartSheet() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart,
    isLoading,
    isSyncing,
  } = useCart();

  const router = useRouter();
  const pathname = usePathname();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const isCheckout = pathname.includes("/checkout");

  const toggleSelection = (itemId: string, orgId: string) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      
      // Auto-clear logic: if selecting from a new store, clear past selections
      if (selectedStore && selectedStore !== orgId && !newSelection.has(itemId)) {
        newSelection.clear();
        setSelectedStore(orgId);
      } else if (!selectedStore && !newSelection.has(itemId)) {
        setSelectedStore(orgId);
      }
      
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
        // If we just deselected the last item, clear the store tracking
        if (newSelection.size === 0) {
          setSelectedStore(null);
        }
      } else {
        newSelection.add(itemId);
      }
      
      return newSelection;
    });
  };

  const toggleStoreSelection = (orgId: string, itemIds: string[]) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      
      // Auto clear if switching stores
      if (selectedStore && selectedStore !== orgId) {
        newSelection.clear();
      }
      setSelectedStore(orgId);
      
      // Check if ALL are selected
      const allSelected = itemIds.length > 0 && itemIds.every(id => newSelection.has(id));
      
      if (allSelected) {
        // Deselect all
        itemIds.forEach(id => newSelection.delete(id));
        if (newSelection.size === 0) {
          setSelectedStore(null);
        }
      } else {
        // Select all
        itemIds.forEach(id => newSelection.add(id));
      }
      
      return newSelection;
    });
  };

  const checkoutTotal = useMemo(() => {
    return cartItems
      .filter(item => selectedItems.has(`${item.productId}-${item.variantId ?? "base"}`))
      .reduce((acc, item) => {
        const price = item.variant?.price ?? item.product?.price ?? 0;
        return acc + price * item.quantity;
      }, 0);
  }, [cartItems, selectedItems]);

  const handleCheckout = () => {
    if (selectedItems.size === 0) return;
    const itemKeys = Array.from(selectedItems).join(",");
    const orgId = selectedStore ?? "";
    setOpen(false);
    router.push(`/checkout?items=${encodeURIComponent(itemKeys)}&orgId=${encodeURIComponent(orgId)}`);
  };

  const groupedCartItems = useMemo(() => {
    const groups: Record<
      string,
      { orgId: string; orgName: string; slug?: string; items: typeof cartItems }
    > = {};
    
    cartItems.forEach((item) => {
      const org = item.product?.organizations;
      const orgId = org?.orgId || "unknown";
      
      if (!groups[orgId]) {
        groups[orgId] = {
          orgId,
          orgName: org?.orgName || "Unknown Store",
          slug: org?.slug,
          items: [],
        };
      }
      groups[orgId].items.push(item);
    });
    
    return Object.values(groups);
  }, [cartItems]);

  if (isCheckout) {
    return (
      <div className="opacity-50 cursor-not-allowed pointer-events-none">
        <CartButton />
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div onClick={() => setOpen(true)}>
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
          {isLoading || isSyncing ? (
            <CartSkeleton />
          ) : cartItems.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <div className="flex flex-col gap-6 py-6">
                  {groupedCartItems.map((group) => {
                    const groupItemIds = group.items.map(i => `${i.productId}-${i.variantId ?? "base"}`);
                    const isAllSelected = groupItemIds.length > 0 && groupItemIds.every(id => selectedItems.has(id));

                    return (
                    <div key={group.orgId} className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={() => toggleStoreSelection(group.orgId, groupItemIds)}
                        />
                        <Store className="size-4 text-muted-foreground" />
                        <span className="font-semibold text-sm text-foreground">
                          {group.orgName}
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {group.items.map((item) => {
                          const itemId = `${item.productId}-${item.variantId ?? "base"}`;
                          const isSelected = selectedItems.has(itemId);
                          return (
                          <div
                            key={itemId}
                            className="flex items-center gap-3"
                          >
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(itemId, group.orgId)}
                            />
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
                                      (item.variant?.stock ?? 0)
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
                          );
                        })}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-border/40 bg-muted/30 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatRupiah(checkoutTotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Button 
                    className="w-full font-bold h-11" 
                    size="lg"
                    disabled={selectedItems.size === 0}
                    onClick={handleCheckout}
                  >
                    Checkout Now ({selectedItems.size})
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
