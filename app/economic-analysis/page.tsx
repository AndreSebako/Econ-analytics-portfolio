import MacroSummaryCards from "../../components/MacroSummaryCards";
import SimpleChart from "../../components/SimpleChart";
import InflationChart from "../../components/InflationChart";
import FedRateChart from "../../components/FedRateChart";
import GdpGrowthChart from "../../components/GdpGrowthChart";

export default function EconomicAnalysisPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <section className="mb-12 max-w-5xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-gray-400">
          Economic Analysis
        </p>

        <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
          U.S. Macroeconomic Dashboard
        </h1>

        <p className="max-w-3xl text-lg text-gray-400">
          This dashboard tracks labor market conditions, inflation dynamics, and
          the monetary policy stance of the Federal Reserve.
        </p>
      </section>

      <MacroSummaryCards />

      <section className="mb-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold">U.S. Labor Market</h2>
          <SimpleChart />
        </div>

        <div className="rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-4 text-2xl font-semibold">U.S. Inflation</h2>
          <InflationChart />
        </div>
      </section>

      <section className="mb-10 rounded-2xl bg-gray-900 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Monetary Policy</h2>
        <FedRateChart />
      </section>

      <section className="mb-10 rounded-2xl bg-gray-900 p-6">
  <h2 className="mb-4 text-2xl font-semibold">Output and Growth</h2>
  <GdpGrowthChart />
</section>

      <section className="rounded-2xl bg-gray-900 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Macro Interpretation</h2>
        <p className="text-gray-300">
          The combination of moderating inflation, stable unemployment, and a
          declining federal funds rate suggests a transition toward a more balanced
          macroeconomic environment.
        </p>
      </section>
    </main>
  );
}