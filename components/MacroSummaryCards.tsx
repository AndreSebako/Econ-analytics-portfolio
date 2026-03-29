"use client";

import { useEffect, useState } from "react";

type Point = {
  date: string;
  value: number;
};

export default function MacroSummaryCards() {
  const [unemployment, setUnemployment] = useState<Point[]>([]);
  const [inflation, setInflation] = useState<Point[]>([]);
  const [fedRate, setFedRate] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
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
        console.error("Failed to load macro summary data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  const latestUnemployment =
    unemployment.length > 0 ? unemployment[unemployment.length - 1].value : null;

  const latestInflation =
    inflation.length > 0 ? inflation[inflation.length - 1].value : null;

  const latestFedRate =
    fedRate.length > 0 ? fedRate[fedRate.length - 1].value : null;

  if (loading) {
    return (
      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-900 p-5 text-gray-400">Loading...</div>
        <div className="rounded-2xl bg-gray-900 p-5 text-gray-400">Loading...</div>
        <div className="rounded-2xl bg-gray-900 p-5 text-gray-400">Loading...</div>
      </section>
    );
  }

  return (
    <section className="mb-10 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-sm text-gray-400">Latest Unemployment</p>
        <p className="mt-2 text-3xl font-bold">
          {latestUnemployment !== null ? `${latestUnemployment.toFixed(1)}%` : "--"}
        </p>
        <p className="mt-2 text-sm text-gray-500">Labor market conditions</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-sm text-gray-400">Latest Inflation</p>
        <p className="mt-2 text-3xl font-bold">
          {latestInflation !== null ? `${latestInflation.toFixed(1)}%` : "--"}
        </p>
        <p className="mt-2 text-sm text-gray-500">Year-over-year CPI</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-sm text-gray-400">Latest Fed Funds Rate</p>
        <p className="mt-2 text-3xl font-bold">
          {latestFedRate !== null ? `${latestFedRate.toFixed(2)}%` : "--"}
        </p>
        <p className="mt-2 text-sm text-gray-500">Current policy stance</p>
      </div>
    </section>
  );
}