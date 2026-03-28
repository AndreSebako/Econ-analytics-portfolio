import Link from "next/link";
import SimpleChart from "../components/SimpleChart";
import InflationChart from "../components/InflationChart";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <nav className="mb-12 flex items-center justify-between">
        <h1 className="text-xl font-semibold">andresebak.com</h1>

        <div className="space-x-6 text-sm">
          <Link href="/data-analysis">Data</Link>
          <Link href="/economic-analysis">Economics</Link>
          <Link href="/capital-finance">Capital</Link>
          <Link href="/financial-analysis">Finance</Link>
          <Link href="/projects">Projects</Link>
        </div>
      </nav>

      <section className="mb-16 max-w-4xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-gray-400">
          Analytics Portfolio
        </p>

        <h2 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
          Data Analysis, Economic Analysis, Capital Finance, and Financial Analysis
        </h2>

        <p className="max-w-2xl text-lg text-gray-400">
          A professional platform for dashboards, research, market insights, and
          analytical projects across economics and finance.
        </p>
      </section>

      <section className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/data-analysis"
          className="rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
        >
          <h3 className="mb-2 text-lg font-semibold">Data Analysis</h3>
          <p className="text-sm text-gray-400">
            Dashboards, metrics, trends, and business intelligence work.
          </p>
        </Link>

        <Link
          href="/economic-analysis"
          className="rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
        >
          <h3 className="mb-2 text-lg font-semibold">Economic Analysis</h3>
          <p className="text-sm text-gray-400">
            Macroeconomic indicators, models, and data-driven interpretation.
          </p>
        </Link>

        <Link
          href="/capital-finance"
          className="rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
        >
          <h3 className="mb-2 text-lg font-semibold">Capital Finance</h3>
          <p className="text-sm text-gray-400">
            Capital structure, valuation thinking, and investment-focused work.
          </p>
        </Link>

        <Link
          href="/financial-analysis"
          className="rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
        >
          <h3 className="mb-2 text-lg font-semibold">Financial Analysis</h3>
          <p className="text-sm text-gray-400">
            Performance analysis, statements, ratios, and financial insights.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl bg-gray-900 p-6">
        <h3 className="mb-3 text-2xl font-semibold">U.S. Unemployment Dashboard</h3>
        <SimpleChart />
      </section>
      <section className="mt-10 rounded-2xl bg-gray-900 p-6">
  <h3 className="mb-3 text-2xl font-semibold">U.S. Inflation Dashboard</h3>
  <InflationChart />
</section>
    </main>
  );
}