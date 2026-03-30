import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkUser } from '../api/auth'
import Spinner from '../components/Spinner'

export default function CheckUserPage() {
  const { table, setPendingMobile } = useAuth()
  const navigate = useNavigate()
  const [mobile, setMobile]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mobile.length !== 10) return
    setLoading(true)
    setError(null)
    try {
      const data = await checkUser(mobile)
      setPendingMobile(mobile)
      navigate('/auth/pin', { state: { exists: data.exists } })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div className="auth-logo">SelfOrder</div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem', fontWeight: 500 }}>
          The culinary experience, simplified.
        </p>
      </div>

      {/* Table badge */}
      {table && (
        <div style={{
          marginBottom: 28,
          padding: '12px 16px',
          background: 'var(--primary-fixed)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'linear-gradient(135deg,#a73400,#cc4911)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2h18M3 22h18M3 12h18M12 2v20"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '.9rem', color: 'var(--on-primary-fixed)',
            }}>
              {table.restaurantName}
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--on-primary-fixed)', opacity: .7 }}>
              Table {table.tableNumber}
            </div>
          </div>
        </div>
      )}

      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: '1.2rem', color: 'var(--on-surface)',
        marginBottom: 6,
      }}>
        Enter your mobile
      </h2>
      <p className="auth-subtitle">We'll check if you have an account</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          className="input"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={mobile}
          maxLength={10}
          onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          autoFocus
        />
        {error && <p className="error-text">{error}</p>}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={mobile.length !== 10 || loading}
        >
          {loading ? <Spinner size={20} /> : 'Continue'}
        </button>
      </form>
    </div>
  )
}
