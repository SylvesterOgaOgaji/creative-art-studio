import { BarChart3, CalendarDays, FileClock, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ACTIVITY_WINDOW_DAYS,
  createActivityChartData,
  getReportActivityEntries,
  summarizeActivity,
} from "@/lib/studioActivity";
import { sessionDurationDetails } from "@/types/studio";
import { useStudioStore } from "@/store/useStudioStore";
import "@/styles/educatorActivityReport.css";

const chartConfig = {
  saves: { label: "Saved worlds", color: "#ff6b4a" },
  reflections: { label: "Reflections", color: "#4eb69d" },
} satisfies ChartConfig;

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function EducatorActivityReport() {
  const savedArtworks = useStudioStore(state => state.savedArtworks);
  const activityHistory = useStudioStore(state => state.activityHistory);
  const ageMode = useStudioStore(state => state.ageMode);
  const environment = useStudioStore(state => state.environment);
  const lighting = useStudioStore(state => state.lighting);
  const sessionDuration = useStudioStore(state => state.sessionDuration);

  const entries = useMemo(
    () =>
      getReportActivityEntries(activityHistory, savedArtworks, {
        ageMode,
        environment,
        lighting,
        sessionDuration,
      }),
    [
      activityHistory,
      ageMode,
      environment,
      lighting,
      savedArtworks,
      sessionDuration,
    ]
  );
  const chartData = useMemo(() => createActivityChartData(entries), [entries]);
  const summary = useMemo(() => summarizeActivity(entries), [entries]);
  const latestActivity = summary.latestActivityAt
    ? dateFormatter.format(new Date(summary.latestActivityAt))
    : "No recorded activity yet";

  return (
    <section
      className="educator-activity-report"
      aria-labelledby="activity-report-title"
    >
      <div className="activity-report-heading">
        <span className="eyebrow">
          <BarChart3 aria-hidden="true" /> Local activity history
        </span>
        <h2 id="activity-report-title">Notice the rhythm of making.</h2>
        <p>
          A quiet, browser-only view of the last {ACTIVITY_WINDOW_DAYS} days.
          Each point comes from a real saved world or reflection, never from
          seeded or estimated activity.
        </p>
      </div>

      <div className="activity-report-layout">
        <div className="activity-chart-card">
          <div className="activity-chart-card-header">
            <div>
              <strong>Studio activity</strong>
              <span>Saved worlds and reflections by day</span>
            </div>
            <FileClock aria-hidden="true" />
          </div>
          {summary.totalEvents ? (
            <ChartContainer
              config={chartConfig}
              className="activity-report-chart"
              aria-label="Fourteen day studio activity chart"
            >
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 4, left: -18, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={1}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(255, 107, 74, 0.08)" }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="saves"
                  fill="var(--color-saves)"
                  radius={[5, 5, 0, 0]}
                  stackId="activity"
                />
                <Bar
                  dataKey="reflections"
                  fill="var(--color-reflections)"
                  radius={[5, 5, 0, 0]}
                  stackId="activity"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="activity-report-empty">
              <Sparkles aria-hidden="true" />
              <strong>Your first studio mark will appear here.</strong>
              <span>
                Save a world or add a reflection to begin a real history.
              </span>
            </div>
          )}
        </div>

        <aside
          className="activity-report-summary"
          aria-label="Activity summary"
        >
          <div className="activity-report-stat">
            <span>Active days</span>
            <strong>{summary.activeDays}</strong>
            <small>within the recorded history</small>
          </div>
          <div className="activity-report-stat">
            <span>Saved worlds</span>
            <strong>{summary.saveCount}</strong>
            <small>
              {summary.totalObjectsCreated} built shapes across saves
            </small>
          </div>
          <div className="activity-report-stat">
            <span>Reflections</span>
            <strong>{summary.reflectionCount}</strong>
            <small>
              {sessionDurationDetails[sessionDuration].label} is selected now
            </small>
          </div>
          <div className="activity-report-latest">
            <CalendarDays aria-hidden="true" />
            <span>
              <b>Latest activity</b>
              {latestActivity}
            </span>
          </div>
        </aside>
      </div>

      <p className="activity-report-note">
        <b>Privacy note.</b> The chart stores aggregate event metadata in this
        browser only. It excludes titles, names, reflection text, images, tags,
        and scene coordinates, and it does not send activity to a server.
      </p>
    </section>
  );
}
