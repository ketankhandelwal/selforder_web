import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { scanQr } from '../api/qr'
import Spinner from '../components/Spinner'

export default function ScanPage() {
  const { token } = useParams()
  const { saveTable, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    scanQr(token)
      .then(data => {
        saveTable({
          restaurantId:   data.restaurant_id,
          restaurantName: data.restaurant_name,
          tableId:        data.table_id,
          tableNumber:    data.table_number,
        })
        navigate(isAuthenticated ? '/menu' : '/auth', { replace: true })
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Invalid or expired QR code. Please scan again.')
      })
  }, [])   // eslint-disable-line

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', minHeight: '100dvh' }}>
      <div style={{ fontSize: 56 }}>⚠️</div>
      <h2 style={{ marginTop: 16, color: 'var(--on-surface)' }}>QR Code Error</h2>
      <p style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>{error}</p>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: '100dvh' }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--on-surface-variant)' }}>Setting up your table…</p>
    </div>
  )
}
