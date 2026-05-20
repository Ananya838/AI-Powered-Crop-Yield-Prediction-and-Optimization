import { useState } from 'react'
import { Leaf, Loader2, AlertCircle, MapPin } from 'lucide-react'
import axios from 'axios'
import { t } from '../utils/translations'

/**
 * NEW FILE: SoilFetcher.jsx
 * Drop-in component that fetches real-time soil data from SoilGrids via the
 * /api/v1/soil/coords backend endpoint.
 *
 * Props:
 *   coords        — { lat, lon } obtained from WeatherFetcher's GPS fetch
 *   onSoilLoaded  — called with { nitrogen, phosphorus, potassium, ph, organic_carbon }
 *   lang          — 'en' | 'kn' for UI translation
 */
export default function SoilFetcher({ coords, onSoilLoaded, lang = 'en' }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const fetchSoil = async () => {
    if (!coords) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data } = await axios.get(
        `/api/v1/soil/coords?lat=${coords.lat}&lon=${coords.lon}`
      )
      setResult(data)
      onSoilLoaded({
        nitrogen: data.nitrogen,
        phosphorus: data.phosphorus,
        potassium: data.potassium,
        ph: data.ph,
        organic_carbon: data.organic_carbon,
      })
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Could not fetch soil data. Check backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  const isLive = result?.source === 'SoilGrids'

  return (
    <div className="card border border-green-100 bg-green-50/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-700 font-semibold">
          <Leaf className="w-5 h-5" />
          {t('auto_fill_soil', lang)}
        </div>
        {coords && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}
          </span>
        )}
      </div>

      {!coords ? (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          📍 {t('gps_required', lang)}
        </p>
      ) : (
        <button
          type="button"
          onClick={fetchSoil}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('fetching', lang)}
            </>
          ) : (
            <>
              <Leaf className="w-4 h-4" />
              {t('fetch_soil', lang)}
            </>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <p className={`text-xs font-semibold ${isLive ? 'text-green-600' : 'text-amber-600'}`}>
            {isLive ? t('soil_filled', lang) : t('soil_default', lang)}
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              { label: t('soil_ph', lang), value: result.ph },
              { label: t('organic_carbon', lang), value: `${result.organic_carbon}%` },
              { label: 'N', value: `${result.nitrogen} kg/ha` },
              { label: 'P', value: `${result.phosphorus} kg/ha` },
              { label: 'K', value: `${result.potassium} kg/ha` },
            ].map(({ label, value }) => (
              <span
                key={label}
                className="bg-white border border-green-100 rounded-lg px-3 py-1.5 text-gray-600"
              >
                <span className="font-medium text-gray-700">{label}:</span> {value}
              </span>
            ))}
          </div>
          {result.note && (
            <p className="text-xs text-gray-400">{result.note}</p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Powered by{' '}
        <a
          href="https://soilgrids.org"
          target="_blank"
          rel="noreferrer"
          className="underline text-green-600"
        >
          ISRIC SoilGrids
        </a>{' '}
        — free public soil database (no API key required).
      </p>
    </div>
  )
}
