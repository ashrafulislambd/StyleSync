import apiClient from './apiClient'

export const getWeather = (location) =>
    apiClient.get('/weather', { params: location ? { location } : {} })
export const fetchLiveWeather = (location) =>
    apiClient.get(`/weather/fetch/${encodeURIComponent(location)}`)
export const addWeather = (data) => apiClient.post('/weather', data)
