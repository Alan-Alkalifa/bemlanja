"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const { cartCount } = useCart();

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 p-0 hover:bg-accent transition-colors relative"
        aria-label="View Cart"
      >
        <ShoppingCart className="size-5 text-foreground/90" />
        {cartCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold border-2 border-background rounded-full"
            variant="default"
          >
            {cartCount > 9 ? "9+" : cartCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
