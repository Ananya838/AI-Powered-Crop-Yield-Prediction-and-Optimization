import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const yieldData = [
  { crop: 'Rice', yield: 4200 },
  { crop: 'Wheat', yield: 3500 },
  { crop: 'Maize', yield: 4800 },
  { crop: 'Cotton', yield: 1800 },
  { crop: 'Chickpea', yield: 1500 },
  { crop: 'Mango', yield: 10000 },
  { crop: 'Banana', yield: 20000 },
  { crop: 'Coffee', yield: 900 },
]

const soilRadar = [
  { subject: 'Nitrogen', A: 90, fullMark: 200 },
  { subject: 'Phosphorus', A: 42, fullMark: 150 },
  { subject: 'Potassium', A: 43, fullMark: 200 },
  { subject: 'Org Carbon', A: 52, fullMark: 100 },
  { subject: 'pH Score', A: 75, fullMark: 100 },
]

const SAMPLE_HISTORY = [
  { date: 'Jan 2026', crop: 'Rice', yield: 4100, area: 2 },
  { date: 'Feb 2026', crop: 'Wheat', yield: 3400, area: 3 },
  { date: 'Mar 2026', crop: 'Maize', yield: 5200, area: 1.5 },
  { date: 'Apr 2026', crop: 'Chickpea', yield: 1450, area: 2.5 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Farm performance overview and crop yield benchmarks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Predictions Made', value: '4' },
          { label: 'Avg Yield (kg/ha)', value: '3,538' },
          { label: 'Total Area (ha)', value: '9' },
          { label: 'Avg Confidence', value: '82%' },
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yieldData} margin={{ top: 5, right: 10, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="crop" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} kg/ha`, 'Yield']} />
              <Bar dataKey="yield" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Soil Health Profile (Sample)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={soilRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Soil" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
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
              <th className="pb-3 font-medium">Yield (kg/ha)</th>
              <th className="pb-3 font-medium">Area (ha)</th>
              <th className="pb-3 font-medium">Total Yield (kg)</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_HISTORY.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-500">{row.date}</td>
                <td className="py-3 font-medium capitalize">{row.crop}</td>
                <td className="py-3">{row.yield.toLocaleString()}</td>
                <td className="py-3">{row.area}</td>
                <td className="py-3 font-semibold text-primary-600">
                  {(row.yield * row.area).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">
          * History is sample data. Connect your database to persist real predictions.
        </p>
      </div>
    </div>
  )
}
