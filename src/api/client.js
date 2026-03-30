import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const client = axios.create({ baseURL: BASE, timeout: 15000 })

// Attach access token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('so_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let refreshing = false
let queue = []

client.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { original.headers.Authorization = `Bearer ${token}`; return client(original) })
      }
      original._retry = true
      refreshing = true
      try {
        const rt = localStorage.getItem('so_refresh_token')
        if (!rt) throw new Error('no refresh token')
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt })
        if (data.success) {
          localStorage.setItem('so_access_token', data.data.accessToken)
          localStorage.setItem('so_refresh_token', data.data.refreshToken)
          queue.forEach(p => p.resolve(data.data.accessToken))
          queue = []
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return client(original)
        }
        throw new Error('refresh failed')
      } catch {
        queue.forEach(p => p.reject(err))
        queue = []
        Object.keys(localStorage).filter(k => k.startsWith('so_')).forEach(k => localStorage.removeItem(k))
        window.location.href = '/no-table'
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default client
