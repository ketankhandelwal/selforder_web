import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=70'

const STATUS_STEP  = { pending: 0, confirmed: 1, ready: 2, delivered: 3 }
const TRACKER_STEPS = ['Received', 'Preparing', 'Ready', 'Served']
const STATUS_BADGE  = { pending: 'RECEIVED', confirmed: 'PREPARING', ready: 'READY', delivered: 'SERVED', cancelled: 'CANCELLED' }
const EST_TIME      = { pending: '15–20 min', confirmed: '12–15 min', ready: 'Ready now' }

function fmtDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function groupBySessions(orders) {
  const sessionMap = new Map()
  const noSession  = []
  for (const order of orders) {
    if (!order.session_id) { noSession.push(order); continue }
    if (!sessionMap.has(order.session_id)) {
      sessionMap.set(order.session_id, {
        sessionId:     order.session_id,
        sessionStatus: order.session_status,
        orders:        [],
      })
    }
    sessionMap.get(order.session_id).orders.push(order)
  }
  return { sessions: Array.from(sessionMap.values()), noSession }
}

/* ── Single order row inside Active Session card ── */
function ActiveOrderRow({ order, onClick }) {
  const step  = STATUS_STEP[order.status] ?? -1
  const badge = STATUS_BADGE[order.status] || order.status.toUpperCase()
  const est   = EST_TIME[order.status]
  const items = Array.isArray(order.items) ? order.items : []
  const isCancelled = order.status === 'cancelled'

  return (
    <div
      onClick={onClick}
      style={{
        background: isCancelled ? 'var(--surface-low)' : 'var(--surface-lowest)',
        borderRadius: 16, padding: 16, cursor: 'pointer',
        opacity: isCancelled ? .6 : 1,
        boxShadow: isCancelled ? 'none' : '0 2px 12px rgba(27,28,25,.06)',
      }}
    >
      {/* Order # + status badge row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)',
          letterSpacing: '-.01em',
        }}>
          {order.order_number}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {est && !isCancelled && (
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '.8rem', color: 'var(--primary)',
            }}>
              {est}
            </span>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: isCancelled ? 'var(--surface-highest)' : 'var(--primary-fixed)',
            padding: '4px 10px', borderRadius: 9999,
          }}>
            {!isCancelled && (
              <div style={{
                width: 6, height: 6, borderRadius: 9999,
                background: 'var(--primary)',
              }} />
            )}
            <span style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '.6rem',
              letterSpacing: '.07em',
              color: isCancelled ? 'var(--on-surface-variant)' : 'var(--on-primary-fixed)',
            }}>
              {badge}
            </span>
          </div>
        </div>
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {items.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={item.image_url || PLACEHOLDER} alt={item.item_name}
                onError={e => { e.target.src = PLACEHOLDER }}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '.88rem', color: 'var(--on-surface)',
                }}>
                  {item.item_name}
                </div>
                {item.description && (
                  <div style={{
                    fontSize: '.7rem', color: 'var(--on-surface-variant)',
                    fontStyle: 'italic', marginTop: 1,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '.82rem', fontWeight: 600,
                color: 'var(--on-surface-variant)', flexShrink: 0,
              }}>
                ×{item.quantity}
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <div style={{ fontSize: '.72rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
              +{items.length - 3} more item{items.length - 3 > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Status tracker (only for non-cancelled) */}
      {!isCancelled && (
        <>
          <div style={{ height: 1, background: 'var(--surface-low)', marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {TRACKER_STEPS.map((label, i) => {
              const done    = i <= step
              const current = i === step
              return (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {i > 0 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: i <= step
                          ? 'linear-gradient(90deg,#a73400,#cc4911)'
                          : 'var(--surface-highest)',
                      }} />
                    )}
                    <div style={{
                      width: 18, height: 18, borderRadius: 9999, flexShrink: 0,
                      background: done ? 'linear-gradient(135deg,#a73400,#cc4911)' : 'var(--surface-highest)',
                      boxShadow: current ? '0 0 0 3px rgba(167,52,0,.2)' : 'none',
                    }} />
                    {i < TRACKER_STEPS.length - 1 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: i < step
                          ? 'linear-gradient(90deg,#a73400,#cc4911)'
                          : 'var(--surface-highest)',
                      }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: '.58rem', marginTop: 5, textAlign: 'center',
                    fontWeight: done ? 700 : 500,
                    color: done ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                  }}>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── History order card (past sessions) ── */
function HistoryCard({ order, onClick }) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstName = items[0]?.item_name || order.order_number
  const label = items.length > 1
    ? `${firstName}, ${items.length - 1} other${items.length - 1 > 1 ? 's' : ''}`
    : firstName
  const extra = Math.max(0, items.length - 2)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface-lowest)', borderRadius: 14,
        padding: '14px 16px', cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(27,28,25,.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <div style={{ fontSize: '.7rem', color: 'var(--on-surface-variant)', fontWeight: 500, marginBottom: 3 }}>
            {fmtDateTime(order.ordered_at)}
          </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '.92rem', color: 'var(--on-surface)',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '.95rem', color: 'var(--on-surface)', flexShrink: 0,
        }}>
          ₹{parseFloat(order.total_amount).toFixed(0)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Stacked thumbnails */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {items.slice(0, 2).map((item, i) => (
            <img
              key={i}
              src={item.image_url || PLACEHOLDER} alt=""
              onError={e => { e.target.src = PLACEHOLDER }}
              style={{
                width: 34, height: 34, borderRadius: 9999, objectFit: 'cover',
                border: '2px solid var(--surface-lowest)',
                marginLeft: i > 0 ? -10 : 0,
                position: 'relative', zIndex: 2 - i,
              }}
            />
          ))}
          {extra > 0 && (
            <div style={{
              width: 34, height: 34, borderRadius: 9999,
              background: 'var(--surface-highest)',
              border: '2px solid var(--surface-lowest)',
              marginLeft: -10, position: 'relative', zIndex: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.6rem', fontWeight: 700, color: 'var(--on-surface-variant)',
            }}>
              +{extra}
            </div>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            background: 'var(--surface-highest)', border: 'none', cursor: 'pointer',
            padding: '7px 16px', borderRadius: 9999,
            fontWeight: 700, fontSize: '.68rem',
            fontFamily: "'Manrope', sans-serif",
            letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'var(--on-surface)',
          }}
        >
          View
        </button>
      </div>
    </div>
  )
}

/* ── Session: Current Visit ── */
function ActiveSession({ session, onClickOrder }) {
  const total = session.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + parseFloat(o.total_amount), 0)

  /* Most "active" badge from orders in session */
  const activeOrder = session.orders.find(o => ['pending', 'confirmed', 'ready'].includes(o.status))
  const badge = activeOrder ? STATUS_BADGE[activeOrder.status] : 'SERVED'

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)',
        }}>
          Active Order
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '.95rem', color: 'var(--on-surface)',
          }}>
            ₹{total.toFixed(0)}
          </span>
          {activeOrder && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--primary-fixed)',
              padding: '5px 12px', borderRadius: 9999,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: 9999, background: 'var(--primary)',
                boxShadow: '0 0 0 2px rgba(167,52,0,.2)',
              }} />
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: '.65rem',
                letterSpacing: '.07em', color: 'var(--on-primary-fixed)',
              }}>
                {badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table info */}
      <div style={{
        background: 'var(--surface-lowest)', borderRadius: 20,
        padding: 18,
        boxShadow: '0 4px 24px rgba(27,28,25,.08)',
      }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: '.65rem', fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 2,
          }}>
            Table {session.orders[0]?.table_number || '—'}
          </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: '.88rem', color: 'var(--on-surface-variant)',
          }}>
            {session.orders.length} order{session.orders.length !== 1 ? 's' : ''} this visit
          </div>
        </div>

        {/* Each order */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {session.orders.map(order => (
            <ActiveOrderRow
              key={order.id}
              order={order}
              onClick={() => onClickOrder(order.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Session: Past Visit ── */
function PastSession({ session, onClickOrder }) {
  const [expanded, setExpanded] = useState(false)
  const total = session.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + parseFloat(o.total_amount), 0)

  return (
    <div>
      {/* Section header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}
      >
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700, fontSize: '.95rem', color: 'var(--on-surface-variant)',
        }}>
          Past Visit · ₹{total.toFixed(0)}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--on-surface-variant)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Collapsed: show history cards */}
      {!expanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {session.orders.map(order => (
            <HistoryCard key={order.id} order={order} onClick={() => onClickOrder(order.id)} />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface-lowest)', borderRadius: 16, padding: 16,
          boxShadow: '0 2px 14px rgba(27,28,25,.06)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {session.orders.map(order => (
              <ActiveOrderRow key={order.id} order={order} onClick={() => onClickOrder(order.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main ── */
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
  const currentSessions = sessions.filter(s => s.sessionStatus !== 'settled')
  const pastSessions    = sessions.filter(s => s.sessionStatus === 'settled')

  return (
    <Layout>
      <div style={{ background: 'var(--surface-low)', minHeight: '100%' }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 0',
        }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '1.4rem',
            color: 'var(--on-surface)', letterSpacing: '-.02em',
          }}>
            My Orders
          </h2>
          <button
            onClick={load}
            style={{
              background: 'var(--primary-fixed)', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontWeight: 700, fontSize: '.78rem',
              padding: '6px 14px', borderRadius: 9999,
              fontFamily: "'Manrope', sans-serif",
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>

        {loading && <div style={{ padding: 48 }}><Spinner center /></div>}
        {error   && <p className="error-text" style={{ textAlign: 'center', padding: 24 }}>{error}</p>}

        {!loading && !error && (
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* ── Empty state ── */}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: 72, height: 72, background: 'var(--surface-highest)',
                  borderRadius: 9999, margin: '0 auto 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                }}>
                  📋
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '1.05rem', color: 'var(--on-surface)',
                }}>
                  No orders yet
                </p>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: 6, fontSize: '.88rem' }}>
                  Your order history will appear here
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ marginTop: 24, maxWidth: 180 }}>
                  Go to Menu
                </button>
              </div>
            )}

            {/* ── Current sessions (Active Orders) ── */}
            {currentSessions.map(session => (
              <ActiveSession
                key={session.sessionId}
                session={session}
                onClickOrder={id => navigate(`/orders/${id}`)}
              />
            ))}

            {/* ── Orders without session ── */}
            {noSession.filter(o => ['pending','confirmed','ready'].includes(o.status)).map(order => (
              <ActiveOrderRow
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}

            {/* ── Order History (past settled sessions) ── */}
            {(pastSessions.length > 0 || noSession.filter(o => !['pending','confirmed','ready'].includes(o.status)).length > 0) && (
              <section>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)',
                  marginBottom: 14,
                }}>
                  Order History
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pastSessions.map(session => (
                    <PastSession
                      key={session.sessionId}
                      session={session}
                      onClickOrder={id => navigate(`/orders/${id}`)}
                    />
                  ))}
                  {/* No-session history orders */}
                  {noSession
                    .filter(o => !['pending','confirmed','ready'].includes(o.status))
                    .map(order => (
                      <HistoryCard
                        key={order.id}
                        order={order}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      />
                    ))
                  }
                </div>
              </section>
            )}

            {/* Help link */}
            {orders.length > 0 && (
              <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700, fontSize: '.9rem',
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(167,52,0,.4)',
                }}>
                  Need help with an order?
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  )
}
