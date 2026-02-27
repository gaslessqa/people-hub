'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface PipelineStageData {
  stage: string;
  label: string;
  count: number;
  color: string;
}

interface PipelineFunnelChartProps {
  data: PipelineStageData[];
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  if (data.length === 0) {
    return (
      <div
        data-testid="dashboard-funnel"
        className="flex items-center justify-center h-48 text-muted-foreground text-sm"
      >
        Sin candidatos activos en el pipeline
      </div>
    );
  }

  return (
    <div data-testid="dashboard-funnel" className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 24, bottom: 4, left: 80 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={76} tick={{ fontSize: 12 }} />
          <Tooltip formatter={value => [value, 'Candidatos']} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
