"use client";

import { useEffect, useMemo, useState } from "react";
import MacroSummaryCards from "../../components/MacroSummaryCards";
import SimpleChart from "../../components/SimpleChart";
import InflationChart from "../../components/InflationChart";
import FedRateChart from "../../components/FedRateChart";
import GdpGrowthChart from "../../components/GdpGrowthChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

type Point = {
  date: string;
  value: number;
};

type CombinedRow = {
  date: string;
  label: string;
  inflation?: number | null;
  unemployment?: number | null;
  fedFunds?: number | null;
  gdpGrowth?: number | null;
};

function normalizeSeries(data: Point[]) {
  if (!data.length) return [];

  const base = Number(data[0].value);
  if (!base || Number.isNaN(base)) {
    return data.map((d) => ({ ...d, normalized: 100 }));
  }

  return data.map((d) => {
    const val = Number(d.value);
    return {
      ...d,
      normalized: Number.isNaN(val) ? null : (val / base) * 100,
    };
  });
}

function scaleGdpSeries(data: Point[]) {
  if (!data.length) return [];

  return data.map((d) => {
    const val = Number(d.value);
    return {
      ...d,
      normalized: Number.isNaN(val) ? null : 100 + val * 8,
    };
  });
}

export default function EconomicAnalysisPage() {
  const [unemployment, setUnemployment] = useState<Point[]>([]);
  const [inflation, setInflation] = useState<Point[]>([]);
  const [fedFunds, setFedFunds] = useState<Point[]>([]);
  const [gdpGrowth, setGdpGrowth] = useState<Point[]>([]);
  const [loadingCombined, setLoadingCombined] = useState(true);

  const recessionPeriods = [
    { start: "Jun 22", end: "Dec 22" },
  ];

  useEffect(() => {
    async function loadCombinedData() {
      try {
        const [uRes, iRes, fRes, gRes] = await Promise.all([
          fetch("/api/unemployment"),
          fetch("/api/inflation"),
          fetch("/api/fed-rate"),
          fetch("/api/gdp-growth"),
        ]);

        const [uJson, iJson, fJson, gJson] = await Promise.all([
          uRes.json(),
          iRes.json(),
          fRes.json(),
          gRes.json(),
        ]);

        setUnemployment(Array.isArray(uJson) ? uJson : []);
        setInflation(Array.isArray(iJson) ? iJson : []);
        setFedFunds(Array.isArray(fJson) ? fJson : []);
        setGdpGrowth(Array.isArray(gJson) ? gJson : []);
      } catch (error) {
        console.error("Failed to load combined chart data:", error);
      } finally {
        setLoadingCombined(false);
      }
    }

    loadCombinedData();
  }, []);

  const combinedData = useMemo(() => {
    const uNorm = normalizeSeries(unemployment);
    const iNorm = normalizeSeries(inflation);
    const fNorm = normalizeSeries(fedFunds);
    const gNorm = scaleGdpSeries(gdpGrowth);

    const map = new Map<string, CombinedRow>();

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

    uNorm.forEach((d: any) => {
      const row = ensure(d.date);
      row.unemployment = d.normalized;
    });

    iNorm.forEach((d: any) => {
      const row = ensure(d.date);
      row.inflation = d.normalized;
    });

    fNorm.forEach((d: any) => {
      const row = ensure(d.date);
      row.fedFunds = d.normalized;
    });

    gNorm.forEach((d: any) => {
      const row = ensure(d.date);
      row.gdpGrowth = d.normalized;
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [unemployment, inflation, fedFunds, gdpGrowth]);

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-8 text-white md:px-10 xl:px-12">
      <div className="mx-auto max-w-[1600px]">
        <section className="mb-6 border-b border-gray-800 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gray-400">
                Economic Analysis
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                U.S. Macroeconomic Dashboard
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-gray-400 md:text-base">
                Live monitoring of labor market conditions, inflation dynamics,
                monetary policy, and output growth using FRED time-series data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 md:grid-cols-4">
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                Labor
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                Inflation
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                Policy
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                Output
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <MacroSummaryCards />

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                  Combined Macro View
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  All Indicators in One Chart
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Indexed comparison (base = 100). GDP scaled for visibility.
                </p>
              </div>

              <p className="text-xs text-gray-500">Base = 100</p>
            </div>

            {loadingCombined ? (
              <p className="text-gray-400">Loading chart...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800 bg-black/20 px-4 py-3">
                <LineChart width={760} height={320} data={combinedData}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

                  {recessionPeriods.map((r, idx) => (
                    <ReferenceArea
                      key={idx}
                      x1={r.start}
                      x2={r.end}
                      strokeOpacity={0}
                      fill="#ef4444"
                      fillOpacity={0.08}
                    />
                  ))}

                  <ReferenceLine
                    x={combinedData[combinedData.length - 1]?.label}
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                  />

                  <XAxis
                    dataKey="label"
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#374151" }}
                    minTickGap={18}
                  />

                  <YAxis
                    stroke="#6b7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#374151" }}
                    domain={[80, 140]}
                    ticks={[80, 90, 100, 110, 120, 130, 140]}
                    tickFormatter={(v) => v.toFixed(0)}
                  />

                  <Tooltip
                    cursor={{ stroke: "#6b7280", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1f2937",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                    labelStyle={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                    formatter={(value: number, name: string) => [
                      Number(value).toFixed(1),
                      name,
                    ]}
                  />

                  <Legend
                    wrapperStyle={{
                      paddingTop: "12px",
                      color: "#d1d5db",
                      fontSize: "12px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="inflation"
                    name="Inflation"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="unemployment"
                    name="Unemployment"
                    stroke="#4ade80"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="gdpGrowth"
                    name="GDP Growth"
                    stroke="#a78bfa"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="fedFunds"
                    name="Fed Funds"
                    stroke="#60a5fa"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Labor Market
              </p>
              <h2 className="mt-1 text-xl font-semibold">U.S. Unemployment</h2>
            </div>
            <SimpleChart />
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Prices
              </p>
              <h2 className="mt-1 text-xl font-semibold">U.S. Inflation</h2>
            </div>
            <InflationChart />
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Monetary Policy
              </p>
              <h2 className="mt-1 text-xl font-semibold">Fed Funds Rate</h2>
            </div>
            <FedRateChart />
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Output
              </p>
              <h2 className="mt-1 text-xl font-semibold">Real GDP Growth</h2>
            </div>
            <GdpGrowthChart />
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Synthesis
              </p>
              <h2 className="mt-1 text-xl font-semibold">Macro Interpretation</h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-gray-300 md:text-base">
              <p>
                Inflation has moderated relative to prior highs, while unemployment
                remains within a relatively contained range. That combination suggests
                disinflation without a major deterioration in labor market conditions.
              </p>

              <p>
                The federal funds rate has moved lower from recent highs, indicating
                a less restrictive policy stance than before. This shift supports the
                view that inflation risk has eased enough to reduce pressure for further
                tightening.
              </p>

              <p>
                GDP growth remains positive but has slowed sharply in the latest reading.
                That introduces caution: the economy is still expanding, but momentum has
                weakened materially.
              </p>

              <p>
                Taken together, current conditions are most consistent with a soft-landing
                environment, though weaker output momentum should be monitored closely for
                signs of broader demand softening.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 border-b border-gray-800 pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Desk Notes
              </p>
              <h2 className="mt-1 text-xl font-semibold">Key Takeaways</h2>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                  Inflation
                </p>
                <p className="mt-2">
                  Price pressures are easing, but not fully eliminated.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                  Labor
                </p>
                <p className="mt-2">
                  Labor market resilience remains a key stabilizing force.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                  Growth
                </p>
                <p className="mt-2">
                  Output is still positive, but the latest quarter signals deceleration.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
                  Regime
                </p>
                <p className="mt-2">
                  Current baseline: soft landing with slowing growth momentum.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}