import apiClient from './apiClient'

export const getAllLaundry = (userId) =>
    apiClient.get('/laundry', { params: userId ? { userId } : {} })
export const addLaundry = (data) => apiClient.post('/laundry', data)
export const updateLaundry = (id, data) => apiClient.put(`/laundry/${id}`, data)
