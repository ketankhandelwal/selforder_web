import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const K = {
  ACCESS:  'so_access_token',
  REFRESH: 'so_refresh_token',
  USER:    'so_user',
  TABLE:   'so_table',
  MOBILE:  'so_pending_mobile',
}

const load = (key, parse = false) => {
  try {
    const v = localStorage.getItem(key)
    return parse ? JSON.parse(v) : v
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => load(K.ACCESS))
  const [user,        setUserState]   = useState(() => load(K.USER, true))
  const [table,       setTableState]  = useState(() => load(K.TABLE, true))
  const [pendingMobile, setPendingMobileState] = useState(() => load(K.MOBILE) || '')

  const saveTokens = useCallback((access, refresh) => {
    localStorage.setItem(K.ACCESS, access)
    localStorage.setItem(K.REFRESH, refresh)
    setAccessToken(access)
  }, [])

  const saveUser = useCallback((u) => {
    localStorage.setItem(K.USER, JSON.stringify(u))
    setUserState(u)
  }, [])

  const saveTable = useCallback((t) => {
    localStorage.setItem(K.TABLE, JSON.stringify(t))
    setTableState(t)
  }, [])

  const setPendingMobile = useCallback((m) => {
    localStorage.setItem(K.MOBILE, m)
    setPendingMobileState(m)
  }, [])

  const logout = useCallback(() => {
    Object.values(K).forEach(k => localStorage.removeItem(k))
    setAccessToken(null)
    setUserState(null)
    setTableState(null)
    setPendingMobileState('')
  }, [])

  return (
    <AuthContext.Provider value={{
      accessToken,
      user,
      table,
      pendingMobile,
      isAuthenticated: !!accessToken,
      hasTable: !!table?.restaurantId,
      saveTokens,
      saveUser,
      saveTable,
      setPendingMobile,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
