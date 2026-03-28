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
    `?series_id=CPIAUCSL` +
    `&api_key=${apiKey}` +
    `&file_type=json` +
    `&sort_order=desc` +
    `&limit=36`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch inflation data from FRED" },
        { status: 500 }
      );
    }

    const json = await res.json();

    const rawData =
      json.observations
        ?.map((obs: { date: string; value: string }) => ({
          date: obs.date,
          value: Number(obs.value),
        }))
        .filter((d: { date: string; value: number }) => !Number.isNaN(d.value))
        .reverse() ?? [];

    const yoyData = rawData
      .map((current: { date: string; value: number }, index: number, arr: { date: string; value: number }[]) => {
        if (index < 12) return null;

        const prevYear = arr[index - 12].value;
        const yoy = ((current.value / prevYear) - 1) * 100;

        return {
          date: current.date,
          value: yoy,
        };
      })
      .filter((d: { date: string; value: number } | null): d is { date: string; value: number } => d !== null);

    return NextResponse.json(yoyData.slice(-24));
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while fetching inflation data" },
      { status: 500 }
    );
  }
}