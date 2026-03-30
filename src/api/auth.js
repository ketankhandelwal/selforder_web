import client from './client'

export const checkUser  = (mobile) =>
  client.post('/auth/check-user', { mobile }).then(r => r.data.data)

export const login = (mobile, pin) =>
  client.post('/auth/login', { mobile, pin }).then(r => r.data.data)

export const register = (mobile, pin) =>
  client.post('/auth/register', { mobile, pin }).then(r => r.data.data)

export const logoutApi = (refreshToken) =>
  client.post('/auth/logout', { refreshToken }).catch(() => {})
