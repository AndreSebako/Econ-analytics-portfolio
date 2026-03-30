"use client";

import { useEffect, useMemo, useState } from "react";

type Point = {
  date: string;
  value: number;
};

function classifyMacroState(
  inflation: number | null,
  unemployment: number | null,
  gdpGrowth: number | null
) {
  if (inflation === null || unemployment === null || gdpGrowth === null) {
    return "No data";
  }

  if (gdpGrowth < 0) return "Recession";

  if (inflation > 3 && unemployment < 4)
    return "Overheating Economy";

  if (inflation > 3 && gdpGrowth < 1)
    return "Stagflation Risk";

  if (inflation < 3 && unemployment > 5)
    return "Weak Demand";

  if (inflation < 3 && gdpGrowth > 2)
    return "Expansion";

  return "Soft Landing";
}

export default function MacroSummaryCards() {
  const [unemployment, setUnemployment] = useState<Point[]>([]);
  const [inflation, setInflation] = useState<Point[]>([]);
  const [fedRate, setFedRate] = useState<Point[]>([]);
  const [gdp, setGdp] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

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
        setFedRate(Array.isArray(fJson) ? fJson : []);
        setGdp(Array.isArray(gJson) ? gJson : []);
      } catch (err) {
        console.error("Failed to load macro data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const latestUnemployment = useMemo(() => {
    return unemployment.length
      ? unemployment[unemployment.length - 1].value
      : null;
  }, [unemployment]);

  const latestInflation = useMemo(() => {
    return inflation.length
      ? inflation[inflation.length - 1].value
      : null;
  }, [inflation]);

  const latestFed = useMemo(() => {
    return fedRate.length
      ? fedRate[fedRate.length - 1].value
      : null;
  }, [fedRate]);

  const latestGdp = useMemo(() => {
    return gdp.length ? gdp[gdp.length - 1].value : null;
  }, [gdp]);

  const prevGdp =
  gdp.length > 1 ? gdp[gdp.length - 2].value : null;

const gdpTrend =
  latestGdp !== null && prevGdp !== null
    ? latestGdp - prevGdp
    : null;

  const macroState = classifyMacroState(
    latestInflation,
    latestUnemployment,
    latestGdp
  );

  const macroColor =
  macroState === "Recession"
    ? "#f87171"
    : macroState === "Stagflation Risk"
    ? "#fb923c"
    : macroState === "Overheating Economy"
    ? "#facc15"
    : macroState === "Weak Demand"
    ? "#60a5fa"
    : macroState === "Expansion"
    ? "#4ade80"
    : "#a78bfa"; // Soft Landing (neutral / purple)

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
        <p className="text-gray-400">Loading macro data...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-4">
      <p className="text-sm text-gray-400">Macro Regime</p>

      <p className="mt-2 text-xl font-semibold" style={{ color: macroColor }}>
  {macroState}
</p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-gray-400">Inflation</p>
          <p className="text-lg font-semibold">
            {latestInflation !== null
              ? `${latestInflation.toFixed(1)}%`
              : "--"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Unemployment</p>
          <p className="text-lg font-semibold">
            {latestUnemployment !== null
              ? `${latestUnemployment.toFixed(1)}%`
              : "--"}
          </p>
        </div>

        <div>
  <p className="text-xs text-gray-400">GDP Growth</p>
  <p className="text-lg font-semibold">
    {latestGdp !== null ? `${latestGdp.toFixed(1)}%` : "--"}
  </p>
  <p className="text-xs text-gray-500">
    {gdpTrend !== null
      ? `${gdpTrend > 0 ? "+" : ""}${gdpTrend.toFixed(1)} pp`
      : ""}
  </p>
</div>
      </div>
    </div>
  );
}