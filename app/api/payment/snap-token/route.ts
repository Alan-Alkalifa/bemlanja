import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_SNAP_URL =
  "https://app.sandbox.midtrans.com/snap/v1/transactions";

interface CheckoutItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  weightGrams: number;
}

interface CheckoutPayload {
  addressId: string;
  orgId: string;
  couponId?: string;
  couponDiscount?: number;
  items: CheckoutItem[];
  shippingCourier: string;
  shippingService: string;
  shippingServiceDesc: string;
  shippingCost: number;
  shippingEtd: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: CheckoutPayload = await req.json();
    const {
      addressId,
      orgId,
      couponId,
      couponDiscount = 0,
      items,
      shippingCourier,
      shippingService,
      shippingServiceDesc,
      shippingCost,
      shippingEtd,
      notes,
    } = payload;

    if (!items?.length || !addressId || !orgId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    const total = Math.max(0, subtotal + shippingCost - couponDiscount);

    // Generate unique order ID
    const midtransOrderId = `BEMLANJA-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Fetch user profile for customer details
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("userId", user.id)
      .single();

    // Fetch address details
    const { data: address } = await supabase
      .from("user_addresses")
      .select(
        "recipient_name, phone, street_address, city_name, province_name, postal_code",
      )
      .eq("addressId", addressId)
      .eq("userId", user.id)
      .single();

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Atomically reserve stock and validate coupon
    const reserveItems = items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const { error: reserveError } = await supabase.rpc(
      "reserve_checkout_items",
      {
        p_items: reserveItems,
        p_coupon_id: couponId || null,
      },
    );

    if (reserveError) {
      console.error("Stock/Coupon reservation error:", reserveError);
      return NextResponse.json(
        {
          error: reserveError.message || "Insufficient stock or invalid coupon",
        },
        { status: 400 },
      );
    }

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        userId: user.id,
        addressId,
        orgId,
        couponId: couponId || null,
        status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        coupon_discount: couponDiscount,
        total,
        midtrans_order_id: midtransOrderId,
        notes: notes || null,
      })
      .select("orderId")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // Create order items
    const orderItemsData = items.map((item) => ({
      orderId: order.orderId,
      productId: item.productId,
      variantId: item.variantId || null,
      product_name: item.productName,
      variant_name: item.variantName || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
      weight_grams: item.weightGrams,
    }));

    await supabase.from("order_items").insert(orderItemsData);

    // Create order shipment record
    await supabase.from("order_shipments").insert({
      orderId: order.orderId,
      courier: shippingCourier,
      service: shippingService,
      service_desc: shippingServiceDesc,
      estimated_days: shippingEtd,
      cost: shippingCost,
    });

    // Build Midtrans item details
    const itemDetails = items.map((item) => ({
      id: item.variantId || item.productId,
      price: Math.round(item.unitPrice),
      quantity: item.quantity,
      name: item.variantName
        ? `${item.productName} - ${item.variantName}`
        : item.productName,
    }));

    // Add shipping as line item
    const safeCourierId = shippingCourier
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 15)
      .toUpperCase();
    const safeServiceId = shippingService
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 15)
      .toUpperCase();

    itemDetails.push({
      id: `SHIP-${safeCourierId}-${safeServiceId}`,
      price: Math.round(shippingCost),
      quantity: 1,
      name: `Shipping (${shippingCourier.toUpperCase()} ${shippingService})`.substring(
        0,
        50,
      ),
    });

    // Add coupon discount as negative line item
    if (couponDiscount > 0) {
      itemDetails.push({
        id: "COUPON-DISCOUNT",
        price: Math.round(-couponDiscount),
        quantity: 1,
        name: "Coupon Discount",
      });
    }

    // Call Midtrans Snap API
    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(total),
      },
      notification_url: `${new URL("/api/payment/notification", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")}`,
      item_details: itemDetails,
      customer_details: {
        first_name: profile?.full_name || address.recipient_name,
        email: profile?.email || user.email,
        phone: profile?.phone || address.phone,
        shipping_address: {
          first_name: address.recipient_name,
          phone: address.phone,
          address: address.street_address,
          city: address.city_name,
          postal_code: address.postal_code,
          country_code: "IDN",
        },
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected/orders/${order.orderId}`,
        unfinish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected/orders/${order.orderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected/orders/${order.orderId}`,
      },
    };

    const serverKey = MIDTRANS_SERVER_KEY.trim();
    const encodedKey = Buffer.from(serverKey + ":").toString("base64");

    const midtransResponse = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${encodedKey}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || midtransData.error_messages) {
      console.error("Midtrans error:", midtransData);

      // Rollback: cancel the order and release reserved stock/coupons
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("orderId", order.orderId);

      await supabase.rpc("release_order_items", { p_order_id: order.orderId });

      return NextResponse.json(
        {
          error:
            midtransData.error_messages?.join(", ") || "Payment gateway error",
        },
        { status: 500 },
      );
    }

    // Save snap token to order
    await supabase
      .from("orders")
      .update({
        midtrans_token: midtransData.token,
        snap_redirect_url: midtransData.redirect_url,
        status: "awaiting_payment",
      })
      .eq("orderId", order.orderId);

    return NextResponse.json({
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      orderId: order.orderId,
      midtransOrderId,
    });
  } catch (error) {
    console.error("Snap token route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
