import { useState } from 'react'
import { MapPin, Loader2, CloudSun, AlertCircle, Navigation } from 'lucide-react'
import axios from 'axios'

/**
 * WeatherFetcher — drop-in component that fetches real-time weather
 * and calls onWeatherLoaded({ temperature, rainfall, humidity, sunshine_hours })
 * so parent forms can auto-fill their weather fields.
 */
export default function WeatherFetcher({ onWeatherLoaded }) {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const fetchByCity = async (e) => {
    e.preventDefault()
    if (!city.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await axios.get(`/api/v1/weather/city/${encodeURIComponent(city.trim())}`)
      setResult(data)
      onWeatherLoaded({
        temperature: data.temperature,
        rainfall: data.rainfall,
        humidity: data.humidity,
        sunshine_hours: data.sunshine_hours,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not fetch weather. Check city name or API key.')
    } finally {
      setLoading(false)
    }
  }

  const fetchByGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    setError(null)
    setResult(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await axios.get(
            `/api/v1/weather/coords?lat=${coords.latitude}&lon=${coords.longitude}`
          )
          setResult(data)
          setCity(data.city || '')
          onWeatherLoaded({
            temperature: data.temperature,
            rainfall: data.rainfall,
            humidity: data.humidity,
            sunshine_hours: data.sunshine_hours,
          })
        } catch (err) {
          setError(err.response?.data?.detail || 'Could not fetch weather for your location.')
        } finally {
          setLocating(false)
        }
      },
      () => {
        setError('Location access denied. Enter city name manually.')
        setLocating(false)
      }
    )
  }

  return (
    <div className="card border border-blue-100 bg-blue-50/40 space-y-3">
      <div className="flex items-center gap-2 text-blue-700 font-semibold">
        <CloudSun className="w-5 h-5" />
        Auto-fill Weather from Real-Time Data
      </div>

      <form onSubmit={fetchByCity} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Enter city name (e.g. Mumbai, Delhi, London)"
            className="input-field pl-9"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading || !city.trim()} className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudSun className="w-4 h-4" />}
          Fetch Weather
        </button>
        <button
          type="button"
          onClick={fetchByGPS}
          disabled={locating}
          title="Use my current location"
          className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          My Location
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 font-medium text-gray-700">
            📍 {result.city}{result.country ? `, ${result.country}` : ''}
          </span>
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-gray-600">
            🌡 {result.temperature}°C
          </span>
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-gray-600">
            💧 {result.humidity}% humidity
          </span>
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-gray-600">
            🌧 {result.rainfall} mm/yr
          </span>
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-gray-600">
            ☀️ {result.sunshine_hours}h sun/day
          </span>
          <span className="bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-gray-600">
            {result.description}
          </span>
          <span className="text-xs text-green-600 font-semibold self-center">✅ Weather fields auto-filled below</span>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Powered by OpenWeatherMap. Needs <code>OPENWEATHER_API_KEY</code> in <code>backend/.env</code>.
        Get a free key at{' '}
        <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="underline text-blue-500">
          openweathermap.org
        </a>
      </p>
    </div>
  )
}
