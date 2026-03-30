import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetail } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const STATUS_LABELS = {
  pending:   { label: 'Pending',   cls: 'chip-pending',   icon: '⏳' },
  confirmed: { label: 'Confirmed', cls: 'chip-confirmed', icon: '✅' },
  ready:     { label: 'Ready',     cls: 'chip-ready',     icon: '🔔' },
  delivered: { label: 'Delivered', cls: 'chip-delivered', icon: '🎉' },
  cancelled: { label: 'Cancelled', cls: 'chip-cancelled', icon: '❌' },
}

const STATUS_ORDER = ['pending', 'confirmed', 'ready', 'delivered']

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function OrderDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getOrderDetail(id)
      .then(setOrder)
      .catch(err => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false))
  }, [id])

  const st = order ? (STATUS_LABELS[order.status] || { label: order.status, cls: 'chip-cancelled', icon: '' }) : null

  return (
    <Layout>
      <div style={{ padding: 16 }}>
        <button
          onClick={() => navigate('/orders')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, marginBottom: 16, padding: 0 }}
        >
          ← My Orders
        </button>

        {loading && <Spinner center />}
        {error   && <p className="error-text">{error}</p>}

        {order && (
          <>
            {/* Header */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{order.order_number}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                    Table {order.table_number}
                  </div>
                </div>
                <span className={`chip ${st.cls}`}>{st.icon} {st.label}</span>
              </div>
            </div>

            {/* Status timeline */}
            {order.status !== 'cancelled' && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                  ORDER STATUS
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STATUS_ORDER.map((s, i) => {
                    const idx = STATUS_ORDER.indexOf(order.status)
                    const done = i <= idx
                    const timestamps = {
                      pending:   order.ordered_at,
                      confirmed: order.confirmed_at,
                      ready:     order.ready_at,
                      delivered: order.delivered_at,
                    }
                    return (
                      <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {i > 0 && <div style={{ flex: 1, height: 2, background: done ? 'var(--primary)' : 'var(--outline)' }} />}
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: done ? 'var(--primary)' : 'var(--outline)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                          }}>
                            {done ? '✓' : i + 1}
                          </div>
                          {i < STATUS_ORDER.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? 'var(--primary)' : 'var(--outline)' }} />}
                        </div>
                        <div style={{ fontSize: '.65rem', marginTop: 4, textAlign: 'center', color: done ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: done ? 600 : 400 }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                        {timestamps[s] && (
                          <div style={{ fontSize: '.6rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                            {fmtDate(timestamps[s])}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                ITEMS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items?.map(item => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{item.item_name}</span>
                        <span style={{ color: 'var(--on-surface-variant)', marginLeft: 6, fontSize: '.85rem' }}>× {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                    {item.description && (
                      <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                        📌 {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--surface-low)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                  ₹{parseFloat(order.total_amount).toFixed(0)}
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="card" style={{ background: '#fff8ee', marginBottom: 12 }}>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 4 }}>ORDER NOTE</div>
                <div style={{ fontSize: '.9rem' }}>📝 {order.notes}</div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
