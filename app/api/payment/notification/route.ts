import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string,
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
      signature_key,
    );

    if (!isValid) {
      console.warn("Invalid Midtrans signature for order:", midtransOrderId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Skip status update for expired transactions — keep order as awaiting_payment
    if (transaction_status === "expire") {
      console.log(`Order ${midtransOrderId} expired — skipping status update.`);
      return NextResponse.json({
        success: true,
        message: "Expire notification ignored",
      });
    }

    // Determine final order status
    let orderStatus: string = transaction_status;
    if (transaction_status === "capture") {
      orderStatus = fraud_status === "accept" ? "paid" : "failure";
    } else if (transaction_status === "settlement") {
      orderStatus = "paid";
    } else if (["cancel", "deny"].includes(transaction_status)) {
      orderStatus = transaction_status;
    } else if (transaction_status === "pending") {
      orderStatus = "awaiting_payment";
    }

    console.log(
      `Processing Midtrans notification for order: ${midtransOrderId}, status: ${transaction_status}`,
    );

    const supabase = createAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("orderId, userId, status")
      .eq("midtrans_order_id", midtransOrderId)
      .single();

    if (fetchError || !order) {
      console.error(
        "Order not found in database:",
        midtransOrderId,
        fetchError,
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Skip if already matching status to prevent duplicate processing
    if (order.status === orderStatus) {
      console.log(
        `Order ${midtransOrderId} is already in status: ${orderStatus}`,
      );
      return NextResponse.json({
        success: true,
        message: "Status already up to date",
      });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: orderStatus, updatedAt: new Date().toISOString() })
      .eq("midtrans_order_id", midtransOrderId);

    if (updateError) {
      console.error(
        `Failed to update order ${midtransOrderId} to ${orderStatus}:`,
        updateError,
      );
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log(
      `Successfully updated order ${midtransOrderId} status to: ${orderStatus}`,
    );

    // If payment failed or expired, release reserved stock and coupon usage
    const isFailedStatus = ["cancel", "deny", "expire", "failure"].includes(
      orderStatus,
    );
    if (isFailedStatus && order.status === "awaiting_payment") {
      console.log(`Releasing items for failed order: ${midtransOrderId}`);
      await supabase.rpc("release_order_items", { p_order_id: order.orderId });
    }

    // If paid, clear the cart items for this order's items
    if (orderStatus === "paid" || orderStatus === "settlement") {
      console.log(`Clearing cart for successful order: ${midtransOrderId}`);
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
