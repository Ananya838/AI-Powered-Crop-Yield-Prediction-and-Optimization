import { useState, useEffect } from 'react'
import { getCrops } from '../services/api'
import { Leaf, Droplets, Thermometer, FlaskConical } from 'lucide-react'

export default function CropsPage() {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCrops()
      .then(({ data }) => setCrops(data))
      .catch(() => setCrops([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = crops.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.season.toLowerCase().includes(search.toLowerCase())
  )

  const seasonColor = { Kharif: 'bg-green-100 text-green-700', Rabi: 'bg-blue-100 text-blue-700', Zaid: 'bg-orange-100 text-orange-700' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crop Encyclopedia</h1>
        <p className="text-gray-500 mt-1">Explore ideal growing conditions for all supported crops.</p>
      </div>

      <input
        type="text"
        placeholder="Search crops by name or season..."
        className="input-field max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading crop data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((crop) => (
            <div key={crop.name} className="card hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-800">{crop.name}</h3>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${seasonColor[crop.season] || 'bg-gray-100 text-gray-600'}`}>
                  {crop.season}
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">{crop.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  {crop.ideal_temperature_min}–{crop.ideal_temperature_max}°C
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  {crop.ideal_rainfall_min}–{crop.ideal_rainfall_max} mm
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                  pH {crop.ideal_ph_min}–{crop.ideal_ph_max}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Leaf className="w-3.5 h-3.5 text-green-500" />
                  ~{crop.average_yield_kg_per_ha.toLocaleString()} kg/ha
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">No crops found matching "{search}".</div>
      )}
    </div>
  )
}
