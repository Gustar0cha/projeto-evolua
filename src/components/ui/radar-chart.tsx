"use client";

import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

type Series = {
  key: string;
  label: string;
  color: string;
};

type RadarChartProps = {
  data: Array<{ metric: string } & { [key: string]: number | string }>;
  series: Series[];
  className?: string;
  height?: number;
  domain?: [number, number];
  showLegend?: boolean;
  legendHeight?: number;
};

// Shadcn-styled radar chart wrapper using Recharts
export default function RadarChart({ data, series, className, height = 340, domain = [0, 100], showLegend = true, legendHeight = 44 }: RadarChartProps) {
  const chartHeight = Math.max(160, height - (showLegend ? legendHeight : 0));
  return (
    <div className={className ?? ""} style={{ width: "100%", height }}>
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
            <PolarRadiusAxis angle={90} domain={domain} tick={{ fill: "#94a3b8", fontSize: 10, dy: 2 }} axisLine={false} tickCount={5} />
            <Tooltip formatter={(v) => `${v}`} />
            {series.map((s) => (
              <Radar
                key={s.key}
                name={s.label}
                dataKey={s.key}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.22}
              />
            ))}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
      {showLegend ? (
        <div style={{ height: legendHeight }} className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-900">
            {series.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
