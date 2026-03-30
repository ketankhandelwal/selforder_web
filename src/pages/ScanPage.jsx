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
  }, []) // eslint-disable-line

  if (error) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center', minHeight: '100dvh',
      background: 'var(--surface-lowest)',
    }}>
      <div style={{
        width: 72, height: 72, background: 'var(--error-container)',
        borderRadius: 9999, margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--on-error-container)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800, fontSize: '1.2rem',
        color: 'var(--on-surface)', marginBottom: 8,
      }}>
        QR Code Error
      </h2>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem', lineHeight: 1.5 }}>{error}</p>
    </div>
  )

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, minHeight: '100dvh',
      background: 'var(--surface-lowest)',
    }}>
      <Spinner size={40} />
      <p style={{
        color: 'var(--on-surface-variant)', fontWeight: 500,
        fontFamily: "'Manrope', sans-serif",
      }}>
        Setting up your table…
      </p>
    </div>
  )
}
