"use client";

import { useEffect, useState } from "react";

type Point = {
  date: string;
  value: number;
};

function classifyMacroState(
  inflation: number | null,
  unemployment: number | null,
  gdp: number | null
) {
  if (inflation === null || unemployment === null || gdp === null) {
    return "No data";
  }

  if (gdp < 0) return "Recession";
  if (inflation > 3 && unemployment < 4) return "Overheating Economy";
  if (inflation > 3 && gdp < 1) return "Stagflation Risk";
  if (inflation < 3 && unemployment > 5) return "Weak Demand";
  if (inflation < 3 && gdp > 2) return "Expansion";

  return "Soft Landing";
}

function generateMacroInsight(
  inflation: number | null,
  unemployment: number | null,
  gdp: number | null,
  gdpTrend: number | null
) {
  if (
    inflation === null ||
    unemployment === null ||
    gdp === null ||
    gdpTrend === null
  ) {
    return "Insufficient data to assess macro conditions.";
  }

  if (gdp < 0) {
    return "The economy is contracting, indicating recessionary conditions.";
  }

  if (gdp < 1 && gdpTrend < 0) {
    return "Growth is slowing sharply, suggesting weakening economic momentum.";
  }

  if (inflation > 3 && gdp < 1) {
    return "Elevated inflation combined with weak growth suggests stagflation risk.";
  }

  if (inflation < 3 && gdp > 2) {
    return "Stable inflation and solid growth indicate a healthy expansion.";
  }

  if (gdp > 0 && gdpTrend < 0) {
    return "Growth remains positive but is decelerating, consistent with a soft landing.";
  }

  return "The economy appears broadly stable.";
}

export default function MacroSummaryCards() {
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
        console.error("Failed to load macro summary data:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const latestU = u.length ? u[u.length - 1].value : null;
  const prevU = u.length > 1 ? u[u.length - 2].value : null;
  const uTrend =
    latestU !== null && prevU !== null ? latestU - prevU : null;

  const latestI = i.length ? i[i.length - 1].value : null;
  const prevI = i.length > 1 ? i[i.length - 2].value : null;
  const iTrend =
    latestI !== null && prevI !== null ? latestI - prevI : null;

  const latestG = g.length ? g[g.length - 1].value : null;
  const prevG = g.length > 1 ? g[g.length - 2].value : null;
  const gTrend =
    latestG !== null && prevG !== null ? latestG - prevG : null;

  const latestF = f.length ? f[f.length - 1].value : null;

  const macroState = classifyMacroState(latestI, latestU, latestG);

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
      : "#a78bfa";

  const insight = generateMacroInsight(latestI, latestU, latestG, gTrend);

  function fmt(value: number | null, digits = 1) {
    return value !== null ? `${value.toFixed(digits)}%` : "--";
  }

  function fmtDelta(value: number | null, digits = 1) {
    return value !== null
      ? `${value > 0 ? "+" : ""}${value.toFixed(digits)} pp`
      : "--";
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-400">
        Loading macro summary...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
        Macro Regime
      </p>

      <p
        className="mt-3 text-3xl font-semibold"
        style={{ color: macroColor }}
      >
        {macroState}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-800 pt-4 text-sm">
        <div>
          <p className="text-gray-400">Inflation</p>
          <p className="mt-1 text-lg font-semibold">{fmt(latestI, 1)}</p>
          <p className="text-xs text-gray-500">{fmtDelta(iTrend, 1)}</p>
        </div>

        <div>
          <p className="text-gray-400">Unemployment</p>
          <p className="mt-1 text-lg font-semibold">{fmt(latestU, 1)}</p>
          <p className="text-xs text-gray-500">{fmtDelta(uTrend, 1)}</p>
        </div>

        <div>
          <p className="text-gray-400">GDP Growth</p>
          <p className="mt-1 text-lg font-semibold">{fmt(latestG, 1)}</p>
          <p className="text-xs text-gray-500">{fmtDelta(gTrend, 1)}</p>
        </div>

        <div>
          <p className="text-gray-400">Fed Funds</p>
          <p className="mt-1 text-lg font-semibold">{fmt(latestF, 2)}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-800 pt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
          Macro Insight
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-300">{insight}</p>
      </div>
    </div>
  );
}