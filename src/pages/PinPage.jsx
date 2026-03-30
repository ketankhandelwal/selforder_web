import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'
import PinInput from '../components/PinInput'
import Spinner from '../components/Spinner'

export default function PinPage() {
  const { pendingMobile, saveTokens, saveUser } = useAuth()
  const navigate  = useNavigate()
  const { state } = useLocation()
  const isRegister = !state?.exists

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handlePin = async (pin) => {
    setLoading(true)
    setError(null)
    try {
      const apiFn = isRegister ? register : login
      const data  = await apiFn(pendingMobile, pin)
      saveTokens(data.accessToken, data.refreshToken)
      saveUser(data.user)
      navigate('/menu', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect PIN. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div style={{ marginBottom: 8 }}>
        <div className="auth-logo">SelfOrder</div>
      </div>

      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: '1.25rem',
        color: 'var(--on-surface)', marginBottom: 8,
      }}>
        {isRegister ? 'Create your PIN' : 'Welcome back!'}
      </h2>
      <p className="auth-subtitle" style={{ marginBottom: 36 }}>
        {isRegister
          ? 'Set a 4-digit PIN for quick access'
          : `Enter your PIN for ${pendingMobile}`}
      </p>

      {loading
        ? <Spinner size={36} />
        : <PinInput onComplete={handlePin} disabled={loading} />
      }

      {error && (
        <p className="error-text" style={{ marginTop: 20 }}>{error}</p>
      )}

      <button
        onClick={() => navigate('/auth')}
        style={{
          marginTop: 36, background: 'none', border: 'none',
          color: 'var(--on-surface-variant)', cursor: 'pointer',
          fontSize: '.88rem', fontWeight: 600,
          fontFamily: "'Manrope', sans-serif",
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface-variant)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Change number
      </button>
    </div>
  )
}
