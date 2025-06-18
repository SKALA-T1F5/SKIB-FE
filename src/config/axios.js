import axios from 'axios'

// axios Instance 생성
const api = axios.create({
  baseURL: 'https://skib-backend.skala25a.project.skala-ai.com/api',
  headers: {
    accept: 'application/json',
  },
})

// Token을 요청 Header에 추가
api.interceptors.request.use((config) => {
  // 로그인 요청은 Token을 추가하지 않음.
  const isLoginRequest = config.url === '/auth/user/login'
  const token = localStorage.getItem('token')

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 세션 만료 안내
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.')
      localStorage.clear()
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
