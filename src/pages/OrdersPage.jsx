import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const STATUS_LABELS = {
  pending:   { label: 'Pending',   cls: 'chip-pending' },
  confirmed: { label: 'Confirmed', cls: 'chip-confirmed' },
  ready:     { label: 'Ready',     cls: 'chip-ready' },
  delivered: { label: 'Delivered', cls: 'chip-delivered' },
  cancelled: { label: 'Cancelled', cls: 'chip-cancelled' },
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/** Group a flat list of orders into session clusters */
function groupBySessions(orders) {
  const sessionMap = new Map()
  const noSession  = []

  for (const order of orders) {
    if (!order.session_id) {
      noSession.push(order)
      continue
    }
    if (!sessionMap.has(order.session_id)) {
      sessionMap.set(order.session_id, {
        sessionId:     order.session_id,
        sessionStatus: order.session_status,
        orders: [],
      })
    }
    sessionMap.get(order.session_id).orders.push(order)
  }

  const sessions = Array.from(sessionMap.values())
  // Each session's orders are already DESC by created_at from backend; keep that
  return { sessions, noSession }
}

function SessionCluster({ session, onClickOrder }) {
  const [expanded, setExpanded] = useState(true)

  const total = session.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + parseFloat(o.total_amount), 0)

  const itemCount = session.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (Array.isArray(o.items) ? o.items.length : 0), 0)

  const isSettled = session.sessionStatus === 'settled'

  return (
    <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      {/* Session header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          background: isSettled ? 'var(--surface-low)' : 'var(--primary-container, #e8f0fe)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '.9rem', color: isSettled ? 'var(--on-surface-variant)' : 'var(--primary)' }}>
            {isSettled ? 'Past Visit' : 'Current Visit'}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
            {session.orders.length} order{session.orders.length !== 1 ? 's' : ''} · {itemCount} item{itemCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, color: isSettled ? 'var(--on-surface-variant)' : 'var(--primary)', fontSize: '1rem' }}>
            ₹{total.toFixed(0)}
          </span>
          <span style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Orders in this session */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {session.orders.map((order, idx) => {
            const st = STATUS_LABELS[order.status] || { label: order.status, cls: 'chip-cancelled' }
            return (
              <div
                key={order.id}
                onClick={() => onClickOrder(order.id)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--surface-low)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{order.order_number}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>
                    {fmtDate(order.ordered_at)} · {Array.isArray(order.items) ? order.items.length : 0} item{order.items?.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`chip ${st.cls}`} style={{ fontSize: '.7rem', padding: '2px 8px' }}>{st.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '.88rem' }}>
                    ₹{parseFloat(order.total_amount).toFixed(0)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { table } = useAuth()
  const navigate  = useNavigate()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = () => {
    setLoading(true)
    getMyOrders(table.restaurantId)
      .then(setOrders)
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const { sessions, noSession } = groupBySessions(orders)

  return (
    <Layout>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>My Orders</h2>
          <button
            onClick={load}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '.9rem' }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && <Spinner center />}
        {error   && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56 }}>📋</div>
            <p style={{ marginTop: 16, color: 'var(--on-surface-variant)' }}>No orders yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ marginTop: 24, maxWidth: 180 }}>
              Go to Menu
            </button>
          </div>
        )}

        {/* Session clusters */}
        {sessions.map(session => (
          <SessionCluster
            key={session.sessionId}
            session={session}
            onClickOrder={id => navigate(`/orders/${id}`)}
          />
        ))}

        {/* Orders without a session (legacy / fallback) */}
        {noSession.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {noSession.map(order => {
              const st = STATUS_LABELS[order.status] || { label: order.status, cls: 'chip-cancelled' }
              return (
                <div
                  key={order.id}
                  className="card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{order.order_number}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                        {fmtDate(order.ordered_at)}
                      </div>
                    </div>
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '.85rem' }}>
                      {Array.isArray(order.items) ? order.items.length : 0} item{order.items?.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parseFloat(order.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
