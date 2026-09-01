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
  { key: 'clarity', label: 'Clarity', color: '#7c5cff' },
  { key: 'fluency', label: 'Fluency', color: '#4c7cff' },
  { key: 'structure', label: 'Structure', color: '#e5a54d' },
  { key: 'conciseness', label: 'Conciseness', color: '#3dbe7a' },
] as const

const axisTick = { fontSize: 12, fill: '#9aa0b0' }

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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={axisTick}
          />
          <YAxis
            domain={[40, 100]}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={axisTick}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#101018',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
              fontSize: 12,
              color: '#e8e9f0',
            }}
            labelStyle={{ color: '#9aa0b0', marginBottom: 4 }}
            itemStyle={{ padding: 0, margin: 0 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#9aa0b0' }}
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