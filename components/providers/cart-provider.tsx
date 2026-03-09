"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image_url: string;
    organizations?: {
      orgId: string;
      orgName: string;
      slug: string;
    };
  };
  variant?: {
    name: string;
    price: number;
    stock: number;
    weight_grams: number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Memoize supabase client to prevent unnecessary effect re-runs
  const supabase = useMemo(() => createClient(), []);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bemlanja-cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Sync with LocalStorage whenever cartItems change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("bemlanja-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Sync with Database
  useEffect(() => {
    const fetchDbCart = async (userId: string) => {
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select(
            `
            id, productId, variantId, quantity,
            products ( name, price, image_url, organizations ( orgId, orgName, slug ) ),
            product_variants ( name, price, stock, weight_grams )
          `,
          )
          .eq("userId", userId);

        if (data && !error) {
          const dbItems: CartItem[] = data.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            product: Array.isArray(item.products)
              ? {
                  ...item.products[0],
                  organizations: Array.isArray(item.products[0]?.organizations)
                    ? item.products[0]?.organizations[0]
                    : item.products[0]?.organizations,
                }
              : {
                  ...item.products,
                  organizations: Array.isArray(item.products?.organizations)
                    ? item.products?.organizations[0]
                    : item.products?.organizations,
                },
            variant: Array.isArray(item.product_variants)
              ? item.product_variants[0]
              : item.product_variants,
          }));

          setCartItems(dbItems); // Overwrite local cart with DB cart
        }
      } catch (err) {
        console.error("Error fetching db cart:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // 1. Initial auth check
    const checkAuthAndFetch = async () => {
      if (isLoading) return; // Wait for local storage load first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await fetchDbCart(user.id);
      }
    };

    checkAuthAndFetch();

    // 2. Auth state subscription (handles logins mid-session)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // If user logs in, immediately overwrite guest cart with their DB cart
        fetchDbCart(session.user.id);
      } else if (event === "SIGNED_OUT") {
        // Clear cart on sign out
        setCartItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoading, supabase]);

  const addItem = useCallback(
    async (newItem: CartItem) => {
      // 1. Calculate the new total quantity for the item and respect stock limits
      const maxStock = newItem.variant?.stock ?? 0;
      const existingItem = cartItems.find(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId,
      );

      const currentInCart = existingItem?.quantity || 0;
      if (currentInCart >= maxStock) {
        toast.error("Maximum stock already in cart");
        return;
      }

      const totalQuantity = Math.min(
        currentInCart + newItem.quantity,
        maxStock,
      );
      const addedQuantity = totalQuantity - currentInCart;

      if (addedQuantity <= 0) {
        toast.error("Cannot add more items (stock reached)");
        return;
      }

      // 2. Update local state
      setCartItems((prev) => {
        const existingItemIndex = prev.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variantId === newItem.variantId,
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...prev];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: totalQuantity,
          };
          return updatedItems;
        }
        return [...prev, { ...newItem, quantity: addedQuantity }];
      });

      // 3. Sync to DB if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("cart_items").upsert(
          {
            userId: user.id,
            productId: newItem.productId,
            variantId: newItem.variantId,
            quantity: totalQuantity,
          },
          { onConflict: "userId,productId,variantId" },
        );

        if (error) {
          console.error(
            "Error syncing cart item to DB:",
            JSON.stringify(error, null, 2),
          );
        }
      }

      toast.success(
        addedQuantity < newItem.quantity
          ? `Added ${addedQuantity} to cart (stock limit reached)`
          : "Added to cart",
      );
    },
    [supabase, cartItems],
  );

  const removeItem = useCallback(
    async (productId: string, variantId?: string) => {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId),
        ),
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("cart_items")
          .delete()
          .match({ userId: user.id, productId, variantId });
      }
    },
    [supabase],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      // Find item to check stock
      const item = cartItems.find(
        (i) => i.productId === productId && i.variantId === variantId,
      );
      const maxStock = item?.variant?.stock ?? 0;

      const finalQuantity = Math.min(quantity, maxStock);

      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: finalQuantity }
            : item,
        ),
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("cart_items")
          .update({ quantity: finalQuantity })
          .match({ userId: user.id, productId, variantId });
      }
    },
    [removeItem, supabase, cartItems],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem("bemlanja-cart");
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const price = item.variant?.price ?? item.product?.price ?? 0;
        return acc + price * item.quantity;
      }, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        isSyncing,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
