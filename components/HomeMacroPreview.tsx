"use client";

import { useEffect, useState } from "react";

type Point = {
  date: string;
  value: number;
};

function getLatestAndChange(data: Point[]) {
  if (data.length < 2) {
    return { latest: null as number | null, change: null as number | null };
  }

  const latest = data[data.length - 1].value;
  const prev = data[data.length - 2].value;

  return {
    latest,
    change: latest - prev,
  };
}

function classifyEconomy(
  inflation: number | null,
  unemployment: number | null
) {
  if (inflation === null || unemployment === null) return "No data";
  if (inflation > 3 && unemployment < 4) return "Overheating";
  if (inflation > 3 && unemployment >= 4) return "Stagflation";
  if (inflation <= 3 && unemployment >= 4.5) return "Weak Demand";
  return "Soft Landing";
}

function getChangeColor(change: number | null) {
  if (change === null) return "text-gray-400";
  if (change === 0) return "text-gray-400";
  if (change > 0) return "text-red-400";
  return "text-green-400";
}

export default function HomeMacroPreview() {
  const [unemployment, setUnemployment] = useState<Point[]>([]);
  const [inflation, setInflation] = useState<Point[]>([]);
  const [fedRate, setFedRate] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [uRes, iRes, fRes] = await Promise.all([
          fetch("/api/unemployment"),
          fetch("/api/inflation"),
          fetch("/api/fed-rate"),
        ]);

        const [uJson, iJson, fJson] = await Promise.all([
          uRes.json(),
          iRes.json(),
          fRes.json(),
        ]);

        setUnemployment(Array.isArray(uJson) ? uJson : []);
        setInflation(Array.isArray(iJson) ? iJson : []);
        setFedRate(Array.isArray(fJson) ? fJson : []);
      } catch (error) {
        console.error("Failed to load homepage macro preview:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const u = getLatestAndChange(unemployment);
  const i = getLatestAndChange(inflation);
  const f = getLatestAndChange(fedRate);

  const regime = classifyEconomy(i.latest, u.latest);

  return (
    <div className="mt-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">Unemployment</p>
          <p className="mt-2 text-2xl font-bold">
            {loading || u.latest === null ? "..." : `${u.latest.toFixed(1)}%`}
          </p>
          <p className={`text-sm ${getChangeColor(u.change)}`}>
            {u.change === null ? "" : `${u.change > 0 ? "+" : ""}${u.change.toFixed(1)} pp`}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">Inflation</p>
          <p className="mt-2 text-2xl font-bold">
            {loading || i.latest === null ? "..." : `${i.latest.toFixed(1)}%`}
          </p>
          <p className={`text-sm ${getChangeColor(i.change)}`}>
            {i.change === null ? "" : `${i.change > 0 ? "+" : ""}${i.change.toFixed(1)} pp`}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">Fed Funds Rate</p>
          <p className="mt-2 text-2xl font-bold">
            {loading || f.latest === null ? "..." : `${f.latest.toFixed(2)}%`}
          </p>
          <p className={`text-sm ${getChangeColor(f.change)}`}>
            {f.change === null ? "" : `${f.change > 0 ? "+" : ""}${f.change.toFixed(2)} pp`}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-4">
        <p className="text-sm text-gray-400">Macro Regime</p>
        <p className="mt-2 text-xl font-semibold">{regime}</p>
      </div>
    </div>
  );
}