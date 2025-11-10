"use client";

import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
};

// Shadcn-styled radar chart wrapper using Recharts
export default function RadarChart({ data, series, className }: RadarChartProps) {
  return (
    <div className={className ?? ""}>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data} margin={{ top: 12, right: 20, bottom: 16, left: 20 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} />
          {/* Oculta os números do raio para evitar desalinhamento e ruído visual */}
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
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
      {/* Legenda fora do gráfico para evitar conflito com rótulos do radar */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-900">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}