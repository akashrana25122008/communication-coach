import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressPoint } from '../types'

const series = [
  { key: 'clarity', label: 'Clarity', color: '#5b5bd6' },
  { key: 'fluency', label: 'Fluency', color: '#2e9e63' },
  { key: 'structure', label: 'Structure', color: '#d98a1f' },
  { key: 'conciseness', label: 'Conciseness', color: '#d14b4b' },
] as const

interface ProgressChartProps {
  data: ProgressPoint[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e8ef" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#8b92a0' }}
          />
          <YAxis
            domain={[40, 100]}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 12, fill: '#8b92a0' }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e6e8ef',
              boxShadow: '0 8px 30px rgba(23,26,35,0.12)',
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#5b6270' }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
