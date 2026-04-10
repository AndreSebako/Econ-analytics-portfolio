import Link from "next/link";

export const revalidate = 60 * 60;

type Observation = {
  date: string;
  value: number | null;
};

type FredResponse = {
  observations?: Array<{
    date: string;
    value: string;
  }>;
};

type MetricCard = {
  title: string;
  section: string;
  latestLabel: string;
  latest: number | null;
  deltaLabel: string;
  delta: number | null;
  signal: string;
  signalColor: string;
  data: Observation[];
  lineColor: string;
  commentary: string;
};

const FRED_KEY =
  process.env.FRED_API_KEY || process.env.NEXT_PUBLIC_FRED_API_KEY || "";

const SERIES = {
  unemployment: "UNRATE",
  inflation: "CPIAUCSL",
  fedFunds: "FEDFUNDS",
  gdpGrowth: "A191RL1Q225SBEA",

  // ISM panel
  ismManufacturing: "NAPM",
  ismServices: "NAPMS",
};

const COLORS = {
  bg: "#020817",
  panel: "#0f172a",
  panelAlt: "#020617",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  accent: "#a78bfa",
  green: "#22e89a",
  red: "#ff5c78",
  amber: "#facc15",
  blue: "#60a5fa",
  orange: "#ffb020",
  violet: "#a78bfa",
};

function parseFredValue(value: string): number | null {
  if (value === "." || value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function fetchFredSeries(
  seriesId: string,
  observationStart?: string
): Promise<Observation[]> {
  if (!FRED_KEY) return [];

  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", FRED_KEY);
  url.searchParams.set("file_type", "json");
  if (observationStart) {
    url.searchParams.set("observation_start", observationStart);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`FRED request failed for ${seriesId}: ${res.status}`);
  }

  const json = (await res.json()) as FredResponse;
  const observations = json.observations ?? [];

  return observations.map((obs) => ({
    date: obs.date,
    value: parseFredValue(obs.value),
  }));
}

function filterValid(data: Observation[]) {
  return data.filter((d) => d.value !== null) as Array<{
    date: string;
    value: number;
  }>;
}

function lastValid(data: Observation[]): number | null {
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (data[i].value !== null) return data[i].value;
  }
  return null;
}

function prevValid(data: Observation[]): number | null {
  let found = 0;
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (data[i].value !== null) {
      found += 1;
      if (found === 2) return data[i].value;
    }
  }
  return null;
}

function latestDelta(data: Observation[]): number | null {
  const latest = lastValid(data);
  const prev = prevValid(data);
  if (latest === null || prev === null) return null;
  return latest - prev;
}

function formatValue(
  value: number | null,
  suffix = "%",
  digits = 1
): string {
  if (value === null) return "--";
  return `${value.toFixed(digits)}${suffix}`;
}

