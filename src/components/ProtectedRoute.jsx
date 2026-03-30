
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, hasTable } = useAuth()

  if (!hasTable)        return <Navigate to="/no-table" replace />
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  return <Outlet />
}
