/**
 * UPDATED: PredictPage.jsx
 * Changes:
 *   - GPS coords shared from WeatherFetcher → SoilFetcher (no second GPS prompt)
 *   - SoilFetcher panel auto-fills N, P, K, pH, OC fields
 *   - Language toggle (en / kn) using translations.js
 *   - YieldChart (recharts bar chart) shown after prediction results
 *   - All existing functionality preserved
 */
import { useState } from 'react'
import { predictYield } from '../services/api'
import { Loader2, TrendingUp, AlertCircle, Globe } from 'lucide-react'
import WeatherFetcher from '../components/WeatherFetcher'
import SoilFetcher from '../components/SoilFetcher'
import YieldChart from '../components/YieldChart'
import { t, LANGUAGES } from '../utils/translations'

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
  const [gpsCoords, setGpsCoords] = useState(null)   // { lat, lon } from WeatherFetcher GPS
  const [lang, setLang] = useState('en')

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
      {/* Header + Language Toggle */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('predict_title', lang)}</h1>
          <p className="text-gray-500 mt-1">{t('predict_subtitle', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            id="lang-select-predict"
            className="input-field !w-auto !py-1.5 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGUAGES.map(({ code, label, flag }) => (
              <option key={code} value={code}>{flag} {label}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Weather auto-fill — passes GPS coords to SoilFetcher */}
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
          onCoordsObtained={(lat, lon) => setGpsCoords({ lat, lon })}
        />

        {/* Soil auto-fill from GPS + SoilGrids */}
        <SoilFetcher
          coords={gpsCoords}
          lang={lang}
          onSoilLoaded={(s) =>
            setForm((f) => ({
              ...f,
              nitrogen: s.nitrogen,
              phosphorus: s.phosphorus,
              potassium: s.potassium,
              ph: s.ph,
              organic_carbon: s.organic_carbon,
            }))
          }
        />

        {/* Crop Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('crop_info', lang)}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">{t('crop_type', lang)}</label>
              <select className="input-field" value={form.crop_type} onChange={set('crop_type')}>
                {CROPS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('season', lang)}</label>
              <select className="input-field" value={form.season} onChange={set('season')}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('farm_area', lang)}</label>
              <input type="number" step="0.1" min="0.1" className="input-field" value={form.area_hectares} onChange={set('area_hectares')} />
            </div>
          </div>
        </div>

        {/* Soil Data — pre-filled by SoilFetcher but still editable */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('soil_analysis', lang)}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'nitrogen', labelKey: 'nitrogen', min: 0, max: 200, step: 1 },
              { key: 'phosphorus', labelKey: 'phosphorus', min: 0, max: 200, step: 1 },
              { key: 'potassium', labelKey: 'potassium', min: 0, max: 200, step: 1 },
              { key: 'ph', labelKey: 'soil_ph', min: 0, max: 14, step: 0.1 },
              { key: 'organic_carbon', labelKey: 'organic_carbon', min: 0, max: 10, step: 0.1 },
            ].map(({ key, labelKey, min, max, step }) => (
              <div key={key}>
                <label className="label">{t(labelKey, lang)}</label>
                <input type="number" step={step} min={min} max={max} className="input-field"
                  value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Weather Data */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('weather_conditions', lang)}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'temperature', labelKey: 'temperature', min: -10, max: 60, step: 0.5 },
              { key: 'rainfall', labelKey: 'rainfall', min: 0, max: 5000, step: 10 },
              { key: 'humidity', labelKey: 'humidity', min: 0, max: 100, step: 1 },
              { key: 'sunshine_hours', labelKey: 'sunshine', min: 0, max: 16, step: 0.5 },
            ].map(({ key, labelKey, min, max, step }) => (
              <div key={key}>
                <label className="label">{t(labelKey, lang)}</label>
                <input type="number" step={step} min={min} max={max} className="input-field"
                  value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', lang)}</>
            : <><TrendingUp className="w-4 h-4" />{t('predict_btn', lang)}</>}
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
          {/* Stat Cards (existing layout preserved) */}
          <div className="card space-y-6 border-2 border-primary-100">
            <h2 className="text-xl font-bold text-gray-800">{t('prediction_results', lang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-xl">
                <div className="text-3xl font-extrabold text-primary-700">
                  {result.predicted_yield_kg_per_ha.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('kg_per_ha', lang)}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-extrabold text-blue-700">
                  {result.total_predicted_yield_kg.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('total_kg', lang)}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-extrabold text-purple-700">
                  {(result.confidence_score * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('confidence', lang)}</div>
              </div>
              <div className={`text-center p-4 rounded-xl ${categoryColor[result.yield_category]}`}>
                <div className="text-3xl font-extrabold">{result.yield_category}</div>
                <div className="text-sm mt-1 opacity-75">{t('yield_category', lang)}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">{t('model_used', lang)}: {result.model_used}</p>
          </div>

          {/* Bar Chart — NEW addition below existing cards */}
          <YieldChart
            predicted={result.predicted_yield_kg_per_ha}
            cropType={form.crop_type}
            lang={lang}
          />
        </div>
      )}
    </div>
  )
}
