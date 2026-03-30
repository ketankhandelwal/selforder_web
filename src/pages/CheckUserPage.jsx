import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkUser } from '../api/auth'
import Spinner from '../components/Spinner'

export default function CheckUserPage() {
  const { table, setPendingMobile } = useAuth()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
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
      <div className="auth-logo">🍽️ SelfOrder</div>
      {table && (
        <div style={{ marginBottom: 24, padding: '10px 14px', background: 'var(--surface-low)', borderRadius: 10 }}>
          <strong>{table.restaurantName}</strong>
          <span style={{ color: 'var(--on-surface-variant)', marginLeft: 8 }}>Table {table.tableNumber}</span>
        </div>
      )}
      <h2 style={{ marginBottom: 6 }}>Enter your mobile</h2>
      <p className="auth-subtitle">We'll check if you have an account</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
