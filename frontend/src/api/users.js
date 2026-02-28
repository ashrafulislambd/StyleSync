import apiClient from './apiClient'

export const getUsers = () => apiClient.get('/users')
export const getUserById = (id) => apiClient.get(`/users/${id}`)
export const createUser = (formData) => apiClient.post('/users', formData)
export const updateUser = (id, formData) => apiClient.put(`/users/${id}`, formData)
