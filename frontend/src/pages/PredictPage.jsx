import { useState } from 'react'
import { predictYield } from '../services/api'
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react'
import WeatherFetcher from '../components/WeatherFetcher'

const CROPS = [
  'rice', 'wheat', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
  'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana',
  'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange',
  'papaya', 'coconut', 'cotton', 'jute', 'coffee',
]
const SEASONS = ['Kharif', 'Rabi', 'Zaid']

const defaultForm = {
  crop_type: 'rice',
  season: 'Kharif',
  area_hectares: 2,
  nitrogen: 90,
  phosphorus: 42,
  potassium: 43,
  ph: 6.5,
  organic_carbon: 2.1,
  temperature: 25,
  rainfall: 1200,
  humidity: 80,
  sunshine_hours: 7,
}

export default function PredictPage() {
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
      const { data } = await predictYield(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const categoryColor = {
    High: 'text-green-600 bg-green-50',
    Medium: 'text-yellow-600 bg-yellow-50',
    Low: 'text-red-600 bg-red-50',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crop Yield Prediction</h1>
        <p className="text-gray-500 mt-1">Enter your farm's soil and weather data to predict crop yield.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <WeatherFetcher
          onWeatherLoaded={(w) =>
            setForm((f) => ({
              ...f,
              temperature: w.temperature,
              rainfall: w.rainfall,
              humidity: w.humidity,
              sunshine_hours: w.sunshine_hours,
            }))
          }
        />
        {/* Crop Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Crop Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Crop Type</label>
              <select className="input-field" value={form.crop_type} onChange={set('crop_type')}>
                {CROPS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Season</label>
              <select className="input-field" value={form.season} onChange={set('season')}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Farm Area (hectares)</label>
              <input type="number" step="0.1" min="0.1" className="input-field" value={form.area_hectares} onChange={set('area_hectares')} />
            </div>
          </div>
        </div>

        {/* Soil Data */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Soil Analysis</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'nitrogen', label: 'Nitrogen (kg/ha)', min: 0, max: 200, step: 1 },
              { key: 'phosphorus', label: 'Phosphorus (kg/ha)', min: 0, max: 200, step: 1 },
              { key: 'potassium', label: 'Potassium (kg/ha)', min: 0, max: 200, step: 1 },
              { key: 'ph', label: 'Soil pH', min: 0, max: 14, step: 0.1 },
              { key: 'organic_carbon', label: 'Organic Carbon (%)', min: 0, max: 10, step: 0.1 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="number" step={step} min={min} max={max} className="input-field"
                  value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Weather Data */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Weather Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'temperature', label: 'Temperature (°C)', min: -10, max: 60, step: 0.5 },
              { key: 'rainfall', label: 'Annual Rainfall (mm)', min: 0, max: 5000, step: 10 },
              { key: 'humidity', label: 'Humidity (%)', min: 0, max: 100, step: 1 },
              { key: 'sunshine_hours', label: 'Sunshine Hours/day', min: 0, max: 16, step: 0.5 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="number" step={step} min={min} max={max} className="input-field"
                  value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><TrendingUp className="w-4 h-4" /> Predict Yield</>}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="card space-y-6 border-2 border-primary-100">
          <h2 className="text-xl font-bold text-gray-800">Prediction Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-3xl font-extrabold text-primary-700">
                {result.predicted_yield_kg_per_ha.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">kg / hectare</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-extrabold text-blue-700">
                {result.total_predicted_yield_kg.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total kg</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-extrabold text-purple-700">
                {(result.confidence_score * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Confidence</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${categoryColor[result.yield_category]}`}>
              <div className="text-3xl font-extrabold">{result.yield_category}</div>
              <div className="text-sm mt-1 opacity-75">Yield Category</div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Model used: {result.model_used}</p>
        </div>
      )}
    </div>
  )
}
