import Link from "next/link";

const featuredInsights = [
  "Revenue growth was uneven across categories, with performance concentrated in a limited number of high-contributing areas.",
  "Margin pressure can persist even when sales rise, so volume alone is not a sufficient indicator of business strength.",
  "Customer and segment-level analysis helps distinguish broad-based growth from isolated performance pockets.",
];

const projectCards = [
  {
    title: "Sales & Profitability Analysis",
    summary:
      "Tracked revenue, gross profit, and margin trends across products, time periods, and customer segments.",
    tools: ["Power BI", "DAX", "Excel"],
    href: "/projects",
  },
  {
    title: "Customer Segment Dashboard",
    summary:
      "Compared order behavior, average order value, and segment-level performance to identify concentration and retention patterns.",
    tools: ["Power BI", "SQL", "Excel"],
    href: "/projects",
  },
  {
    title: "Operational KPI Tracker",
    summary:
      "Built a monitoring view for trend analysis, management reporting, and exception identification across business metrics.",
    tools: ["Excel", "Power BI", "Python"],
    href: "/projects",
  },
];

const focusAreas = [
  {
    title: "Dashboard Development",
    text: "Interactive reporting with decision-focused layouts, KPI cards, trend views, and clean visual hierarchy.",
  },
  {
    title: "Business Metrics",
    text: "Revenue, margin, growth, retention, customer behavior, and operational performance measurement.",
  },
  {
    title: "Data Preparation",
    text: "Cleaning, structuring, validating, and transforming data for reliable reporting and analysis.",
  },
  {
    title: "Analytical Storytelling",
    text: "Turning charts and model outputs into clear findings, implications, and action-oriented recommendations.",
  },
];

const workflowSteps = [
  {
    step: "1. Define the question",
    text: "Start with the business decision the dashboard should support, not just the data available.",
  },
  {
    step: "2. Prepare the data",
    text: "Clean fields, standardize categories, validate measures, and create a structure that supports analysis.",
  },
  {
    step: "3. Build the model",
    text: "Create meaningful KPIs, comparisons, filters, and visual logic aligned with the business problem.",
  },
  {
    step: "4. Deliver insight",
    text: "Summarize what changed, why it matters, and what management or stakeholders should pay attention to next.",
  },
];

const tools = [
  "Power BI",
  "Excel",
  "SQL",
  "Python",
  "DAX",
  "Data Modeling",
  "Dashboard Design",
  "KPI Reporting",
];

export default function DataAnalysisPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <section className="border-b border-slate-800 pb-10">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
            Data Analysis
          </p>

          <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-tight text-slate-50 md:text-7xl">
            Business dashboards, KPI analysis, and data-driven decision support
          </h1>

          <p className="mt-8 max-w-4xl text-xl leading-10 text-slate-300">
            This section highlights my work in business intelligence, reporting,
            and analytical problem-solving using Power BI, Excel, SQL, and
            Python. The focus is on turning raw data into clear operational and
            financial insight.
          </p>
        </section>

        <section className="mt-10 grid items-start gap-6 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Featured Dashboard
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50">
              Retail Performance Dashboard
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-300">
              This project evaluates revenue, profitability, and customer
              behavior across categories and segments. The objective is to
              identify where growth is coming from, where margin pressure is
              building, and which areas deserve management attention.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="aspect-[16/9] rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="grid h-full gap-4 md:grid-cols-[0.95fr_1.25fr]">
                  <div className="grid gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Revenue
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-50">
                        KPI View
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Gross Profit
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-50">
                        Margin Lens
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Customer Trends
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-50">
                        Segment Read
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Dashboard Preview
                    </p>

                    <div className="mt-4 grid h-[calc(100%-2rem)] grid-rows-[1fr_auto] gap-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="grid h-full grid-cols-12 gap-3">
                          <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-950/70" />
                          <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-950/70" />
                          <div className="col-span-4 rounded-lg border border-slate-800 bg-slate-950/70" />
                          <div className="col-span-7 rounded-lg border border-slate-800 bg-slate-950/70" />
                          <div className="col-span-5 rounded-lg border border-slate-800 bg-slate-950/70" />
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-slate-400">
                        Replace this placeholder with a screenshot from your best
                        Power BI or dashboard project once you choose the final
                        featured case.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Business Question
              </p>
              <p className="mt-4 text-lg leading-9 text-slate-100">
                How are revenue, margins, and customer trends evolving across
                products, segments, and time?
              </p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Tools Used
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {["Power BI", "Excel", "DAX", "Data Modeling"].map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Key Insights
              </p>

              <div className="mt-5 space-y-4">
                {featuredInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/75 p-5"
                  >
                    <p className="text-base leading-8 text-slate-100">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/projects"
                  className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  View Project
                </Link>
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            What I Focus On
          </p>

          <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {focusAreas.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Selected Projects
          </p>

          <div className="mt-5 grid gap-6 xl:grid-cols-3">
            {projectCards.map((project) => (
              <div
                key={project.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-7"
              >
                <h3 className="text-3xl font-semibold tracking-tight text-slate-50">
                  {project.title}
                </h3>

                <p className="mt-4 text-base leading-8 text-slate-300">
                  {project.summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm text-slate-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href={project.href}
                    className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Open Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              How I Work
            </p>

            <div className="mt-6 grid gap-5">
              {workflowSteps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-800 bg-slate-950/75 p-6"
                >
                  <h3 className="text-2xl font-semibold text-slate-50">
                    {item.step}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-300">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Tools
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Data Work with Decision Value
              </p>

              <p className="mt-5 text-lg leading-9 text-slate-100">
                My goal in analytics is not only to build visuals, but to
                structure information in a way that improves decision quality.
                Each project is designed to connect data, interpretation, and
                action.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/projects"
                  className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  View Projects
                </Link>

                <Link
                  href="/"
                  className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Back Home
                </Link>
              </div>
            </section>
          </div>
        </section>

        <div className="mt-12 text-sm text-slate-500">
          Focus: dashboard design, KPI reporting, data preparation, and
          decision-oriented business analysis.
        </div>
      </div>
    </main>
  );
}