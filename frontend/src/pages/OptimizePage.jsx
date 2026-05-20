/**
 * UPDATED: OptimizePage.jsx
 * Changes:
 *   - GPS coords shared from WeatherFetcher → SoilFetcher
 *   - SoilFetcher auto-fills soil fields
 *   - Language toggle (en / kn)
 *   - Recommendation category labels translated
 *   - All existing UI preserved
 */
import { useState } from 'react'
import { optimizeFarm } from '../services/api'
import { Loader2, AlertCircle, CheckCircle, ArrowUpCircle, Globe } from 'lucide-react'
import WeatherFetcher from '../components/WeatherFetcher'
import SoilFetcher from '../components/SoilFetcher'
import { t, LANGUAGES } from '../utils/translations'

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
const priorityBorder = {
  High: 'border-green-200 bg-green-50',
  Medium: 'border-yellow-200 bg-yellow-50',
  Low: 'border-red-200 bg-red-50',
}

export default function OptimizePage() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gpsCoords, setGpsCoords] = useState(null)
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
      {/* Header + Language Toggle */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('optimize_title', lang)}</h1>
          <p className="text-gray-500 mt-1">{t('optimize_subtitle', lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            id="lang-select-optimize"
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
        {/* Weather auto-fill */}
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

        {/* Soil auto-fill from SoilGrids */}
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

        {/* Crop & Farm Details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('crop_farm_details', lang)}</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="label">{t('crop_type', lang)}</label>
              <select className="input-field" value={form.crop_type} onChange={set('crop_type')}>
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('season', lang)}</label>
              <select className="input-field" value={form.season} onChange={set('season')}>
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('area_ha', lang)}</label>
              <input type="number" step="0.1" min="0.1" className="input-field" value={form.area_hectares} onChange={set('area_hectares')} />
            </div>
            <div>
              <label className="label">{t('budget', lang)}</label>
              <input type="number" step="1000" min="0" className="input-field" value={form.budget_inr} onChange={set('budget_inr')} placeholder="e.g. 50000" />
            </div>
          </div>
        </div>

        {/* Soil Analysis */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('soil_analysis', lang)}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'nitrogen', labelKey: 'nitrogen', step: 1 },
              { key: 'phosphorus', labelKey: 'phosphorus', step: 1 },
              { key: 'potassium', labelKey: 'potassium', step: 1 },
              { key: 'ph', labelKey: 'soil_ph', step: 0.1, min: 0, max: 14 },
              { key: 'organic_carbon', labelKey: 'organic_carbon', step: 0.1, min: 0, max: 10 },
            ].map(({ key, labelKey, step, min = 0, max = 200 }) => (
              <div key={key}>
                <label className="label">{t(labelKey, lang)}</label>
                <input type="number" step={step} min={min} max={max} className="input-field" value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">{t('weather_conditions', lang)}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'temperature', labelKey: 'temperature', step: 0.5 },
              { key: 'rainfall', labelKey: 'rainfall_yr', step: 10 },
              { key: 'humidity', labelKey: 'humidity', step: 1, max: 100 },
              { key: 'sunshine_hours', labelKey: 'sunshine', step: 0.5, max: 16 },
            ].map(({ key, labelKey, step, max = 5000 }) => (
              <div key={key}>
                <label className="label">{t(labelKey, lang)}</label>
                <input type="number" step={step} min={0} max={max} className="input-field" value={form[key]} onChange={set(key)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', lang)}</>
            : <><ArrowUpCircle className="w-4 h-4" />{t('optimize_btn', lang)}</>}
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
            <h2 className="text-xl font-bold text-gray-800">{t('optimization_summary', lang)}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-extrabold text-red-600">
                  {result.current_estimated_yield_kg_per_ha.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('current_kg_ha', lang)}</div>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-xl">
                <div className="text-2xl font-extrabold text-primary-600">
                  {result.optimized_estimated_yield_kg_per_ha.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('optimized_kg_ha', lang)}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-extrabold text-blue-600">
                  +{result.yield_improvement_percent}%
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('improvement', lang)}</div>
              </div>
            </div>
          </div>

          {/* Recommendations — category labels translated */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800">
              {t('recommendations', lang)} ({result.recommendations.length})
            </h2>
            {result.recommendations.map((rec, i) => (
              <div key={i} className={`card border ${priorityBorder[rec.priority]}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t(rec.category, lang)}
                      </span>
                      <p className="text-sm text-gray-700 mt-0.5">{rec.action}</p>
                      <p className="text-xs text-primary-600 mt-1 font-medium">
                        {t('expected', lang)}: {rec.expected_improvement}
                      </p>
                    </div>
                  </div>
                  <span className={priorityClass[rec.priority]}>{t(rec.priority, lang)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alternative Crops */}
          {result.best_crop_alternatives.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{t('alternative_crops', lang)}</h2>
              <div className="flex gap-3 flex-wrap">
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
