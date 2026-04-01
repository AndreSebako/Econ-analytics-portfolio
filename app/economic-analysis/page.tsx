import Link from "next/link";

export const revalidate = 3600;

type FredObservation = {
  date: string;
  value: string;
};

type FredResponse = {
  observations?: FredObservation[];
};

type Point = {
  date: string;
  value: number;
};

type ChartSeries = {
  name: string;
  color: string;
  points: Point[];
};

const COLORS = {
  bg: "#020817",
  panel: "#0f172a",
  panelAlt: "#020617",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  accent: "#a78bfa",
  blue: "#60a5fa",
  purple: "#a78bfa",
  amber: "#f59e0b",
  green: "#4ade80",
  red: "#fb7185",
  gold: "#facc15",
};

export default async function EconomicAnalysisPage() {
  const fredKey =
    process.env.FRED_API_KEY || process.env.NEXT_PUBLIC_FRED_API_KEY || "";

  const [unemploymentRaw, cpiRaw, fedFundsRaw, gdpRaw, recessionRaw] =
    await Promise.all([
      getFredSeries("UNRATE", fredKey),
      getFredSeries("CPIAUCSL", fredKey),
      getFredSeries("FEDFUNDS", fredKey),
      getFredSeries("A191RL1Q225SBEA", fredKey),
      getFredSeries("USREC", fredKey),
    ]);

  const unemployment = unemploymentRaw.slice(-24);
  const inflation = computeYoY(cpiRaw).slice(-24);
  const fedFunds = fedFundsRaw.slice(-24);
  const gdpGrowth = gdpRaw.slice(-16);
  const recession = recessionRaw;

  const latestUnemployment = getLatest(unemployment);
  const latestInflation = getLatest(inflation);
  const latestFedFunds = getLatest(fedFunds);
  const latestGDP = getLatest(gdpGrowth);

  const unemploymentDelta = getDelta(unemployment);
  const inflationDelta = getDelta(inflation);
  const fedFundsDelta = getDelta(fedFunds);
  const gdpDelta = getDelta(gdpGrowth);

  const regime = classifyRegime({
    inflation: latestInflation?.value ?? null,
    unemployment: latestUnemployment?.value ?? null,
    gdp: latestGDP?.value ?? null,
    fedFunds: latestFedFunds?.value ?? null,
    inflationDelta,
    unemploymentDelta,
    gdpDelta,
  });

  const laborSignal = getLaborSignal(
    latestUnemployment?.value ?? null,
    unemploymentDelta
  );
  const inflationSignal = getInflationSignal(
    latestInflation?.value ?? null,
    inflationDelta
  );
  const policySignal = getPolicySignal(latestFedFunds?.value ?? null);
  const growthSignal = getGrowthSignal(latestGDP?.value ?? null, gdpDelta);

  const combinedSeries: ChartSeries[] = [
    {
      name: "Fed Funds",
      color: COLORS.blue,
      points: normalizeSeries(fedFunds),
    },
    {
      name: "GDP Growth",
      color: COLORS.purple,
      points: normalizeSeries(gdpGrowth),
    },
    {
      name: "Inflation",
      color: COLORS.amber,
      points: normalizeSeries(inflation),
    },
    {
      name: "Unemployment",
      color: COLORS.green,
      points: normalizeSeries(unemployment),
    },
  ];

  const recessionBands = buildRecessionBands(
    recession,
    getChartDomainStart(combinedSeries),
    getChartDomainEnd(combinedSeries)
  );

  const assessment = buildAssessment({
    regime,
    inflation: latestInflation?.value ?? null,
    unemployment: latestUnemployment?.value ?? null,
    gdp: latestGDP?.value ?? null,
    fedFunds: latestFedFunds?.value ?? null,
    inflationDelta,
    unemploymentDelta,
    gdpDelta,
  });

  const marketImplications = buildMarketImplications({
    regime,
    inflation: latestInflation?.value ?? null,
    unemployment: latestUnemployment?.value ?? null,
    gdp: latestGDP?.value ?? null,
    fedFunds: latestFedFunds?.value ?? null,
    inflationDelta,
    unemploymentDelta,
    gdpDelta,
  });

  const lastUpdated = latestDateString([
    latestUnemployment,
    latestInflation,
    latestFedFunds,
    latestGDP,
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-[1700px] px-4 py-8 md:px-8 lg:px-10 xl:px-12">
        <section className="border-b border-slate-800 pb-8">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                U.S. Macro Monitor
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                U.S. Macroeconomic Dashboard
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
                Live tracking of inflation, labor market conditions, monetary
                policy, and real activity using FRED time-series data.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 md:min-w-[360px] md:grid-cols-2 xl:grid-cols-4">
              <MetaChip label="Current Regime" value={regime.label} accent />
              <MetaChip label="Source" value="FRED" />
              <MetaChip label="Last Updated" value={lastUpdated} />
              <MetaChip label="Coverage" value="Macro Monitor" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#labor"
              className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
            >
              Labor
            </a>
            <a
              href="#prices"
              className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
            >
              Inflation
            </a>
            <a
              href="#policy"
              className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
            >
              Policy
            </a>
            <a
              href="#output"
              className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
            >
              Output
            </a>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <Panel>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Regime Summary
            </p>

            <div className="mt-6">
              <p className="text-sm text-slate-400">Current Regime</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-violet-400 md:text-5xl">
                {regime.label}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                {regime.subtitle}
              </p>
            </div>

            <div className="mt-8 grid gap-6 border-t border-slate-800 pt-8 md:grid-cols-2">
              <MetricBlock
                label="Inflation"
                value={formatPercent(latestInflation?.value)}
                delta={formatDelta(inflationDelta, "pp")}
                deltaPositiveBad={false}
              />
              <MetricBlock
                label="Unemployment"
                value={formatPercent(latestUnemployment?.value)}
                delta={formatDelta(unemploymentDelta, "pp")}
                deltaPositiveBad
              />
              <MetricBlock
                label="GDP Growth"
                value={formatPercent(latestGDP?.value)}
                delta={formatDelta(gdpDelta, "pp")}
                deltaPositiveBad={false}
              />
              <MetricBlock
                label="Fed Funds"
                value={formatPercent(latestFedFunds?.value)}
                delta={formatDelta(fedFundsDelta, "pp")}
                deltaPositiveBad
              />
            </div>

            <div className="mt-8 border-t border-slate-800 pt-8">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Macro Assessment
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-100">
                {assessment}
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Composite Macro View
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-4xl">
                  All Indicators in One Chart
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-400">
                  Indexed comparison across inflation, labor, policy, and growth
                  series. Base = 100 at each series’ first visible observation.
                </p>
              </div>
              <p className="text-sm text-slate-400">Base = 100</p>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <MultiSeriesChart
                series={combinedSeries}
                recessionBands={recessionBands}
                height={420}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              {combinedSeries.map((item) => (
                <LegendItem
                  key={item.name}
                  color={item.color}
                  label={item.name}
                />
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <IndicatorPanel
            id="labor"
            sectionLabel="Labor Market"
            title="U.S. Unemployment"
            latest={formatPercent(latestUnemployment?.value)}
            deltaLabel="Δ MoM"
            delta={formatDelta(unemploymentDelta, "pp")}
            deltaPositiveBad
            signal={laborSignal.label}
            signalColor={laborSignal.color}
            chart={
              <SingleSeriesChart
                points={unemployment}
                color={COLORS.green}
                height={270}
              />
            }
            note="Labor conditions remain contained, though recent firming in unemployment warrants monitoring."
          />

          <IndicatorPanel
            id="prices"
            sectionLabel="Prices"
            title="U.S. Inflation"
            latest={formatPercent(latestInflation?.value)}
            deltaLabel="Δ MoM"
            delta={formatDelta(inflationDelta, "pp")}
            deltaPositiveBad={false}
            signal={inflationSignal.label}
            signalColor={inflationSignal.color}
            chart={
              <SingleSeriesChart
                points={inflation}
                color={COLORS.amber}
                height={270}
              />
            }
            note="Disinflation remains in place, although price pressures have not been fully eliminated."
          />

          <IndicatorPanel
            id="policy"
            sectionLabel="Monetary Policy"
            title="Fed Funds Rate"
            latest={formatPercent(latestFedFunds?.value)}
            deltaLabel="Δ MoM"
            delta={formatDelta(fedFundsDelta, "pp")}
            deltaPositiveBad
            signal={policySignal.label}
            signalColor={policySignal.color}
            chart={
              <SingleSeriesChart
                points={fedFunds}
                color={COLORS.blue}
                height={270}
              />
            }
            note="Policy remains restrictive in level terms, even as the recent direction appears less hawkish than before."
          />

          <IndicatorPanel
            id="output"
            sectionLabel="Output"
            title="Real GDP Growth"
            latest={formatPercent(latestGDP?.value)}
            deltaLabel="Δ QoQ"
            delta={formatDelta(gdpDelta, "pp")}
            deltaPositiveBad={false}
            signal={growthSignal.label}
            signalColor={growthSignal.color}
            chart={
              <SingleSeriesChart
                points={gdpGrowth}
                color={COLORS.purple}
                height={270}
                quarterlyLabels
              />
            }
            note="Growth remains positive, but the latest output print points to weaker underlying momentum."
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <Panel>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Desk Interpretation
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-4xl">
              Macro Assessment
            </h3>

            <div className="mt-8 max-w-5xl space-y-7 text-xl leading-10 text-slate-100">
              {assessment.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Market Implications
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-4xl">
              House View
            </h3>

            <div className="mt-8 space-y-4">
              {marketImplications.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-3 text-lg leading-8 text-slate-100">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Navigation
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                >
                  Return Home
                </Link>
                <a
                  href="#top"
                  className="rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                >
                  Back to Top
                </a>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

async function getFredSeries(seriesId: string, apiKey: string): Promise<Point[]> {
  if (!apiKey) return [];

  const url = new URL(
    "https://api.stlouisfed.org/fred/series/observations"
  );
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "asc");

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as FredResponse;
  const observations = data.observations ?? [];

  return observations
    .map((obs) => ({
      date: obs.date,
      value: Number(obs.value),
    }))
    .filter((point) => Number.isFinite(point.value));
}

function computeYoY(points: Point[]): Point[] {
  const result: Point[] = [];

  for (let i = 12; i < points.length; i += 1) {
    const current = points[i];
    const prior = points[i - 12];

    if (!current || !prior || prior.value === 0) continue;

    result.push({
      date: current.date,
      value: ((current.value / prior.value - 1) * 100),
    });
  }

  return result;
}

function normalizeSeries(points: Point[]): Point[] {
  if (!points.length) return [];
  const base = points[0].value;
  if (!Number.isFinite(base) || base === 0) return [];

  return points.map((point) => ({
    date: point.date,
    value: (point.value / base) * 100,
  }));
}

function getLatest(points: Point[]): Point | null {
  return points.length ? points[points.length - 1] : null;
}

function getDelta(points: Point[]): number | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1]?.value;
  const prior = points[points.length - 2]?.value;
  if (latest === undefined || prior === undefined) return null;
  return latest - prior;
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return `${value.toFixed(1)}%`;
}

function formatDelta(
  value: number | null | undefined,
  suffix = ""
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${suffix}`.trim();
}

function latestDateString(points: Array<Point | null>): string {
  const valid = points
    .filter((point): point is Point => Boolean(point))
    .map((point) => new Date(point.date).getTime())
    .filter((time) => Number.isFinite(time));

  if (!valid.length) return "Unavailable";

  const latest = new Date(Math.max(...valid));
  return latest.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function classifyRegime(input: {
  inflation: number | null;
  unemployment: number | null;
  gdp: number | null;
  fedFunds: number | null;
  inflationDelta: number | null;
  unemploymentDelta: number | null;
  gdpDelta: number | null;
}) {
  const {
    inflation,
    unemployment,
    gdp,
    inflationDelta,
    unemploymentDelta,
    gdpDelta,
  } = input;

  if (
    inflation === null ||
    unemployment === null ||
    gdp === null ||
    inflationDelta === null ||
    unemploymentDelta === null
  ) {
    return {
      label: "Insufficient Current Observations",
      subtitle:
        "The live data flow is not yet sufficient to determine a clear macro regime.",
    };
  }

  if (inflation > 3.5 && gdp > 1.5 && unemployment <= 4.3) {
    return {
      label: "Inflationary Expansion",
      subtitle:
        "Demand conditions remain firm, but inflation persistence keeps the policy backdrop restrictive.",
    };
  }

  if (
    inflation < 3.0 &&
    inflationDelta <= 0 &&
    unemployment <= 4.6 &&
    gdp > 0
  ) {
    return {
      label: "Soft Landing",
      subtitle:
        "Disinflation is progressing while labor market deterioration remains limited and growth stays positive.",
    };
  }

  if (gdp <= 0 || (gdpDelta !== null && gdpDelta < -2.0 && unemployment > 4.8)) {
    return {
      label: "Growth Downshift",
      subtitle:
        "Activity momentum is deteriorating materially, increasing the probability of a broader slowdown.",
    };
  }

  return {
    label: "Late-Cycle Deceleration",
    subtitle:
      "Inflation is easing, but softer growth and a still-restrictive policy backdrop argue for caution.",
  };
}

function getLaborSignal(
  value: number | null,
  delta: number | null
): { label: string; color: string } {
  if (value === null) return { label: "Unavailable", color: COLORS.muted };
  if (value <= 4.5 && (delta ?? 0) <= 0.1) {
    return { label: "Stable Labor", color: COLORS.green };
  }
  if (value <= 4.9) {
    return { label: "Softening", color: COLORS.gold };
  }
  return { label: "Deteriorating", color: COLORS.red };
}

function getInflationSignal(
  value: number | null,
  delta: number | null
): { label: string; color: string } {
  if (value === null) return { label: "Unavailable", color: COLORS.muted };
  if (value < 3.0 && (delta ?? 0) <= 0) {
    return { label: "Moderating", color: COLORS.gold };
  }
  if (value < 3.5) {
    return { label: "Sticky", color: COLORS.amber };
  }
  return { label: "Elevated", color: COLORS.red };
}

function getPolicySignal(value: number | null): { label: string; color: string } {
  if (value === null) return { label: "Unavailable", color: COLORS.muted };
  if (value >= 4.5) return { label: "Restrictive", color: COLORS.red };
  if (value >= 3.0) return { label: "Tight", color: COLORS.blue };
  return { label: "Easing", color: COLORS.green };
}

function getGrowthSignal(
  value: number | null,
  delta: number | null
): { label: string; color: string } {
  if (value === null) return { label: "Unavailable", color: COLORS.muted };
  if (value > 1.5) return { label: "Expansionary", color: COLORS.green };
  if (value > 0) return { label: "Weak Growth", color: COLORS.gold };
  if ((delta ?? 0) < 0) return { label: "Contraction Risk", color: COLORS.red };
  return { label: "Fragile", color: COLORS.amber };
}

function buildAssessment(input: {
  regime: { label: string; subtitle: string };
  inflation: number | null;
  unemployment: number | null;
  gdp: number | null;
  fedFunds: number | null;
  inflationDelta: number | null;
  unemploymentDelta: number | null;
  gdpDelta: number | null;
}): string {
  const {
    regime,
    inflation,
    unemployment,
    gdp,
    fedFunds,
    inflationDelta,
    unemploymentDelta,
    gdpDelta,
  } = input;

  const p1 =
    inflation !== null && unemployment !== null
      ? `Inflation currently prints at ${inflation.toFixed(
          1
        )}%, while unemployment stands at ${unemployment.toFixed(
          1
        )}%. The latest mix suggests that disinflation is continuing, and labor market deterioration remains limited rather than disorderly.`
      : `Current inflation and labor market observations remain insufficient for a complete regime read.`; 

  const p2 =
    fedFunds !== null
      ? `The federal funds rate is currently ${fedFunds.toFixed(
          2
        )}%, leaving policy restrictive in level terms. That said, the direction of macro pressure appears less adverse than during the earlier tightening phase.`
      : `Policy data is currently unavailable, limiting interpretation of the broader rates backdrop.`;

  const p3 =
    gdp !== null
      ? `Real GDP growth is ${gdp.toFixed(
          1
        )}%, and the latest change versus the prior quarter is ${
          gdpDelta === null
            ? "not available"
            : `${gdpDelta > 0 ? "+" : ""}${gdpDelta.toFixed(1)} percentage points`
        }. Activity remains positive, but the latest output print points to weaker underlying momentum.`
      : `Output data is currently unavailable, so activity momentum cannot be fully assessed.`;

  const p4 = `On balance, current conditions are most consistent with a ${regime.label.toLowerCase()} regime. The central question from here is whether easing inflation can continue without a broader deterioration in employment and growth conditions.`;

  return [p1, p2, p3, p4].join("\n");
}

function buildMarketImplications(input: {
  regime: { label: string; subtitle: string };
  inflation: number | null;
  unemployment: number | null;
  gdp: number | null;
  fedFunds: number | null;
  inflationDelta: number | null;
  unemploymentDelta: number | null;
  gdpDelta: number | null;
}) {
  const { inflation, unemployment, gdp, gdpDelta } = input;

  const ratesText =
    inflation !== null && inflation < 3.0
      ? "Disinflation improves the medium-term rates backdrop and supports a less restrictive policy path, though timing risk remains."
      : "Persistent inflation leaves the rates backdrop sensitive to upside surprises and keeps front-end easing expectations vulnerable.";

  const equitiesText =
    gdp !== null && gdp > 0
      ? "Positive growth remains supportive for broad risk assets, but softer momentum argues for more selective cyclical exposure."
      : "A weaker activity backdrop would likely narrow equity leadership and favor quality, defensives, and balance-sheet resilience.";

  const creditText =
    unemployment !== null && unemployment <= 4.6
      ? "Contained labor market stress remains broadly constructive for credit, though slowing growth argues for tighter issuer selection."
      : "A softer labor backdrop would warrant more caution in lower-quality credit and a greater focus on balance-sheet durability.";

  const riskText =
    gdpDelta !== null && gdpDelta < -2
      ? "The main macro risk is that slowing output broadens faster than inflation normalizes, shifting the regime from soft landing toward a more material growth downshift."
      : "The main macro risk is that inflation stalls before activity reaccelerates, leaving policy tight for longer than markets currently discount.";

  return [
    { title: "Rates", text: ratesText },
    { title: "Equities", text: equitiesText },
    { title: "Credit", text: creditText },
    { title: "Risk Monitor", text: riskText },
  ];
}

function getChartDomainStart(series: ChartSeries[]): Date | null {
  const times = series
    .flatMap((item) => item.points)
    .map((point) => new Date(point.date).getTime())
    .filter((time) => Number.isFinite(time));

  if (!times.length) return null;
  return new Date(Math.min(...times));
}

function getChartDomainEnd(series: ChartSeries[]): Date | null {
  const times = series
    .flatMap((item) => item.points)
    .map((point) => new Date(point.date).getTime())
    .filter((time) => Number.isFinite(time));

  if (!times.length) return null;
  return new Date(Math.max(...times));
}

function buildRecessionBands(
  recession: Point[],
  domainStart: Date | null,
  domainEnd: Date | null
) {
  if (!domainStart || !domainEnd || !recession.length) return [];

  const filtered = recession.filter((point) => {
    const time = new Date(point.date).getTime();
    return (
      Number.isFinite(time) &&
      time >= domainStart.getTime() &&
      time <= domainEnd.getTime()
    );
  });

  const bands: Array<{ start: string; end: string }> = [];
  let activeStart: string | null = null;

  filtered.forEach((point, index) => {
    if (point.value === 1 && activeStart === null) {
      activeStart = point.date;
    }

    const next = filtered[index + 1];
    if (
      activeStart !== null &&
      (point.value !== 1 || !next || next.value !== 1)
    ) {
      bands.push({
        start: activeStart,
        end: point.date,
      });
      activeStart = null;
    }
  });

  return bands;
}

function formatAxisDate(dateStr: string, quarterly = false) {
  const date = new Date(dateStr);

  if (quarterly) {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter} ${String(date.getFullYear()).slice(-2)}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function valueColor(delta: string, positiveBad: boolean) {
  if (delta === "--") return "text-slate-500";
  const isPositive = delta.trim().startsWith("+");
  if (positiveBad) return isPositive ? "text-rose-400" : "text-emerald-400";
  return isPositive ? "text-emerald-400" : "text-rose-400";
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-7 md:p-8">
      {children}
    </div>
  );
}

function MetaChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          accent ? "text-violet-400" : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  delta,
  deltaPositiveBad,
}: {
  label: string;
  value: string;
  delta: string;
  deltaPositiveBad: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white md:text-4xl">
        {value}
      </p>
      <p className={`mt-2 text-lg ${valueColor(delta, deltaPositiveBad)}`}>
        {delta}
      </p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}

function IndicatorPanel({
  id,
  sectionLabel,
  title,
  latest,
  deltaLabel,
  delta,
  deltaPositiveBad,
  signal,
  signalColor,
  chart,
  note,
}: {
  id: string;
  sectionLabel: string;
  title: string;
  latest: string;
  deltaLabel: string;
  delta: string;
  deltaPositiveBad: boolean;
  signal: string;
  signalColor: string;
  chart: React.ReactNode;
  note: string;
}) {
  return (
    <Panel>
      <div id={id}>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          {sectionLabel}
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h3>

        <div className="mt-6 grid items-start gap-6 border-t border-slate-800 pt-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-400">Latest</p>
            <p className="mt-2 text-2xl font-semibold text-white md:text-4xl">
              {latest}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-400">{deltaLabel}</p>
            <p className={`mt-2 text-xl ${valueColor(delta, deltaPositiveBad)}`}>
              {delta}
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-slate-400">Signal</p>
            <p className="mt-2 text-xl font-medium" style={{ color: signalColor }}>
              {signal}
            </p>
          </div>
        </div>

        <div className="mt-6">{chart}</div>

        <p className="mt-5 text-base leading-7 text-slate-300">{note}</p>
      </div>
    </Panel>
  );
}

function MultiSeriesChart({
  series,
  recessionBands,
  height = 420,
}: {
  series: ChartSeries[];
  recessionBands?: Array<{ start: string; end: string }>;
  height?: number;
}) {
  const width = 1100;
  const margin = { top: 20, right: 24, bottom: 54, left: 56 };

  const allPoints = series.flatMap((item) => item.points);
  if (!allPoints.length) {
    return (
      <div className="flex h-[420px] items-center justify-center text-slate-500">
        Insufficient chart data.
      </div>
    );
  }

  const times = allPoints.map((point) => new Date(point.date).getTime());
  const values = allPoints.map((point) => point.value);

  const xMin = Math.min(...times);
  const xMax = Math.max(...times);
  const yMinRaw = Math.min(...values);
  const yMaxRaw = Math.max(...values);

  const yPad = (yMaxRaw - yMinRaw) * 0.12 || 5;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    if (xMax === xMin) return margin.left;
    return margin.left + ((t - xMin) / (xMax - xMin)) * innerWidth;
  };

  const yScale = (value: number) => {
    if (yMax === yMin) return margin.top + innerHeight / 2;
    return margin.top + ((yMax - value) / (yMax - yMin)) * innerHeight;
  };

  const xTicks = buildTimeTicks(xMin, xMax, 8);
  const yTicks = buildValueTicks(yMin, yMax, 5);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Composite macro chart"
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="12"
        fill={COLORS.panelAlt}
      />

      {recessionBands?.map((band, index) => {
        const x1 = xScale(band.start);
        const x2 = xScale(band.end);
        return (
          <rect
            key={`${band.start}-${index}`}
            x={x1}
            y={margin.top}
            width={Math.max(0, x2 - x1)}
            height={innerHeight}
            fill="rgba(127,29,29,0.18)"
          />
        );
      })}

      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke={COLORS.border}
            strokeDasharray="4 4"
          />
          <text
            x={margin.left - 10}
            y={yScale(tick) + 4}
            textAnchor="end"
            fill={COLORS.muted}
            fontSize="14"
          >
            {tick.toFixed(0)}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke={COLORS.border}
            strokeDasharray="4 4"
          />
          <text
            x={xScale(tick)}
            y={height - 18}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize="14"
          >
            {formatAxisDate(tick)}
          </text>
        </g>
      ))}

      <rect
        x={margin.left}
        y={margin.top}
        width={innerWidth}
        height={innerHeight}
        fill="none"
        stroke={COLORS.border}
      />

      {series.map((item) => {
        const path = item.points
          .map((point, index) => {
            const x = xScale(point.date);
            const y = yScale(point.value);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ");

        const last = item.points[item.points.length - 1];

        return (
          <g key={item.name}>
            <path
              d={path}
              fill="none"
              stroke={item.color}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {last ? (
              <circle
                cx={xScale(last.date)}
                cy={yScale(last.value)}
                r="3.8"
                fill={item.color}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function SingleSeriesChart({
  points,
  color,
  height = 270,
  quarterlyLabels = false,
}: {
  points: Point[];
  color: string;
  height?: number;
  quarterlyLabels?: boolean;
}) {
  const width = 760;
  const margin = { top: 16, right: 18, bottom: 42, left: 52 };

  if (!points.length) {
    return (
      <div className="flex h-[270px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
        Data temporarily unavailable.
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const times = points.map((point) => new Date(point.date).getTime());

  const yMinRaw = Math.min(...values);
  const yMaxRaw = Math.max(...values);
  const yPad = (yMaxRaw - yMinRaw) * 0.15 || 1;

  const yMin = Math.max(0, yMinRaw - yPad);
  const yMax = yMaxRaw + yPad;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xMin = Math.min(...times);
  const xMax = Math.max(...times);

  const xScale = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    if (xMax === xMin) return margin.left;
    return margin.left + ((t - xMin) / (xMax - xMin)) * innerWidth;
  };

  const yScale = (value: number) => {
    if (yMax === yMin) return margin.top + innerHeight / 2;
    return margin.top + ((yMax - value) / (yMax - yMin)) * innerHeight;
  };

  const xTicks = points.filter((_, index) => index % Math.ceil(points.length / 6) === 0);
  const yTicks = buildValueTicks(yMin, yMax, 4);

  const path = points
    .map((point, index) => {
      const x = xScale(point.date);
      const y = yScale(point.value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full rounded-xl border border-slate-800 bg-slate-950 p-2"
      role="img"
      aria-label="Indicator trend chart"
    >
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke={COLORS.border}
          />
          <text
            x={margin.left - 8}
            y={yScale(tick) + 4}
            textAnchor="end"
            fill={COLORS.muted}
            fontSize="13"
          >
            {tick.toFixed(1).replace(".0", "")}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <g key={tick.date}>
          <line
            x1={xScale(tick.date)}
            x2={xScale(tick.date)}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke={COLORS.border}
          />
          <text
            x={xScale(tick.date)}
            y={height - 12}
            textAnchor="middle"
            fill={COLORS.muted}
            fontSize="13"
          >
            {formatAxisDate(tick.date, quarterlyLabels)}
          </text>
        </g>
      ))}

      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildTimeTicks(xMin: number, xMax: number, count: number) {
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax)) return [];
  if (xMin === xMax) return [new Date(xMin).toISOString().slice(0, 10)];

  const ticks: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = xMin + ((xMax - xMin) * i) / (count - 1);
    ticks.push(new Date(t).toISOString().slice(0, 10));
  }
  return ticks;
}

function buildValueTicks(min: number, max: number, count: number) {
  if (max === min) return [min];
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}