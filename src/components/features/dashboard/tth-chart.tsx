'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface StageBreakdownItem {
  label: string;
  avgDays: number;
}

interface TTHChartProps {
  avgTTH: number | null;
  breakdown: StageBreakdownItem[];
  vacancyOptions: { id: string; title: string }[];
  currentVacancy: string;
}

export function TTHChart({ avgTTH, breakdown, vacancyOptions, currentVacancy }: TTHChartProps) {
  const hasData = avgTTH !== null;

  return (
    <section data-testid="metric-stage-breakdown" className="space-y-4">
      {/* Vacancy filter */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="vacancy-filter"
          className="text-sm font-medium text-muted-foreground whitespace-nowrap"
        >
          Filtrar por vacante:
        </label>
        <select
          id="vacancy-filter"
          data-testid="filter-metric-vacancy"
          defaultValue={currentVacancy}
          className="text-sm border rounded-md px-2 py-1 bg-background"
          onChange={e => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) {
              params.set('vacancy', e.target.value);
            } else {
              params.delete('vacancy');
            }
            window.location.search = params.toString();
          }}
        >
          <option value="">Todas las vacantes</option>
          {vacancyOptions.map(v => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
      </div>

      {!hasData ? (
        <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
      ) : (
        <>
          <div className="text-3xl font-bold">{avgTTH === 0 ? '< 1 día' : `${avgTTH} días`}</div>
          {breakdown.length > 0 && (
            <div data-testid="chart-time-trend" className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={breakdown}
                  margin={{ top: 4, right: 24, bottom: 4, left: 96 }}
                >
                  <XAxis type="number" allowDecimals={false} unit="d" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" width={92} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={value => [`${value} días`, 'Tiempo promedio']} />
                  <Bar dataKey="avgDays" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}
