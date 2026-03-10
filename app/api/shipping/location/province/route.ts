import { NextResponse } from "next/server";

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination/province";

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "RajaOngkir API Key is missing" }, { status: 500 });
    }

    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        key: API_KEY,
      },
      next: { revalidate: 86400 }, // Cache for 24 hours as provinces rarely change
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `RajaOngkir API error: ${res.status} ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching provinces" },
      { status: 500 }
    );
  }
}
