import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = "https://rajaongkir.komerce.id/api/v1/destination/sub-district";

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "RajaOngkir API Key is missing" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("district_id");

    if (!districtId) {
      return NextResponse.json({ error: "Missing district_id parameter" }, { status: 400 });
    }

    // Notice: subdistrict uses a path parameter for district_id according to the docs
    const url = `${BASE_URL}/${districtId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        key: API_KEY, // RajaOngkir docs specify uppercase 'Key' but lowercase usually works in HTTP headers
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
    console.error("Error fetching subdistricts:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching subdistricts" },
      { status: 500 }
    );
  }
}
