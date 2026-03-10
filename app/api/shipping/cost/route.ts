import { NextRequest, NextResponse } from "next/server";

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY!;
const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, weight, courier } = body;

    // Note: origin and destination are now District IDs
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, weight, courier" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      origin: String(origin),
      destination: String(destination),
      weight: String(weight),
      courier: String(courier),
      price: "lowest", // Recommended by RajaOngkir docs for optimal results
    });

    const response = await fetch(RAJAONGKIR_BASE_URL, {
      method: "POST",
      headers: {
        key: RAJAONGKIR_API_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RajaOngkir error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch shipping cost from RajaOngkir" },
        { status: response.status }
      );
    }

    const json = await response.json();
    console.log("RajaOngkir v2 Raw Response:", JSON.stringify(json, null, 2));
    const data = json.data ?? [];

    // The new response format returns an array of services directly
    const services = data.map((result: any) => ({
      courier: result.name,
      code: result.code,
      service: result.service,
      description: result.description,
      cost: result.cost,
      etd: result.etd ?? "-",
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Shipping cost route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
