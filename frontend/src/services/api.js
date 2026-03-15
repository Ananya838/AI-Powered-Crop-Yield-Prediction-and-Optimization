import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export const predictYield = (data) => api.post('/predictions/', data)
export const optimizeFarm = (data) => api.post('/optimization/', data)
export const getCrops = () => api.get('/crops/')
export const getCropNames = () => api.get('/crops/names')
export const getCropDetail = (name) => api.get(`/crops/${name}`)
export const getSupportedCrops = () => api.get('/predictions/supported-crops')
export const getPredictionDashboard = (limit = 10) => api.get(`/predictions/dashboard?limit=${limit}`)
export const getWeatherByCity = (city) => api.get(`/weather/city/${encodeURIComponent(city)}`)
export const getWeatherByCoords = (lat, lon) => api.get(`/weather/coords?lat=${lat}&lon=${lon}`)

export default api
