import apiClient from './apiClient'

export const getWardrobeAnalytics = () => apiClient.get('/analytics/wardrobe')
