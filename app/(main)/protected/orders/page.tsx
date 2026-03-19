"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrdersListSkeleton } from "@/components/global/orders/orders-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

type OrderStatus =
  | "all"
  | "awaiting_payment"
  | "processing"
  | "completed"
  | "cancelled";

const STATUS_TABS: { key: OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function resolveCategory(status: string): OrderStatus {
  if (["awaiting_payment", "pending"].includes(status))
    return "awaiting_payment";
  if (["paid", "settlement", "processing"].includes(status))
    return "processing";
  if (["success", "completed"].includes(status)) return "completed";
  if (["cancelled", "expire", "failure", "deny", "cancel"].includes(status))
    return "cancelled";
  return "all";
}

function StatusBadge({ status }: { status: string }) {
  const category = resolveCategory(status);

  if (category === "awaiting_payment") {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1.5"
      >
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-yellow-500" />
        </span>
        Awaiting Payment
      </Badge>
    );
  }
  if (category === "processing") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 gap-1.5">
        <span className="size-2 rounded-full bg-blue-500 inline-block" />
        Processing
      </Badge>
    );
  }
  if (category === "completed") {
    return (
      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 gap-1.5">
        <span className="size-2 rounded-full bg-green-500 inline-block" />
        Completed
      </Badge>
    );
  }
  if (category === "cancelled") {
    return (
      <Badge
        variant="destructive"
        className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 gap-1.5"
      >
        <span className="size-2 rounded-full bg-red-500 inline-block" />
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function leftBorderClass(status: string) {
  const cat = resolveCategory(status);
  if (cat === "awaiting_payment") return "border-l-yellow-400";
  if (cat === "processing") return "border-l-blue-500";
  if (cat === "completed") return "border-l-green-500";
  if (cat === "cancelled") return "border-l-red-400";
  return "border-l-border";
}

function StatusIcon({ status }: { status: string }) {
  const cat = resolveCategory(status);
  if (cat === "awaiting_payment")
    return <Clock className="size-4 text-yellow-500" />;
  if (cat === "processing") return <Package className="size-4 text-blue-500" />;
  if (cat === "completed")
    return <CheckCircle2 className="size-4 text-green-500" />;
  if (cat === "cancelled") return <XCircle className="size-4 text-red-400" />;
  return <Package className="size-4 text-muted-foreground" />;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        window.location.href = "/auth/login?next=/protected/orders";
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select(
          `orderId, status, total, createdAt, midtrans_order_id,
          organizations ( orgName ),
          order_items ( orderItemId )`,
        )
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => resolveCategory(o.status) === activeTab);

  const countFor = (tab: OrderStatus) =>
    tab === "all"
      ? orders.length
      : orders.filter((o) => resolveCategory(o.status) === tab).length;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function handleTabChange(tab: OrderStatus) {
    startTransition(() => {
      setActiveTab(tab);
      setCurrentPage(1);
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
          <Package className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your purchases
          </p>
        </div>
      </div>

      {/* Filter Tabs — card style */}
      {orders.length > 0 && (
        <div className="flex gap-1.5 mb-6 bg-muted/60 p-1 rounded-xl overflow-x-auto no-scrollbar border border-border/30">
          {STATUS_TABS.map((tab) => {
            const count = countFor(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-5 text-center",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <OrdersListSkeleton />
      ) : filtered.length === 0 && orders.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="size-20 rounded-2xl bg-muted flex items-center justify-center mb-5 text-4xl">
            🛍️
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No orders yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            When you place an order, it will appear here. Start exploring our
            marketplace!
          </p>
          <Button asChild>
            <Link href="/" className="gap-2">
              Browse Products <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty tab state */
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="size-14 rounded-xl bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="size-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No orders in this category
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((order: any) => {
            const org = Array.isArray(order.organizations)
              ? order.organizations[0]
              : order.organizations;
            const orgName = org?.orgName ?? "Unknown Store";
            const itemCount = Array.isArray(order.order_items)
              ? order.order_items.length
              : order.order_items
                ? 1
                : 0;

            return (
              <Link
                key={order.orderId}
                href={`/protected/orders/${order.orderId}`}
                className={cn(
                  "group flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                  "p-5 bg-card border-l-4 border border-border/40",
                  "hover:border-primary/30 hover:shadow-md transition-all duration-200 rounded-2xl",
                  leftBorderClass(order.status),
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    <StatusIcon status={order.status} />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">
                        {orgName}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>
                        {format(
                          new Date(order.createdAt),
                          "MMM d, yyyy • HH:mm",
                        )}
                      </span>
                      <span className="text-border">•</span>
                      <span>
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </span>
                      <span className="text-border hidden sm:inline">•</span>
                      <span className="font-mono text-xs hidden sm:inline">
                        {order.midtrans_order_id ??
                          order.orderId.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 pl-13 sm:pl-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs text-muted-foreground mb-0.5">
                      Total
                    </span>
                    <span className="font-bold text-foreground">
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="size-9 rounded-full bg-muted/50 flex shrink-0 items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;
                  const showEllipsisBefore = page === currentPage - 2 && page > 2;
                  const showEllipsisAfter = page === currentPage + 2 && page < totalPages - 1;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  if (!showPage) return null;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
