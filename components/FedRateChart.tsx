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

type FedRatePoint = {
  date: string;
  value: number;
};

export default function FedRateChart() {
  const [data, setData] = useState<FedRatePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/fed-rate");

        if (!res.ok) {
          throw new Error("Failed to load Fed rate data");
        }

        const json = await res.json();
        setData(json);
      } catch {
        setError("Could not load Fed funds rate data.");
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
        <p className="text-gray-400">Loading Fed funds rate data...</p>
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
          <p className="text-sm text-gray-400">Latest Fed Rate</p>
          <p className="mt-2 text-3xl font-bold">
            {latest !== null ? `${latest.toFixed(2)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {change !== null
              ? `${change > 0 ? "+" : ""}${change.toFixed(2)} pp vs last month`
              : "Most recent monthly value"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">24-Month High</p>
          <p className="mt-2 text-3xl font-bold">
            {high !== null ? `${high.toFixed(2)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Highest recent policy rate</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">24-Month Low</p>
          <p className="mt-2 text-3xl font-bold">
            {low !== null ? `${low.toFixed(2)}%` : "--"}
          </p>
          <p className="mt-1 text-sm text-gray-500">Lowest recent policy rate</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Federal Funds Rate</p>
          <p className="text-lg font-semibold">Last 24 monthly observations</p>
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
                stroke="#60a5fa"
                strokeWidth={3}
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
          The federal funds rate summarizes the stance of U.S. monetary policy.
          Comparing this series with inflation and unemployment helps evaluate
          whether policy is restrictive, neutral, or accommodative relative to
          current macroeconomic conditions.
        </p>
      </div>
    </div>
  );
}