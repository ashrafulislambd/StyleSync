import apiClient from './apiClient'

export const getAllOutfits = () => apiClient.get('/outfits')
export const getOutfitById = (id) => apiClient.get(`/outfits/${id}`)
export const addOutfit = (formData) => apiClient.post('/outfits', formData)
export const generateOutfit = (userId) =>
    apiClient.post('/outfits/generate', { userId })
export const modifyOutfit = (id, data) => apiClient.patch(`/outfits/${id}`, data)
