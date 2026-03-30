import MacroSummaryCards from "../../components/MacroSummaryCards";
import CombinedMacroChart from "../../components/CombinedMacroChart";
import SimpleChart from "../../components/SimpleChart";
import InflationChart from "../../components/InflationChart";
import FedRateChart from "../../components/FedRateChart";
import GdpGrowthChart from "../../components/GdpGrowthChart";

export default function EconomicAnalysisPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-5 py-6 text-white md:px-6">
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
        <CombinedMacroChart />
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
    </main>
  );
}