function formatDelta(value: number | null, digits = 1): string {
  if (value === null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)} pp`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function quarterLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  const y = String(d.getUTCFullYear()).slice(-2);
  return `Q${q} ${y}`;
}

function latestLabelForSeries(isQuarterly: boolean, date: string): string {
  if (!date) return "--";
  return isQuarterly ? quarterLabel(date) : monthLabel(date);
}

function takeTail(data: Observation[], n: number): Observation[] {
  return data.slice(Math.max(0, data.length - n));
}

function getSignal(
  key: "unemployment" | "inflation" | "fedFunds" | "gdpGrowth",
  latest: number | null,
  delta: number | null
): { signal: string; color: string } {
  if (latest === null) {
    return { signal: "Unavailable", color: COLORS.muted };
  }

  if (key === "unemployment") {
    if (latest <= 4.5 && (delta ?? 0) <= 0.1) {
      return { signal: "Stable Labor", color: COLORS.green };
    }
    if (latest <= 5.0) {
      return { signal: "Softening", color: COLORS.amber };
    }
    return { signal: "Deteriorating", color: COLORS.red };
  }

  if (key === "inflation") {
    if (latest <= 3.0 && (delta ?? 0) <= 0) {
      return { signal: "Moderating", color: COLORS.amber };
    }
    if (latest <= 3.5) {
      return { signal: "Sticky", color: COLORS.amber };
    }
    return { signal: "Elevated", color: COLORS.red };
  }

  if (key === "fedFunds") {
    if (latest >= 4.5) {
      return { signal: "Restrictive", color: COLORS.red };
    }
    if (latest >= 3.0) {
      return { signal: "Tight", color: COLORS.blue };
    }
    return { signal: "Easing", color: COLORS.green };
  }

  if (latest > 1.5) {
    return { signal: "Healthy Growth", color: COLORS.green };
  }
  if (latest > 0) {
    return { signal: "Weak Growth", color: COLORS.amber };
  }
  return { signal: "Contraction Risk", color: COLORS.red };
}

function classifyRegime(input: {
  inflation: number | null;
  inflationDelta: number | null;
  unemployment: number | null;
  unemploymentDelta: number | null;
  gdpGrowth: number | null;
}) {
  const { inflation, inflationDelta, unemployment, unemploymentDelta, gdpGrowth } =
    input;

  if (
    inflation !== null &&
    unemployment !== null &&
    gdpGrowth !== null &&
    inflation <= 3.2 &&
    (inflationDelta ?? 0) <= 0 &&
    unemployment <= 4.7 &&
    (unemploymentDelta ?? 0) <= 0.2 &&
    gdpGrowth > 0
  ) {
    return {
      label: "Soft Landing",
      color: COLORS.accent,
      summary:
        "Disinflation continues with limited labor market deterioration; growth remains positive but decelerating.",
    };
  }

  if (
    inflation !== null &&
    gdpGrowth !== null &&
    inflation <= 3.5 &&
    gdpGrowth > 0 &&
    gdpGrowth <= 1.0
  ) {
    return {
      label: "Late-Cycle Slowdown",
      color: COLORS.amber,
      summary:
        "Inflation pressure has eased, but growth momentum is materially softer. The cycle remains expansionary, though increasingly fragile.",
    };
  }

  if (
    inflation !== null &&
    gdpGrowth !== null &&
    inflation > 3.5 &&
    gdpGrowth > 0
  ) {
    return {
      label: "Inflation Shock",
      color: COLORS.red,
      summary:
        "Price pressures remain elevated relative to target, leaving policy under pressure to stay restrictive despite ongoing growth.",
    };
  }

  if (
    unemployment !== null &&
    gdpGrowth !== null &&
    (unemployment >= 5.0 || gdpGrowth < 0)
  ) {
    return {
      label: "Hard Landing Watch",
      color: COLORS.red,
      summary:
        "Labor conditions and output momentum are weakening enough to raise concern about broader cyclical deterioration.",
    };
  }

  return {
    label: "Mixed Regime",
    color: COLORS.muted,
    summary:
      "Signals remain mixed across inflation, labor, policy, and growth. Current conditions do not map cleanly into a single dominant regime.",
  };
}

function macroAssessment(input: {
  inflation: number | null;
  inflationDelta: number | null;
  unemployment: number | null;
  unemploymentDelta: number | null;
  fedFunds: number | null;
  gdpGrowth: number | null;
  gdpGrowthDelta: number | null;
  regime: string;
}) {
  const {
    inflation,
    inflationDelta,
    unemployment,
    unemploymentDelta,
    fedFunds,
    gdpGrowth,
    gdpGrowthDelta,
    regime,
  } = input;

  const p1 =
    inflation !== null && unemployment !== null
      ? `Inflation currently prints at ${inflation.toFixed(
          1
        )}%, while unemployment stands at ${unemployment.toFixed(
          1
        )}%. The latest mix suggests that disinflation is ${
          (inflationDelta ?? 0) <= 0 ? "continuing" : "stalling"
        }, and labor market deterioration remains ${
          (unemploymentDelta ?? 0) <= 0.1 ? "limited rather than disorderly" : "more visible"
        }.`
      : "Inflation and labor data are partially unavailable, which limits the breadth of the current macro read.";

  const p2 =
    fedFunds !== null && gdpGrowth !== null
      ? `The federal funds rate is currently ${fedFunds.toFixed(
          2
        )}%, leaving policy ${
          fedFunds >= 3 ? "restrictive in level terms" : "less restrictive than before"
        }. Real GDP growth is ${gdpGrowth.toFixed(
          1
        )}%, and the latest change versus the prior quarter is ${formatDelta(
          gdpGrowthDelta,
          1
        )}. Activity remains positive, but the latest output print points to weaker underlying momentum.`
      : "Policy and output data are partially unavailable, so cyclical momentum should be interpreted with caution.";

  const p3 = `On balance, current conditions are most consistent with a ${regime.toLowerCase()} regime. The central question from here is whether easing inflation can continue without a broader deterioration in employment and growth conditions.`;

  return [p1, p2, p3];
}

function marketImplications(input: {
  regime: string;
  inflationDelta: number | null;
  gdpGrowth: number | null;
  fedFunds: number | null;
  unemploymentDelta: number | null;
}) {
  const { regime, inflationDelta, gdpGrowth, fedFunds, unemploymentDelta } = input;

  const rates =
    (inflationDelta ?? 0) <= 0 && (gdpGrowth ?? 0) <= 1.5
      ? "Disinflation improves the medium-term rates backdrop and supports a less restrictive policy path, though timing risk remains."
      : "Sticky inflation or firmer growth argues for a higher-for-longer rates profile.";

  const equities =
    regime === "Soft Landing"
      ? "Positive growth remains supportive for broad risk assets, but softer momentum argues for more selective cyclical exposure."
      : "Equity leadership is likely to narrow as growth momentum softens and macro visibility becomes less uniform.";

  const credit =
    (unemploymentDelta ?? 0) <= 0.1
      ? "Contained labor market stress remains broadly constructive for credit, though slowing growth argues for tighter issuer selection."
      : "Softening labor conditions raise the risk of wider credit dispersion and more defensive positioning.";

  const risk =
    (fedFunds ?? 0) >= 3
      ? "The main macro risk is that slowing output broadens faster than inflation normalizes, shifting the regime from soft landing toward a more material growth downshift."
      : "The main macro risk is that disinflation stalls before growth fully stabilizes.";

  return [
    { label: "Rates", text: rates },
    { label: "Equities", text: equities },
    { label: "Credit", text: credit },
    { label: "Risk Monitor", text: risk },
  ];
}

function scaleX(x: number, min: number, max: number, width: number) {
  if (max === min) return 0;
  return ((x - min) / (max - min)) * width;
}

function scaleY(y: number, min: number, max: number, height: number) {
  if (max === min) return height / 2;
  return height - ((y - min) / (max - min)) * height;
}

function linePath(
  data: Observation[],
  width: number,
  height: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  const valid = filterValid(data);
  if (valid.length === 0) return "";

  return valid
    .map((d, i) => {
      const x = scaleX(new Date(`${d.date}T00:00:00`).getTime(), minX, maxX, width);
      const y = scaleY(d.value, minY, maxY, height);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function yTicks(minY: number, maxY: number, n = 5) {
  const step = (maxY - minY) / n;
  return Array.from({ length: n + 1 }, (_, i) => minY + step * i);
}

function niceBounds(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) return { min: min - 1, max: max + 1 };
  const pad = (max - min) * 0.12;
  return { min: min - pad, max: max + pad };
}

function MiniLineChart({
  data,
  color,
  isQuarterly = false,
}: {
  data: Observation[];
  color: string;
  isQuarterly?: boolean;
}) {
  const width = 520;
  const height = 180;
  const valid = filterValid(data);

  if (valid.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-6 text-sm text-slate-500">
        Series temporarily unavailable.
      </div>
    );
  }

  const xs = valid.map((d) => new Date(`${d.date}T00:00:00`).getTime());
  const ys = valid.map((d) => d.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const { min: minY, max: maxY } = niceBounds(ys);
  const ticks = yTicks(minY, maxY, 4);

  return (
    <div className="mt-6 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width + 65} ${height + 45}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label="Mini series chart"
      >
        <g transform="translate(42,8)">
          {ticks.map((tick, i) => {
            const y = scaleY(tick, minY, maxY, height);
            return (
              <g key={`tick-${i}`}>
                <line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="rgba(148,163,184,0.12)"
                />
                <text
                  x={-8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={COLORS.muted}
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          <line x1={0} y1={0} x2={0} y2={height} stroke="rgba(148,163,184,0.28)" />
          <line
            x1={0}
            y1={height}
            x2={width}
            y2={height}
            stroke="rgba(148,163,184,0.28)"
          />

          <path
            d={linePath(valid, width, height, minX, maxX, minY, maxY)}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {valid
            .filter((_, i) => i % Math.max(1, Math.floor(valid.length / 6)) === 0)
            .slice(0, 6)
            .map((d, i, arr) => {
              const x = scaleX(
                new Date(`${d.date}T00:00:00`).getTime(),
                minX,
                maxX,
                width
              );
              const text = isQuarterly ? quarterLabel(d.date) : monthLabel(d.date);
              return (
                <text
                  key={`${d.date}-${i}`}
                  x={x}
                  y={height + 20}
                  textAnchor={i === 0 ? "start" : i === arr.length - 1 ? "end" : "middle"}
                  fontSize="11"
                  fill={COLORS.muted}
                >
                  {text}
                </text>
              );
            })}
        </g>
      </svg>
    </div>
  );
}

function MetricPanel({
  section,
  title,
  latestLabel,
  latest,
  deltaLabel,
  delta,
  signal,
  signalColor,
  data,
  lineColor,
  commentary,
  isQuarterly = false,
}: MetricCard & { isQuarterly?: boolean }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{section}</p>
      <h3 className="mt-4 text-5xl font-semibold tracking-tight text-slate-50">
        {title}
      </h3>

      <div className="mt-8 h-px w-full bg-slate-800" />

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-400">Latest</p>
          <p className="mt-2 text-5xl font-semibold text-slate-50">
            {formatValue(latest)}
          </p>
          <p className="mt-2 text-sm text-slate-500">{latestLabel}</p>
        </div>

        <div>
          <p className="text-sm text-slate-400">Δ {deltaLabel}</p>
          <p
            className="mt-2 text-3xl font-semibold"
            style={{
              color:
                delta === null
                  ? COLORS.muted
                  : delta > 0
                  ? COLORS.red
                  : delta < 0
                  ? COLORS.green
                  : COLORS.text,
            }}
          >
            {formatDelta(delta)}
          </p>
        </div>

        <div className="md:text-right">
          <p className="text-sm text-slate-400">Signal</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: signalColor }}>
            {signal}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
        <MiniLineChart data={data} color={lineColor} isQuarterly={isQuarterly} />
      </div>

      <p className="mt-7 text-lg leading-10 text-slate-300">{commentary}</p>
    </section>
  );
}

function ISMActivityChart({
  manufacturing,
  services,
}: {
  manufacturing: Observation[];
  services: Observation[];
}) {
  const width = 920;
  const height = 320;

  const validManufacturing = filterValid(manufacturing);
  const validServices = filterValid(services);

  const allDates = [...validManufacturing, ...validServices].map((d) =>
    new Date(`${d.date}T00:00:00`).getTime()
  );
  const allValues = [...validManufacturing, ...validServices].map((d) => d.value);

  if (allDates.length === 0 || allValues.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Business Activity Monitor
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-50">
          ISM Services vs Manufacturing
        </h2>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-8 text-sm text-slate-400">
          ISM activity data temporarily unavailable.
        </div>
      </section>
    );
  }

  const minX = Math.min(...allDates);
  const maxX = Math.max(...allDates);

  const rawMin = Math.min(...allValues, 48);
  const rawMax = Math.max(...allValues, 52);
  const minY = Math.floor(rawMin - 2);
  const maxY = Math.ceil(rawMax + 2);

  const tickValues = yTicks(minY, maxY, 5);
  const thresholdY = scaleY(50, minY, maxY, height);

  const xLabels = Array.from({ length: 7 }, (_, i) => {
    const t = minX + ((maxX - minX) / 6) * i;
    const d = new Date(t);
    return `${d.toLocaleDateString("en-US", { month: "short" })} ${String(
      d.getFullYear()
    ).slice(-2)}`;
  });

  const latestMfg = validManufacturing[validManufacturing.length - 1]?.value ?? null;
  const latestSrv = validServices[validServices.length - 1]?.value ?? null;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Business Activity Monitor
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50">
            ISM Services vs Manufacturing
          </h2>
          <p className="mt-5 max-w-4xl text-lg leading-9 text-slate-300">
            Diffusion indices tracking U.S. business activity. Readings above 50
            indicate expansion; readings below 50 indicate contraction.
          </p>
        </div>

        <div className="text-right text-lg text-slate-300">
          <p className="text-sm text-slate-400">Threshold</p>
          <p className="mt-1 font-semibold text-slate-100">50.0</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width + 90} ${height + 60}`}
            className="h-auto w-full min-w-[900px]"
            role="img"
            aria-label="ISM services and manufacturing chart"
          >
            <g transform="translate(60,20)">
              {tickValues.map((tick, i) => {
                const y = scaleY(tick, minY, maxY, height);
                return (
                  <g key={`yt-${i}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={width}
                      y2={y}
                      stroke="rgba(148,163,184,0.14)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={-10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill={COLORS.muted}
                    >
                      {tick.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={0}
                y1={thresholdY}
                x2={width}
                y2={thresholdY}
                stroke="rgba(250,204,21,0.9)"
                strokeWidth={2}
                strokeDasharray="8 6"
              />

              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="none"
                stroke="rgba(148,163,184,0.18)"
              />

              <path
                d={linePath(
                  validManufacturing,
                  width,
                  height,
                  minX,
                  maxX,
                  minY,
                  maxY
                )}
                fill="none"
                stroke={COLORS.orange}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              <path
                d={linePath(
                  validServices,
                  width,
                  height,
                  minX,
                  maxX,
                  minY,
                  maxY
                )}
                fill="none"
                stroke={COLORS.green}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {validManufacturing.length > 0 &&
                (() => {
                  const last = validManufacturing[validManufacturing.length - 1];
                  const x = scaleX(
                    new Date(`${last.date}T00:00:00`).getTime(),
                    minX,
                    maxX,
                    width
                  );
                  const y = scaleY(last.value, minY, maxY, height);

                  return (
                    <>
                      <circle cx={x} cy={y} r={4} fill={COLORS.orange} />
                      <text x={x + 8} y={y - 8} fontSize="12" fill={COLORS.orange}>
                        Manufacturing {last.value.toFixed(1)}
                      </text>
                    </>
                  );
                })()}

              {validServices.length > 0 &&
                (() => {
                  const last = validServices[validServices.length - 1];
                  const x = scaleX(
                    new Date(`${last.date}T00:00:00`).getTime(),
                    minX,
                    maxX,
                    width
                  );
                  const y = scaleY(last.value, minY, maxY, height);

                  return (
                    <>
                      <circle cx={x} cy={y} r={4} fill={COLORS.green} />
                      <text x={x + 8} y={y + 16} fontSize="12" fill={COLORS.green}>
                        Services {last.value.toFixed(1)}
                      </text>
                    </>
                  );
                })()}

              {xLabels.map((label, i) => {
                const x = (width / 6) * i;
                return (
                  <text
                    key={`xt-${i}`}
                    x={x}
                    y={height + 24}
                    textAnchor={i === 0 ? "start" : i === 6 ? "end" : "middle"}
                    fontSize="12"
                    fill={COLORS.muted}
                  >
                    {label}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Manufacturing PMI
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {latestMfg === null ? "--" : latestMfg.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Services PMI
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-50">
            {latestSrv === null ? "--" : latestSrv.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Activity Read
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-200">
            {latestMfg !== null && latestSrv !== null
              ? latestMfg >= 50 && latestSrv >= 50
                ? "Broad Expansion"
                : latestMfg < 50 && latestSrv < 50
                ? "Broad Contraction Risk"
                : "Split Activity Signal"
              : "Unavailable"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function EconomicAnalysisPage() {
  let unemploymentData: Observation[] = [];
  let inflationData: Observation[] = [];
  let fedFundsData: Observation[] = [];
  let gdpGrowthData: Observation[] = [];
  let ismManufacturingData: Observation[] = [];
  let ismServicesData: Observation[] = [];
  let fetchError: string | null = null;

  try {
    const [
      unemploymentRaw,
      inflationRaw,
      fedFundsRaw,
      gdpGrowthRaw,
      ismManufacturingRaw,
      ismServicesRaw,
    ] = await Promise.all([
      fetchFredSeries(SERIES.unemployment, "2023-01-01"),
      fetchFredSeries(SERIES.inflation, "2023-01-01"),
      fetchFredSeries(SERIES.fedFunds, "2023-01-01"),
      fetchFredSeries(SERIES.gdpGrowth, "2021-01-01"),
      fetchFredSeries(SERIES.ismManufacturing, "2023-01-01"),
      fetchFredSeries(SERIES.ismServices, "2023-01-01"),
    ]);

    unemploymentData = unemploymentRaw.filter((d) => d.value !== null);

    inflationData = inflationRaw
      .map((d, i, arr) => {
        if (i < 12 || d.value === null || arr[i - 12]?.value === null) {
          return { date: d.date, value: null };
        }
        const prevYear = arr[i - 12]?.value as number;
        const yoy = ((d.value / prevYear) - 1) * 100;
        return { date: d.date, value: yoy };
      })
      .filter((d) => d.value !== null);

    fedFundsData = fedFundsRaw.filter((d) => d.value !== null);
    gdpGrowthData = gdpGrowthRaw.filter((d) => d.value !== null);
    ismManufacturingData = ismManufacturingRaw.filter((d) => d.value !== null);
    ismServicesData = ismServicesRaw.filter((d) => d.value !== null);
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "Macro data request failed.";
  }

  const unemploymentLatest = lastValid(unemploymentData);
  const inflationLatest = lastValid(inflationData);
  const fedFundsLatest = lastValid(fedFundsData);
  const gdpGrowthLatest = lastValid(gdpGrowthData);

  const unemploymentDelta = latestDelta(unemploymentData);
  const inflationDelta = latestDelta(inflationData);
  const fedFundsDelta = latestDelta(fedFundsData);
  const gdpGrowthDelta = latestDelta(gdpGrowthData);

  const regime = classifyRegime({
    inflation: inflationLatest,
    inflationDelta,
    unemployment: unemploymentLatest,
    unemploymentDelta,
    gdpGrowth: gdpGrowthLatest,
  });

  const assessment = macroAssessment({
    inflation: inflationLatest,
    inflationDelta,
    unemployment: unemploymentLatest,
    unemploymentDelta,
    fedFunds: fedFundsLatest,
    gdpGrowth: gdpGrowthLatest,
    gdpGrowthDelta,
    regime: regime.label,
  });

  const houseView = marketImplications({
    regime: regime.label,
    inflationDelta,
    gdpGrowth: gdpGrowthLatest,
    fedFunds: fedFundsLatest,
    unemploymentDelta,
  });

  const unemploymentSignal = getSignal(
    "unemployment",
    unemploymentLatest,
    unemploymentDelta
  );
  const inflationSignal = getSignal("inflation", inflationLatest, inflationDelta);
  const fedFundsSignal = getSignal("fedFunds", fedFundsLatest, fedFundsDelta);
  const gdpSignal = getSignal("gdpGrowth", gdpGrowthLatest, gdpGrowthDelta);

  const unemploymentLatestDate =
    unemploymentData[unemploymentData.length - 1]?.date ?? "";
  const inflationLatestDate = inflationData[inflationData.length - 1]?.date ?? "";
  const fedFundsLatestDate = fedFundsData[fedFundsData.length - 1]?.date ?? "";
  const gdpLatestDate = gdpGrowthData[gdpGrowthData.length - 1]?.date ?? "";

  const unemploymentCard: MetricCard = {
    section: "Labor Market",
    title: "U.S. Unemployment",
    latestLabel: latestLabelForSeries(false, unemploymentLatestDate),
    latest: unemploymentLatest,
    deltaLabel: "MoM",
    delta: unemploymentDelta,
    signal: unemploymentSignal.signal,
    signalColor: unemploymentSignal.color,
    data: takeTail(unemploymentData, 24),
    lineColor: COLORS.green,
    commentary:
      "Labor conditions remain contained, though recent firming in unemployment warrants monitoring.",
  };

  const inflationCard: MetricCard = {
    section: "Prices",
    title: "U.S. Inflation",
    latestLabel: latestLabelForSeries(false, inflationLatestDate),
    latest: inflationLatest,
    deltaLabel: "MoM",
    delta: inflationDelta,
    signal: inflationSignal.signal,
    signalColor: inflationSignal.color,
    data: takeTail(inflationData, 24),
    lineColor: COLORS.orange,
    commentary:
      "Disinflation remains in place, although price pressures have not been fully eliminated.",
  };

  const fedFundsCard: MetricCard = {
    section: "Monetary Policy",
    title: "Fed Funds Rate",
    latestLabel: latestLabelForSeries(false, fedFundsLatestDate),
    latest: fedFundsLatest,
    deltaLabel: "MoM",
    delta: fedFundsDelta,
    signal: fedFundsSignal.signal,
    signalColor: fedFundsSignal.color,
    data: takeTail(fedFundsData, 24),
    lineColor: COLORS.blue,
    commentary:
      "Policy remains restrictive in level terms, even as the recent direction appears less hawkish than before.",
  };

  const gdpCard: MetricCard = {
    section: "Output",
    title: "Real GDP Growth",
    latestLabel: latestLabelForSeries(true, gdpLatestDate),
    latest: gdpGrowthLatest,
    deltaLabel: "QoQ",
    delta: gdpGrowthDelta,
    signal: gdpSignal.signal,
    signalColor: gdpSignal.color,
    data: takeTail(gdpGrowthData, 16),
    lineColor: COLORS.violet,
    commentary:
      "Growth remains positive, but the latest output print points to weaker underlying momentum.",
  };

  const updatedAt = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1820px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-8 grid gap-6 border-b border-slate-800 pb-10 xl:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              U.S. Macro Monitor
            </p>

            <h1 className="mt-6 text-6xl font-semibold tracking-tight text-slate-50 md:text-7xl">
              U.S. Macroeconomic Dashboard
            </h1>

            <p className="mt-8 max-w-4xl text-2xl leading-[1.9] text-slate-200">
              Live tracking of inflation, labor market conditions, monetary policy,
              and real activity using FRED time-series data.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#labor"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-lg font-medium text-slate-100 transition hover:border-slate-600"
              >
                Labor
              </a>
              <a
                href="#inflation"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-lg font-medium text-slate-100 transition hover:border-slate-600"
              >
                Inflation
              </a>
              <a
                href="#policy"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-lg font-medium text-slate-100 transition hover:border-slate-600"
              >
                Policy
              </a>
              <a
                href="#output"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-lg font-medium text-slate-100 transition hover:border-slate-600"
              >
                Output
              </a>
            </div>
          </div>

          <div className="grid gap-4 self-end md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Current Regime
              </p>
              <p className="mt-4 text-3xl font-semibold" style={{ color: regime.color }}>
                {regime.label}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Source
              </p>
              <p className="mt-4 text-3xl font-semibold text-slate-50">FRED</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Last Updated
              </p>
              <p className="mt-4 text-3xl font-semibold text-slate-50">{updatedAt}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Coverage
              </p>
              <p className="mt-4 text-3xl font-semibold text-slate-50">
                Macro Monitor
              </p>
            </div>
          </div>
        </div>

        {fetchError ? (
          <div className="mb-8 rounded-xl border border-red-900/60 bg-red-950/40 p-5 text-red-300">
            Data temporarily unavailable. {fetchError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Regime Summary
            </p>

            <div className="mt-8">
              <p className="text-4xl text-slate-300">Current Regime</p>
              <h2
                className="mt-3 text-7xl font-semibold tracking-tight"
                style={{ color: regime.color }}
              >
                {regime.label}
              </h2>
              <p className="mt-6 max-w-3xl text-2xl leading-[1.8] text-slate-200">
                {regime.summary}
              </p>
            </div>

            <div className="mt-10 h-px w-full bg-slate-800" />

            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <p className="text-2xl text-slate-300">Inflation</p>
                <p className="mt-3 text-6xl font-semibold text-slate-50">
                  {formatValue(inflationLatest)}
                </p>
                <p
                  className="mt-4 text-4xl"
                  style={{
                    color:
                      inflationDelta === null
                        ? COLORS.muted
                        : inflationDelta > 0
                        ? COLORS.red
                        : inflationDelta < 0
                        ? COLORS.green
                        : COLORS.text,
                  }}
                >
                  {formatDelta(inflationDelta)}
                </p>
              </div>

              <div>
                <p className="text-2xl text-slate-300">Unemployment</p>
                <p className="mt-3 text-6xl font-semibold text-slate-50">
                  {formatValue(unemploymentLatest)}
                </p>
                <p
                  className="mt-4 text-4xl"
                  style={{
                    color:
                      unemploymentDelta === null
                        ? COLORS.muted
                        : unemploymentDelta > 0
                        ? COLORS.red
                        : unemploymentDelta < 0
                        ? COLORS.green
                        : COLORS.text,
                  }}
                >
                  {formatDelta(unemploymentDelta)}
                </p>
              </div>

              <div>
                <p className="text-2xl text-slate-300">GDP Growth</p>
                <p className="mt-3 text-6xl font-semibold text-slate-50">
                  {formatValue(gdpGrowthLatest)}
                </p>
                <p
                  className="mt-4 text-4xl"
                  style={{
                    color:
                      gdpGrowthDelta === null
                        ? COLORS.muted
                        : gdpGrowthDelta > 0
                        ? COLORS.green
                        : gdpGrowthDelta < 0
                        ? COLORS.red
                        : COLORS.text,
                  }}
                >
                  {formatDelta(gdpGrowthDelta)}
                </p>
              </div>

              <div>
                <p className="text-2xl text-slate-300">Fed Funds</p>
                <p className="mt-3 text-6xl font-semibold text-slate-50">
                  {formatValue(fedFundsLatest, "%", 1)}
                </p>
                <p
                  className="mt-4 text-4xl"
                  style={{
                    color:
                      fedFundsDelta === null
                        ? COLORS.muted
                        : fedFundsDelta > 0
                        ? COLORS.red
                        : fedFundsDelta < 0
                        ? COLORS.green
                        : COLORS.text,
                  }}
                >
                  {formatDelta(fedFundsDelta)}
                </p>
              </div>
            </div>

            <div className="mt-12 h-px w-full bg-slate-800" />

            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Macro Assessment
              </p>
              <p className="mt-7 text-[2rem] leading-[1.9] text-slate-100">
                {assessment[0]}
              </p>
            </div>
          </section>

          <ISMActivityChart
            manufacturing={takeTail(ismManufacturingData, 36)}
            services={takeTail(ismServicesData, 36)}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div id="labor">
            <MetricPanel {...unemploymentCard} />
          </div>
          <div id="inflation">
            <MetricPanel {...inflationCard} />
          </div>
          <div id="policy">
            <MetricPanel {...fedFundsCard} />
          </div>
          <div id="output">
            <MetricPanel {...gdpCard} isQuarterly />
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Desk Interpretation
            </p>
            <h2 className="mt-4 text-6xl font-semibold tracking-tight text-slate-50">
              Macro Assessment
            </h2>

            <div className="mt-10 space-y-10 text-[1.08rem] leading-[2.1] text-slate-100 md:text-[1.12rem]">
              {assessment.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Market Implications
            </p>
            <h2 className="mt-4 text-6xl font-semibold tracking-tight text-slate-50">
              House View
            </h2>

            <div className="mt-10 space-y-6">
              {houseView.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-800 bg-slate-950/75 p-7"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-5 text-[1.08rem] leading-[2] text-slate-100">
                    {item.text}
                  </p>
                </div>
              ))}

              <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-7">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Navigation
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/"
                    className="rounded-xl border border-slate-700 bg-slate-950/70 px-6 py-4 text-lg font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Return Home
                  </Link>
                  <a
                    href="#top"
                    className="rounded-xl border border-slate-700 bg-slate-950/70 px-6 py-4 text-lg font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Back to Top
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}