import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetail } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const STATUS_LABELS = {
  pending:   { label: 'Incoming',   cls: 'chip-pending' },
  confirmed: { label: 'In Progress', cls: 'chip-confirmed' },
  ready:     { label: 'Ready',      cls: 'chip-ready' },
  delivered: { label: 'Delivered',  cls: 'chip-delivered' },
  cancelled: { label: 'Cancelled',  cls: 'chip-cancelled' },
}

const STATUS_ORDER = ['pending', 'confirmed', 'ready', 'delivered']
const STATUS_DISPLAY = { pending: 'Placed', confirmed: 'Confirmed', ready: 'Ready', delivered: 'Delivered' }

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

  const st = order ? (STATUS_LABELS[order.status] || { label: order.status, cls: 'chip-cancelled' }) : null

  return (
    <Layout>
      <div style={{ padding: '20px 16px' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--primary)', fontWeight: 700, marginBottom: 20,
            padding: 0, display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Manrope', sans-serif", fontSize: '.88rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          My Orders
        </button>

        {loading && <Spinner center />}
        {error   && <p className="error-text">{error}</p>}

        {order && (
          <>
            {/* Order header card */}
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)',
                    letterSpacing: '-.01em',
                  }}>
                    {order.order_number}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                    Table {order.table_number}
                  </div>
                </div>
                <span className={`chip ${st.cls}`}>{st.label}</span>
              </div>
            </div>

            {/* Status timeline */}
            {order.status !== 'cancelled' && (
              <div className="card" style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: '.72rem', fontWeight: 700,
                  color: 'var(--on-surface-variant)', marginBottom: 16,
                  letterSpacing: '.08em', textTransform: 'uppercase',
                }}>
                  Order Status
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
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
                          {i > 0 && (
                            <div style={{
                              flex: 1, height: 2,
                              background: done ? 'linear-gradient(90deg,#a73400,#cc4911)' : 'var(--surface-highest)',
                              transition: 'background .3s',
                            }} />
                          )}
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: done ? 'linear-gradient(135deg,#a73400,#cc4911)' : 'var(--surface-highest)',
                            color: done ? 'white' : 'var(--on-surface-variant)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                            boxShadow: done ? '0 4px 12px rgba(167,52,0,.3)' : 'none',
                            transition: 'background .3s, box-shadow .3s',
                          }}>
                            {done ? '✓' : i + 1}
                          </div>
                          {i < STATUS_ORDER.length - 1 && (
                            <div style={{
                              flex: 1, height: 2,
                              background: i < idx ? 'linear-gradient(90deg,#a73400,#cc4911)' : 'var(--surface-highest)',
                            }} />
                          )}
                        </div>
                        <div style={{
                          fontSize: '.62rem', marginTop: 6, textAlign: 'center',
                          fontWeight: done ? 700 : 400,
                          color: done ? 'var(--primary)' : 'var(--on-surface-variant)',
                        }}>
                          {STATUS_DISPLAY[s]}
                        </div>
                        {timestamps[s] && done && (
                          <div style={{ fontSize: '.55rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 2 }}>
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
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{
                fontSize: '.72rem', fontWeight: 700,
                color: 'var(--on-surface-variant)', marginBottom: 14,
                letterSpacing: '.08em', textTransform: 'uppercase',
              }}>
                Items
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items?.map(item => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: '.9rem', color: 'var(--on-surface)',
                        }}>
                          {item.item_name}
                        </span>
                        <span style={{ color: 'var(--on-surface-variant)', marginLeft: 6, fontSize: '.82rem' }}>
                          × {item.quantity}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800, color: 'var(--on-surface)', fontSize: '.9rem',
                      }}>
                        ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                    {item.description && (
                      <div style={{
                        fontSize: '.72rem', color: 'var(--on-surface-variant)',
                        marginTop: 3, fontStyle: 'italic',
                      }}>
                        Note: {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                marginTop: 14, paddingTop: 14,
                borderTop: '2px solid var(--surface-low)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--on-surface-variant)' }}>
                  Total
                </span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)',
                }}>
                  ₹{parseFloat(order.total_amount).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Order note */}
            {order.notes && (
              <div style={{
                background: 'var(--primary-fixed)',
                borderRadius: 16, padding: 16, marginBottom: 10,
              }}>
                <div style={{
                  fontSize: '.72rem', fontWeight: 700,
                  color: 'var(--on-primary-fixed)', marginBottom: 6,
                  letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7,
                }}>
                  Order Note
                </div>
                <div style={{ fontSize: '.9rem', color: 'var(--on-primary-fixed)', fontWeight: 500 }}>
                  {order.notes}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
