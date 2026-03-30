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
      <div className="auth-logo">🍽️ SelfOrder</div>
      <h2 style={{ marginBottom: 6 }}>
        {isRegister ? 'Create your PIN' : 'Welcome back!'}
      </h2>
      <p className="auth-subtitle" style={{ marginBottom: 40 }}>
        {isRegister
          ? 'Set a 4-digit PIN for quick access'
          : `Enter PIN for ${pendingMobile}`}
      </p>

      {loading
        ? <Spinner size={36} />
        : <PinInput onComplete={handlePin} disabled={loading} />
      }

      {error && <p className="error-text" style={{ marginTop: 20 }}>{error}</p>}

      <button
        onClick={() => navigate('/auth')}
        style={{ marginTop: 32, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: '.9rem' }}
      >
        ← Change number
      </button>
    </div>
  )
}
