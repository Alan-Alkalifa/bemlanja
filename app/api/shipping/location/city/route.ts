import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination/city";

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "RajaOngkir API Key is missing" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const provinceId = searchParams.get("province_id");

    if (!provinceId) {
      return NextResponse.json({ error: "Missing province_id parameter" }, { status: 400 });
    }

    const url = `${BASE_URL}/${provinceId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        key: API_KEY,
      },
      next: { revalidate: 86400 }, // Cache for 24H
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
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching cities" },
      { status: 500 }
    );
  }
}
