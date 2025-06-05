// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://10.250.73.244:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ 세션 만료 안내
      alert('세션이 만료되었습니다. 다시 로그인해주세요.')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

export default api
