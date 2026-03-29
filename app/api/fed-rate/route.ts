import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing FRED_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=FEDFUNDS` +
    `&api_key=${apiKey}` +
    `&file_type=json` +
    `&sort_order=desc` +
    `&limit=24`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Fed rate data from FRED" },
        { status: 500 }
      );
    }

    const json = await res.json();

    const data =
      json.observations
        ?.map((obs: { date: string; value: string }) => ({
          date: obs.date,
          value: Number(obs.value),
        }))
        .filter((d: { date: string; value: number }) => !Number.isNaN(d.value))
        .reverse() ?? [];

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while fetching Fed rate data" },
      { status: 500 }
    );
  }
}