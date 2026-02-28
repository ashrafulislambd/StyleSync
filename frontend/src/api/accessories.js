import apiClient from './apiClient'

export const getAllAccessories = (userId) =>
    apiClient.get('/accessories', { params: userId ? { userId } : {} })
export const getAccessoryById = (id) => apiClient.get(`/accessories/${id}`)
export const addAccessory = (formData) => apiClient.post('/accessories', formData)
export const updateAccessory = (id, formData) => apiClient.put(`/accessories/${id}`, formData)
export const deleteAccessory = (id) => apiClient.delete(`/accessories/${id}`)
