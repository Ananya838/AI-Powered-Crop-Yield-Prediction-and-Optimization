import { useState } from 'react'
import { optimizeFarm } from '../services/api'
import { Loader2, AlertCircle, CheckCircle, ArrowUpCircle } from 'lucide-react'

const CROPS = [
  'rice', 'wheat', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
  'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana',
  'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange',
  'papaya', 'coconut', 'cotton', 'jute', 'coffee',
]
const SEASONS = ['Kharif', 'Rabi', 'Zaid']

const defaultForm = {
  crop_type: 'rice', season: 'Kharif', area_hectares: 2, budget_inr: '',
  nitrogen: 50, phosphorus: 20, potassium: 30, ph: 5.8, organic_carbon: 0.8,
  temperature: 28, rainfall: 400, humidity: 65, sunshine_hours: 8,
}

const priorityClass = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' }
const priorityBorder = { High: 'border-green-200 bg-green-50', Medium: 'border-yellow-200 bg-yellow-50', Low: 'border-red-200 bg-red-50' }

export default function OptimizePage() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        crop_type: form.crop_type,
        season: form.season,
        area_hectares: parseFloat(form.area_hectares),
        budget_inr: form.budget_inr ? parseFloat(form.budget_inr) : null,
        soil: {
          nitrogen: parseFloat(form.nitrogen),
          phosphorus: parseFloat(form.phosphorus),
          potassium: parseFloat(form.potassium),
          ph: parseFloat(form.ph),
          organic_carbon: parseFloat(form.organic_carbon),
        },
        weather: {
          temperature: parseFloat(form.temperature),
          rainfall: parseFloat(form.rainfall),
          humidity: parseFloat(form.humidity),
          sunshine_hours: parseFloat(form.sunshine_hours),
        },
      }
      const { data } = await optimizeFarm(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get optimization. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Farm Optimization</h1>
        <p className="text-gray-500 mt-1">Get personalized recommendations to maximize your crop yield.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Crop & Farm Details</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="label">Crop Type</label>
              <select className="input-field" value={form.crop_type} onChange={set('crop_type')}>
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Season</label>
              <select className="input-field" value={form.season} onChange={set('season')}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Area (ha)</label>
              <input type="number" step="0.1" min="0.1" className="input-field" value={form.area_hectares} onChange={set('area_hectares')} />
            </div>
            <div>
              <label className="label">Budget (₹, optional)</label>
              <input type="number" step="1000" min="0" className="input-field" value={form.budget_inr} onChange={set('budget_inr')} placeholder="e.g. 50000" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Soil Analysis</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'nitrogen', label: 'Nitrogen (kg/ha)', step: 1 },
              { key: 'phosphorus', label: 'Phosphorus (kg/ha)', step: 1 },
              { key: 'potassium', label: 'Potassium (kg/ha)', step: 1 },
              { key: 'ph', label: 'Soil pH', step: 0.1, min: 0, max: 14 },
              { key: 'organic_carbon', label: 'Organic Carbon (%)', step: 0.1, min: 0, max: 10 },
            ].map(({ key, label, step, min = 0, max = 200 }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="number" step={step} min={min} max={max} className="input-field" value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Weather Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'temperature', label: 'Temperature (°C)', step: 0.5 },
              { key: 'rainfall', label: 'Rainfall (mm/year)', step: 10 },
              { key: 'humidity', label: 'Humidity (%)', step: 1, max: 100 },
              { key: 'sunshine_hours', label: 'Sunshine Hours/day', step: 0.5, max: 16 },
            ].map(({ key, label, step, max = 5000 }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="number" step={step} min={0} max={max} className="input-field" value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ArrowUpCircle className="w-4 h-4" /> Get Recommendations</>}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card border-2 border-primary-100 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Optimization Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-extrabold text-red-600">
                  {result.current_estimated_yield_kg_per_ha.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Current (kg/ha)</div>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-xl">
                <div className="text-2xl font-extrabold text-primary-600">
                  {result.optimized_estimated_yield_kg_per_ha.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Optimized (kg/ha)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-extrabold text-blue-600">
                  +{result.yield_improvement_percent}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Improvement</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800">Recommendations ({result.recommendations.length})</h2>
            {result.recommendations.map((rec, i) => (
              <div key={i} className={`card border ${priorityBorder[rec.priority]}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{rec.category}</span>
                      <p className="text-sm text-gray-700 mt-0.5">{rec.action}</p>
                      <p className="text-xs text-primary-600 mt-1 font-medium">Expected: {rec.expected_improvement}</p>
                    </div>
                  </div>
                  <span className={priorityClass[rec.priority]}>{rec.priority}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alternative Crops */}
          {result.best_crop_alternatives.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Suggested Alternative Crops</h2>
              <div className="flex gap-3">
                {result.best_crop_alternatives.map((c) => (
                  <span key={c} className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold capitalize">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
