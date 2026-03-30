"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type Point = {
  date: string;
  value: number;
};

type ChartRow = {
  date: string;
  label: string;
  inflation?: number;
  unemployment?: number;
  gdpGrowth?: number;
  fedFunds?: number;
};

function normalizeSeries(data: Point[]) {
  if (!data.length) return [];

  const base = data[0].value;
  if (base === 0) {
    return data.map((d) => ({ ...d, normalized: 100 }));
  }

  return data.map((d) => ({
    ...d,
    normalized: (d.value / base) * 100,
  }));
}

export default function CombinedMacroChart() {
  const [u, setU] = useState<Point[]>([]);
  const [i, setI] = useState<Point[]>([]);
  const [g, setG] = useState<Point[]>([]);
  const [f, setF] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, iRes, gRes, fRes] = await Promise.all([
          fetch("/api/unemployment"),
          fetch("/api/inflation"),
          fetch("/api/gdp-growth"),
          fetch("/api/fed-rate"),
        ]);

        const [uJson, iJson, gJson, fJson] = await Promise.all([
          uRes.json(),
          iRes.json(),
          gRes.json(),
          fRes.json(),
        ]);

        setU(Array.isArray(uJson) ? uJson : []);
        setI(Array.isArray(iJson) ? iJson : []);
        setG(Array.isArray(gJson) ? gJson : []);
        setF(Array.isArray(fJson) ? fJson : []);
      } catch (error) {
        console.error("Failed to load combined macro chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const chartData = useMemo(() => {
    const uNorm = normalizeSeries(u);
    const iNorm = normalizeSeries(i);
    const gNorm = normalizeSeries(g);
    const fNorm = normalizeSeries(f);

    const map = new Map<string, ChartRow>();

    function ensure(date: string) {
      if (!map.has(date)) {
        const dt = new Date(date);
        map.set(date, {
          date,
          label: dt.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
        });
      }
      return map.get(date)!;
    }

    uNorm.forEach((d) => {
      const row = ensure(d.date);
      row.unemployment = d.normalized;
    });

    iNorm.forEach((d) => {
      const row = ensure(d.date);
      row.inflation = d.normalized;
    });

    gNorm.forEach((d) => {
      const row = ensure(d.date);
      row.gdpGrowth = d.normalized;
    });

    fNorm.forEach((d) => {
      const row = ensure(d.date);
      row.fedFunds = d.normalized;
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [u, i, g, f]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-400">
        Loading combined macro chart...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Combined Macro View
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            All Indicators in One Chart
          </h3>
        </div>

        <p className="text-xs text-gray-500">Base = 100</p>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              fontSize={10}
              minTickGap={20}
            />
            <YAxis stroke="#6b7280" fontSize={10} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="inflation"
              name="Inflation"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="unemployment"
              name="Unemployment"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="gdpGrowth"
              name="GDP Growth"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="fedFunds"
              name="Fed Funds"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}