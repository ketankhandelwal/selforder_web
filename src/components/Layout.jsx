import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { logoutApi } from '../api/auth'

export default function Layout({ children }) {
  const { table, user, logout, accessToken } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    const rt = localStorage.getItem('so_refresh_token')
    await logoutApi(rt)
    logout()
    navigate('/no-table', { replace: true })
  }

  const tab = pathname.startsWith('/orders') ? 'orders' : 'menu'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--surface-lowest)',
        borderBottom: '1px solid var(--surface-low)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)', lineHeight: 1.2 }}>
            {table?.restaurantName || 'SelfOrder'}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>
            Table {table?.tableNumber} · {user?.mobile}
          </div>
        </div>

        {/* Cart icon */}
        {pathname !== '/cart' && (
          <button
            onClick={() => navigate('/cart')}
            style={{
              position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', padding: 8, borderRadius: 8,
            }}
            aria-label="Cart"
          >
            🛒
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--primary)', color: 'white',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, fontSize: 18 }}
          aria-label="Logout"
        >
          🚪
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-low)', paddingBottom: 'var(--bottom-nav-h)' }}>
        {children}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--surface-lowest)',
        borderTop: '1px solid var(--surface-low)',
        display: 'flex', height: 'var(--bottom-nav-h)', zIndex: 100,
      }}>
        {[
          { key: 'menu',   label: 'Menu',   icon: '🍽️',  path: '/menu' },
          { key: 'orders', label: 'Orders', icon: '📋',  path: '/orders' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.key ? 'var(--primary)' : 'var(--on-surface-variant)',
              fontWeight: tab === t.key ? 700 : 400,
              fontSize: '.7rem',
              transition: 'color .15s',
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
