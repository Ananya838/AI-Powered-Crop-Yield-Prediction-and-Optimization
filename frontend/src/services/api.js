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

export default api
