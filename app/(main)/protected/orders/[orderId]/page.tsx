import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  PackageCheck,
  Truck,
  MapPin,
  AlertCircle,
  ReceiptText,
  Clock,
  CreditCard,
  CheckCircle2,
  Package,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderPaymentButton } from "@/components/global/orders/order-payment-button";
import { Metadata } from "next";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

import { OrderDetailSkeleton } from "@/components/global/orders/orders-skeleton";

export const metadata: Metadata = {
  title: "Order Details | Bemlanja",
};

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailsContent params={params} />
    </Suspense>
  );
}

// ── Status helpers ──────────────────────────────────────────────────────────

type StatusCategory =
  | "awaiting_payment"
  | "processing"
  | "completed"
  | "cancelled"
  | "other";

function resolveCategory(status: string): StatusCategory {
  if (["awaiting_payment", "pending"].includes(status))
    return "awaiting_payment";
  if (["paid", "settlement", "processing"].includes(status))
    return "processing";
  if (["success", "completed"].includes(status)) return "completed";
  if (["cancelled", "expire", "failure", "deny", "cancel"].includes(status))
    return "cancelled";
  return "other";
}

function StatusBadge({ status }: { status: string }) {
  const cat = resolveCategory(status);
  const map: Record<
    StatusCategory,
    { label: string; cls: string; dot: string }
  > = {
    awaiting_payment: {
      label: "Awaiting Payment",
      cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      dot: "bg-yellow-500",
    },
    processing: {
      label: "Processing",
      cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
      dot: "bg-blue-500",
    },
    completed: {
      label: "Completed",
      cls: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
      dot: "bg-green-500",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      dot: "bg-red-400",
    },
    other: {
      label: status.replace(/_/g, " "),
      cls: "",
      dot: "bg-muted-foreground",
    },
  };
  const cfg = map[cat];
  return (
    <Badge variant="secondary" className={cn("gap-1.5 capitalize", cfg.cls)}>
      <span className={cn("size-2 rounded-full inline-block", cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

// ── Order Timeline ──────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: "placed", label: "Order Placed", Icon: Clock },
  { key: "paid", label: "Payment", Icon: CreditCard },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: CheckCircle2 },
];

function getActiveStep(status: string): number {
  const cat = resolveCategory(status);
  if (cat === "awaiting_payment") return 0;
  if (cat === "processing") return 1;
  if (cat === "completed") return 3;
  if (cat === "cancelled") return -1;
  return 0;
}

function OrderTimeline({ status }: { status: string }) {
  const activeStep = getActiveStep(status);
  const isCancelled = resolveCategory(status) === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
        <AlertCircle className="size-4 shrink-0" />
        <span className="font-medium">This order has been cancelled.</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between w-full px-4 py-2">
      {TIMELINE_STEPS.map((step, i) => {
        const isCompleted = i < activeStep;
        const isActive = i === activeStep;
        const Icon = step.Icon;
        return (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* connector line */}
            {i > 0 && (
              <div
                className={cn(
                  "absolute top-5 right-1/2 w-full h-px -translate-y-1/2",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
            {/* circle */}
            <div
              className={cn(
                "relative z-10 size-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : isActive
                    ? "bg-background border-primary text-primary shadow-sm shadow-primary/20"
                    : "bg-background border-border text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center leading-tight",
                isActive
                  ? "text-primary"
                  : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

async function OrderDetailsContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/protected/orders/${orderId}`);
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      `*, organizations ( orgName, orgEmail ), order_items ( * ), order_shipments ( * )`,
    )
    .eq("orderId", orderId)
    .eq("userId", user.id)
    .single();

  if (!order) notFound();

  const { data: address } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("addressId", order.addressId)
    .single();

  const org = Array.isArray(order.organizations)
    ? order.organizations[0]
    : order.organizations;
  const shipment = Array.isArray(order.order_shipments)
    ? order.order_shipments[0]
    : order.order_shipments;
  const items = Array.isArray(order.order_items)
    ? order.order_items
    : [order.order_items].filter(Boolean);

  // Fetch product images via product_images relation
  const productIds = [
    ...new Set(items.map((i: any) => i.productId).filter(Boolean)),
  ];
  const productImageMap: Record<string, string> = {};
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("productId, image_url, product_images ( url, sort_order )")
      .in("productId", productIds);
    for (const p of products ?? []) {
      const imgs: { url: string; sort_order: number }[] = Array.isArray(
        p.product_images,
      )
        ? [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)
        : [];
      // prefer second image (index 1), fall back to first, then image_url
      const imgUrl = imgs[1]?.url ?? imgs[0]?.url ?? p.image_url ?? null;
      if (imgUrl) productImageMap[p.productId] = imgUrl;
    }
  }

  const isAwaitingPayment =
    order.status === "awaiting_payment" || order.status === "pending";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 laptop:px-8 py-8 min-h-[70vh]">
      {/* Back */}
      <Link
        href="/protected/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      {/* ── Awaiting Payment Banner ── */}
      {isAwaitingPayment && order.midtrans_token && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 bg-yellow-500/5 border border-yellow-500/25 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="size-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Payment Pending</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Complete your payment to confirm this order.
              </p>
            </div>
          </div>
          <OrderPaymentButton token={order.midtrans_token} orderId={orderId} />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Order #
            {order.midtrans_order_id ?? orderId.slice(0, 8).toUpperCase()}
          </h1>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Placed on{" "}
              {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </span>
            <span className="text-border">•</span>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Pay Now only shown in header if no banner (i.e. no token) */}
        {isAwaitingPayment && !order.midtrans_token && (
          <OrderPaymentButton token={order.midtrans_token} orderId={orderId} />
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6">
        <OrderTimeline status={order.status} />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Items + Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <PackageCheck className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">
                Items from {org?.orgName ?? "Store"}
              </h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {items.map((item: any) => (
                <div
                  key={item.orderItemId}
                  className="flex gap-4 p-4 border border-border/30 rounded-xl bg-background/50 hover:bg-muted/20 transition-colors"
                >
                  {/* Product image / fallback */}
                  <div className="size-14 rounded-xl bg-muted/60 border border-border/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {productImageMap[item.productId] ? (
                      <Image
                        src={productImageMap[item.productId]}
                        alt={item.product_name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-muted-foreground mt-0.5 bg-muted/60 rounded px-1.5 py-0.5 w-fit">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="bg-muted/50 text-foreground font-medium rounded px-1.5 py-0.5 text-xs mr-1.5">
                        ×{item.quantity}
                      </span>
                      Rp {Number(item.unit_price).toLocaleString("id-ID")} each
                    </p>
                  </div>
                  <div className="font-semibold text-foreground text-right flex flex-col justify-center shrink-0">
                    Rp {Number(item.subtotal).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <ReceiptText className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">Order Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({items.length} items)
                </span>
                <span className="font-medium text-foreground">
                  Rp {Number(order.subtotal).toLocaleString("id-ID")}
                </span>
              </div>

              {Number(order.coupon_discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">
                    − Rp {Number(order.coupon_discount).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Shipping{" "}
                  {shipment
                    ? `(${shipment.courier?.toUpperCase()} ${shipment.service})`
                    : ""}
                </span>
                <span className="font-medium text-foreground">
                  Rp {Number(order.shipping_cost).toLocaleString("id-ID")}
                </span>
              </div>

              <Separator className="my-1" />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  Rp {Number(order.total).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shipping + Address + Notes */}
        <div className="space-y-5">
          {/* Shipping Details */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2.5">
              <Truck className="size-4 text-green-600" />
              <h2 className="font-semibold text-sm text-foreground">
                Shipping Details
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {shipment ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Courier Service
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {shipment.courier?.toUpperCase()} {shipment.service}
                    </p>
                    {shipment.service_desc && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shipment.service_desc}
                      </p>
                    )}
                  </div>
                  {shipment.estimated_days && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Est. Delivery
                      </p>
                      <p className="text-sm text-foreground">
                        {shipment.estimated_days}
                      </p>
                    </div>
                  )}
                  {shipment.tracking_number && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Tracking Number
                      </p>
                      <p className="text-sm font-mono text-primary bg-primary/10 w-fit px-2 py-1 rounded-lg border border-primary/20">
                        {shipment.tracking_number}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Shipping details unavailable.
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2.5">
              <MapPin className="size-4 text-blue-600" />
              <h2 className="font-semibold text-sm text-foreground">
                Delivery Address
              </h2>
            </div>
            <div className="p-4">
              {address ? (
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">
                    {address.recipient_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.phone}
                  </p>
                  <Separator className="my-2" />
                  <p className="text-sm text-foreground font-medium">
                    {address.street_address}
                  </p>
                  {(address.subdistrict_name || address.district_name) && (
                    <p className="text-sm text-muted-foreground">
                      {[address.subdistrict_name, address.district_name]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {address.city_name}, {address.province_name}{" "}
                    {address.postal_code}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="size-4" />
                  <span className="text-sm">
                    Address information unavailable.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex items-center gap-2.5">
                <MessageSquare className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm text-foreground">
                  Order Notes
                </h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-foreground italic bg-muted/50 p-3 rounded-xl border border-border/50 leading-relaxed">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
