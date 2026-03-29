"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type GdpPoint = {
  date: string;
  value: number;
};

function classifyGrowth(latest: number | null) {
  if (latest === null) return "No data";
  if (latest < 0) return "Contraction";
  if (latest < 1) return "Weak Growth";
  if (latest < 3) return "Moderate Growth";
  return "Strong Expansion";
}

export default function GdpGrowthChart() {
  const [data, setData] = useState<GdpPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/gdp-growth");

        if (!res.ok) {
          throw new Error("Failed to load GDP growth data");
        }

        const json = await res.json();
        setData(json);
      } catch {
        setError("Could not load GDP growth data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const latest = useMemo(() => {
    return data.length ? data[data.length - 1].value : null;
  }, [data]);

  const previous = useMemo(() => {
    return data.length > 1 ? data[data.length - 2].value : null;
  }, [data]);

  const change = useMemo(() => {
    if (latest !== null && previous !== null) {
      return latest - previous;
    }
    return null;
  }, [latest, previous]);

  const low = useMemo(() => {
    return data.length ? Math.min(...data.map((d) => d.value)) : null;
  }, [data]);

  const high = useMemo(() => {
    return data.length ? Math.max(...data.map((d) => d.value)) : null;
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = String(date.getFullYear()).slice(-2);

      return {
        ...d,
        label: `Q${quarter} ${year}`,
      };
    });
  }, [data]);

  const growthSignal = classifyGrowth(latest);
  const growthSignalColor =
  growthSignal === "Contraction"
    ? "#f87171"
    : growthSignal === "Weak Growth"
    ? "#fde047"
    : growthSignal === "Moderate Growth"
    ? "#93c5fd"
    : "#4ade80";

  
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
        <p className="text-gray-400">Loading GDP growth data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">Latest GDP Growth</p>
          <p className="mt-2 text-3xl font-bold">
            {latest !== null ? `${latest.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {change !== null
              ? `${change > 0 ? "+" : ""}${change.toFixed(1)} pp vs prior quarter`
              : "Most recent quarterly growth"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">16-Quarter High</p>
          <p className="mt-2 text-3xl font-bold">
            {high !== null ? `${high.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Highest recent growth reading</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">16-Quarter Low</p>
          <p className="mt-2 text-3xl font-bold">
            {low !== null ? `${low.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Lowest recent growth reading</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Real GDP Growth</p>
          <p className="text-lg font-semibold">Quarterly annualized growth rate</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="label" minTickGap={20} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
  <p className="text-sm text-gray-400">Growth Signal</p>

  <p
    className="mt-2 text-xl font-semibold"
    style={{ color: growthSignalColor }}
  >
    {growthSignal}
  </p>
</div>

      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <p className="text-sm text-gray-400">Interpretation</p>
        <p className="mt-2 leading-7 text-gray-300">
          Real GDP growth captures the pace of aggregate output expansion. In
          combination with unemployment, inflation, and the policy rate, it helps
          assess whether the economy is accelerating, slowing, or transitioning
          toward a more stable path.
        </p>
      </div>
    </div>
  );
}