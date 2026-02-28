import axios from 'axios'

const apiClient = axios.create({
    baseURL: '/api',
    timeout: 15000,
})

apiClient.interceptors.response.use(
    res => res,
    err => {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message
        return Promise.reject(new Error(msg))
    }
)

export default apiClient
