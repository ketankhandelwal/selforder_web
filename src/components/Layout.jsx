import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { logoutApi } from '../api/auth'

export default function Layout({ children }) {
  const { table, user, logout } = useAuth()
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
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 2px 16px rgba(27,28,25,.06)',
      }}>
        {/* Avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: 9999, flexShrink: 0,
          background: 'linear-gradient(135deg,#a73400,#cc4911)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 2 4 5 4 9c0 2.5 1.5 4.5 3 6l1 7h8l1-7c1.5-1.5 3-3.5 3-6 0-4-4-7-8-7z"/>
            <path d="M8.5 2.5C8.5 2.5 10 4 12 4s3.5-1.5 3.5-1.5"/>
          </svg>
        </div>

        {/* Restaurant info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '.95rem',
            color: 'var(--on-surface)', lineHeight: 1.2,
            letterSpacing: '-.01em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {table?.restaurantName || 'SelfOrder'}
          </div>
          <div style={{
            fontSize: '.65rem', color: 'var(--on-surface-variant)',
            fontWeight: 600, marginTop: 1,
            letterSpacing: '.06em', textTransform: 'uppercase',
          }}>
            Table {table?.tableNumber}
          </div>
        </div>

        {/* Cart icon */}
        {pathname !== '/cart' && (
          <button
            onClick={() => navigate('/cart')}
            style={{
              position: 'relative',
              background: count > 0 ? 'var(--primary-fixed)' : 'var(--surface-low)',
              border: 'none', cursor: 'pointer',
              width: 40, height: 40, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
            aria-label="Cart"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke={count > 0 ? 'var(--primary)' : 'var(--on-surface-variant)'}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.75l1.29-8.25H6"/>
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'linear-gradient(135deg,#a73400,#cc4911)', color: 'white',
                borderRadius: 9999, minWidth: 18, height: 18,
                padding: '0 4px', fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface-lowest)',
              }}>
                {count}
              </span>
            )}
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--surface-low)', border: 'none', cursor: 'pointer',
            width: 40, height: 40, borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Logout"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="var(--on-surface-variant)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
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
        display: 'flex', height: 'var(--bottom-nav-h)', zIndex: 100,
        boxShadow: '0 -4px 20px rgba(27,28,25,.07)',
      }}>
        {[
          { key: 'menu',   label: 'Menu',   path: '/menu',
            icon: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'var(--primary)' : 'var(--on-surface-variant)'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            ),
          },
          { key: 'orders', label: 'Orders', path: '/orders',
            icon: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'var(--primary)' : 'var(--on-surface-variant)'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            ),
          },
        ].map(t => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'relative',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 32, height: 3, borderRadius: '0 0 4px 4px',
                  background: 'linear-gradient(135deg,#a73400,#cc4911)',
                }} />
              )}
              {t.icon(isActive)}
              <span style={{
                fontSize: '.65rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                fontFamily: "'Manrope', sans-serif", letterSpacing: '.04em',
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
