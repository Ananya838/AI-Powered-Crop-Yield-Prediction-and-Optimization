import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { t } from '../utils/translations'

/**
 * NEW FILE: YieldChart.jsx
 * Bar chart comparing predicted yield vs. average yield for the selected crop.
 * Uses recharts (already installed — no new dependency needed).
 *
 * Props:
 *   predicted   — predicted yield in kg/ha (number)
 *   cropAverage — average yield for this crop type (number, from crop DB)
 *   cropType    — crop name string (for chart label)
 *   lang        — 'en' | 'kn'
 */

// Average yields per crop (mirrors _BASE_YIELDS in prediction_service.py)
const CROP_AVG_YIELDS = {
  rice: 4200, wheat: 3500, maize: 4800, chickpea: 1500,
  kidneybeans: 1200, pigeonpeas: 1000, mothbeans: 900, mungbean: 1100,
  blackgram: 1000, lentil: 1300, pomegranate: 15000, banana: 20000,
  mango: 10000, grapes: 18000, watermelon: 25000, muskmelon: 18000,
  apple: 12000, orange: 14000, papaya: 30000, coconut: 8000,
  cotton: 1800, jute: 2500, coffee: 900,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value.toLocaleString()} kg/ha</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function YieldChart({ predicted, cropType, lang = 'en' }) {
  const avg = CROP_AVG_YIELDS[cropType?.toLowerCase()] ?? 2000
  const crop = cropType ? cropType.charAt(0).toUpperCase() + cropType.slice(1) : 'Crop'

  const chartData = [
    {
      name: crop,
      [t('predicted_yield', lang)]: Math.round(predicted),
      [t('avg_yield', lang)]: avg,
    },
  ]

  const predictedLabel = t('predicted_yield', lang)
  const avgLabel = t('avg_yield', lang)
  const isPredictedHigher = predicted >= avg

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold text-gray-700">{t('yield_chart', lang)}</h2>
      <p className="text-xs text-gray-400">
        Predicted vs. average yield for{' '}
        <span className="font-semibold capitalize">{cropType}</span> (kg/ha)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          barCategoryGap="40%"
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6b7280' }} />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            label={{
              value: 'kg/ha',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
          />
          <Bar dataKey={predictedLabel} radius={[6, 6, 0, 0]} maxBarSize={80}>
            <Cell fill={isPredictedHigher ? '#16a34a' : '#dc2626'} />
          </Bar>
          <Bar dataKey={avgLabel} fill="#93c5fd" radius={[6, 6, 0, 0]} maxBarSize={80} />
        </BarChart>
      </ResponsiveContainer>
      <p className={`text-xs font-medium ${isPredictedHigher ? 'text-green-600' : 'text-red-500'}`}>
        {isPredictedHigher
          ? `✅ Predicted yield is ${Math.round(((predicted - avg) / avg) * 100)}% above average`
          : `⚠️ Predicted yield is ${Math.round(((avg - predicted) / avg) * 100)}% below average`}
      </p>
    </div>
  )
}
