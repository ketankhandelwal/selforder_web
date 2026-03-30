import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'

export default function CartPage() {
  const { table } = useAuth()
  const { items, total, count, updateQuantity, updateNote, clearCart } = useCart()
  const navigate = useNavigate()

  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const order = await createOrder({
        restaurantId: table.restaurantId,
        tableId:      table.tableId,
        notes:        notes.trim() || undefined,
        items: items.map(i => ({
          menuItemId:  i.menuItemId,
          quantity:    i.quantity,
          description: i.description || undefined,
        })),
      })
      clearCart()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{ padding: '20px 16px' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: '1.4rem',
          color: 'var(--on-surface)', marginBottom: 20,
          letterSpacing: '-.02em',
        }}>
          Your Cart
        </h2>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0' }}>
            <div style={{
              width: 80, height: 80, background: 'var(--primary-fixed)',
              borderRadius: 9999, margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }}>
              🛒
            </div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '1.1rem', color: 'var(--on-surface)',
            }}>
              Your cart is empty
            </p>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: 6, fontSize: '.9rem' }}>
              Add items from the menu to get started
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/menu')}
              style={{ marginTop: 28, maxWidth: 200 }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.menuItemId} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={item.imageUrl || PLACEHOLDER} alt={item.name}
                      onError={e => { e.target.src = PLACEHOLDER }}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: '.9rem', color: 'var(--on-surface)',
                      }}>
                        {item.name}
                      </div>
                      <div style={{ color: 'var(--on-surface-variant)', fontWeight: 500, marginTop: 2, fontSize: '.82rem' }}>
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800, color: 'var(--on-surface)', fontSize: '.95rem',
                        marginBottom: 6,
                      }}>
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </div>
                      <div className="qty-stepper">
                        <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>−</button>
                        <span className="qty-count">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <input
                    className="input"
                    placeholder="Add a note (e.g. no spicy)"
                    value={item.description}
                    onChange={e => updateNote(item.menuItemId, e.target.value)}
                    style={{ marginTop: 12, padding: '8px 12px', fontSize: '.82rem' }}
                  />
                </div>
              ))}
            </div>

            {/* Order note */}
            <div style={{
              background: 'var(--surface-lowest)', borderRadius: 16,
              padding: 16, marginBottom: 12,
            }}>
              <label style={{
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.06em',
                textTransform: 'uppercase', color: 'var(--on-surface-variant)',
                display: 'block', marginBottom: 10,
              }}>
                Order Note
              </label>
              <textarea
                className="input"
                placeholder="Any special instructions for the entire order"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'none', fontSize: '.88rem' }}
              />
            </div>

            {/* Bill summary */}
            <div style={{
              background: 'var(--surface-lowest)', borderRadius: 16,
              padding: 16, marginBottom: 20,
            }}>
              <div style={{
                fontSize: '.75rem', fontWeight: 700, letterSpacing: '.06em',
                textTransform: 'uppercase', color: 'var(--on-surface-variant)',
                marginBottom: 14,
              }}>
                Bill Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: '.9rem' }}>
                  {count} item{count !== 1 ? 's' : ''}
                </span>
                <span style={{ fontWeight: 600, fontSize: '.9rem' }}>₹{total.toFixed(0)}</span>
              </div>
              <div style={{
                height: 1, background: 'var(--surface-low)', margin: '12px 0',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '1rem',
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '1.1rem', color: 'var(--on-surface)',
                }}>
                  ₹{total.toFixed(0)}
                </span>
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 6 }}>
                Table {table?.tableNumber} · {table?.restaurantName}
              </div>
            </div>

            {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

            <button
              className="btn btn-primary"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? <Spinner size={20} /> : `Place Order · ₹${total.toFixed(0)}`}
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
