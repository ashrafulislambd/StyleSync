import apiClient from './apiClient'

export const getAllClothes = (userId) =>
    apiClient.get('/clothes', { params: userId ? { userId } : {} })
export const getClothesById = (id) => apiClient.get(`/clothes/${id}`)
export const addClothes = (formData) => apiClient.post('/clothes', formData)
export const updateClothes = (id, formData) => apiClient.put(`/clothes/${id}`, formData)
export const deleteClothes = (id) => apiClient.delete(`/clothes/${id}`)
