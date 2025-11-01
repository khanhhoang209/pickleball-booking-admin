import axios from 'axios'
import { toast } from 'sonner'

const baseURL = import.meta.env.VITE_BACKEND_URL

const instance = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

let navigate: ((path: string) => void) | null = null
export const setNavigate = (navigateFunction: (path: string) => void) => {
  navigate = navigateFunction
}

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (navigate && window.location.pathname !== '/login') {
        navigate('/login')
        toast.error('Session expired. Please log in again!')
      } else if (!navigate && window.location.pathname !== '/login') {
        window.location.href = '/login'
        toast.error('Session expired. Please log in again!')
      }
    }
    return Promise.reject(error)
  }
)

export default instance
