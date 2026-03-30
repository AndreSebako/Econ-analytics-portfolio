"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Point = {
  date: string;
  value: number;
};

export default function SimpleChart() {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/unemployment");
        if (!res.ok) throw new Error("Failed to load unemployment data");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Could not load unemployment data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const latest = data.length ? data[data.length - 1].value : null;
  const prev = data.length > 1 ? data[data.length - 2].value : null;
  const change =
    latest !== null && prev !== null ? latest - prev : null;

  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      value: d.value,
    }));
  }, [data]);

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">Latest</p>
          <p className="text-2xl font-semibold">
            {latest?.toFixed(1)}%
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Δ MoM</p>
          <p
            className={`text-sm ${
              change !== null && change > 0
                ? "text-red-400"
                : change !== null && change < 0
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            {change !== null
              ? `${change > 0 ? "+" : ""}${change.toFixed(1)} pp`
              : ""}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Signal</p>
          <p className="text-sm font-medium text-green-400">
            Stable Labor
          </p>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
            <YAxis stroke="#6b7280" fontSize={10} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}