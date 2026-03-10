import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return hash === receivedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id: midtransOrderId,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    const isValid = verifyMidtransSignature(
      midtransOrderId,
      status_code,
      gross_amount,
      MIDTRANS_SERVER_KEY,
      signature_key
    );

    if (!isValid) {
      console.warn("Invalid Midtrans signature for order:", midtransOrderId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Determine final order status
    let orderStatus: string = transaction_status;
    if (transaction_status === "capture") {
      orderStatus = fraud_status === "accept" ? "paid" : "failure";
    } else if (transaction_status === "settlement") {
      orderStatus = "paid";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      orderStatus = transaction_status;
    } else if (transaction_status === "pending") {
      orderStatus = "awaiting_payment";
    }

    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("orderId, userId, status")
      .eq("midtrans_order_id", midtransOrderId)
      .single();

    if (fetchError || !order) {
      console.error("Order not found:", midtransOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    await supabase
      .from("orders")
      .update({ status: orderStatus, updatedAt: new Date().toISOString() })
      .eq("midtrans_order_id", midtransOrderId);

    // If paid, clear the cart items for this order's items
    if (orderStatus === "paid" || orderStatus === "settlement") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("productId, variantId")
        .eq("orderId", order.orderId);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await supabase
            .from("cart_items")
            .delete()
            .match({
              userId: order.userId,
              productId: item.productId,
              ...(item.variantId ? { variantId: item.variantId } : {}),
            });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans notification handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
