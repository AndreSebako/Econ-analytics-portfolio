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

type InflationPoint = {
  date: string;
  value: number;
};

export default function InflationChart() {
  const [data, setData] = useState<InflationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/inflation");

        if (!res.ok) {
          throw new Error("Failed to load inflation data");
        }

        const json = await res.json();
        setData(json);
      } catch {
        setError("Could not load inflation data.");
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
    return data.map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString("en-US", {
        year: "2-digit",
        month: "short",
      }),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
        <p className="text-gray-400">Loading inflation data...</p>
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
          <p className="text-sm text-gray-400">Latest Inflation</p>
          <p className="mt-2 text-3xl font-bold">
            {latest !== null ? `${latest.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {change !== null
              ? `${change > 0 ? "+" : ""}${change.toFixed(1)} pp vs last month`
              : "Most recent annual inflation"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">24-Month High</p>
          <p className="mt-2 text-3xl font-bold">
            {high !== null ? `${high.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Highest recent YoY inflation</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">24-Month Low</p>
          <p className="mt-2 text-3xl font-bold">
            {low !== null ? `${low.toFixed(1)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Lowest recent YoY inflation</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-400">U.S. Inflation Rate</p>
          <p className="text-lg font-semibold">Year-over-year CPI inflation</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="label" minTickGap={24} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <p className="text-sm text-gray-400">Interpretation</p>
        <p className="mt-2 leading-7 text-gray-300">
          This panel tracks year-over-year U.S. CPI inflation. Comparing this with
          unemployment helps you study whether inflation pressure is easing while
          labor market conditions remain tight, which is a core macroeconomic question.
        </p>
      </div>
    </div>
  );
}