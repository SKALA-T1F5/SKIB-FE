// src/api/axios.ts
import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: 'http://10.250.73.244:8080/api',
  withCredentials: true
})

// 요청 인터셉터 (토큰 자동 첨부)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const isAuthRoute = config.url?.includes('/auth/user/login') || config.url?.includes('/auth/user/register')
    if (!isAuthRoute && token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('🔒 인증 만료: 로그아웃 처리됨')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api


