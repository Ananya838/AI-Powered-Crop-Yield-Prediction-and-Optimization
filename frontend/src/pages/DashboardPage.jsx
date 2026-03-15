import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

import { getPredictionDashboard } from '../services/api'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPredictionDashboard(10)
      .then(({ data }) => setDashboard(data))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Could not load dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = dashboard?.stats ?? {
    total_predictions: 0,
    average_yield_kg_per_ha: 0,
    total_area_hectares: 0,
    average_confidence_score: 0,
  }
  const yieldData = dashboard?.crop_yields ?? []
  const soilRadar = (dashboard?.soil_profile ?? []).map((item) => ({ ...item, A: item.value }))
  const history = dashboard?.recent_predictions ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Farm performance overview powered by saved prediction history.</p>
      </div>

      {error && (
        <div className="card border border-red-100 bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Predictions Made', value: stats.total_predictions.toLocaleString() },
          { label: 'Avg Yield (kg/ha)', value: Math.round(stats.average_yield_kg_per_ha).toLocaleString() },
          { label: 'Total Area (ha)', value: stats.total_area_hectares.toLocaleString() },
          { label: 'Avg Confidence', value: `${Math.round(stats.average_confidence_score * 100)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <div className="text-3xl font-extrabold text-primary-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Average Yield by Crop (kg/ha)</h2>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400">Loading chart...</div>
          ) : yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yieldData} margin={{ top: 5, right: 10, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kg/ha`, 'Yield']} />
                <Bar dataKey="yield" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">Make predictions to see crop trends.</div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Average Soil Health Profile</h2>
          {loading ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400">Loading chart...</div>
          ) : soilRadar.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={soilRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Soil" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">No soil data available yet.</div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Recent Predictions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Crop</th>
              <th className="pb-3 font-medium">Season</th>
              <th className="pb-3 font-medium">Yield (kg/ha)</th>
              <th className="pb-3 font-medium">Area (ha)</th>
              <th className="pb-3 font-medium">Total Yield (kg)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-500">{new Date(row.date).toLocaleString()}</td>
                <td className="py-3 font-medium capitalize">{row.crop}</td>
                <td className="py-3">{row.season}</td>
                <td className="py-3">{Math.round(row.yield_kg_per_ha).toLocaleString()}</td>
                <td className="py-3">{row.area_hectares}</td>
                <td className="py-3 font-semibold text-primary-600">
                  {Math.round(row.total_yield_kg).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && history.length === 0 && (
          <p className="text-xs text-gray-400 mt-3">No predictions saved yet. Submit a prediction to populate this dashboard.</p>
        )}
      </div>
    </div>
  )
}
