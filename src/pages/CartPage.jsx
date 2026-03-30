import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/order'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

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
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Your Cart</h2>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56 }}>🛒</div>
            <p style={{ marginTop: 16, color: 'var(--on-surface-variant)' }}>Your cart is empty</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ marginTop: 24, maxWidth: 200 }}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.menuItemId} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name}
                        style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </div>
                    </div>
                    <div className="qty-stepper">
                      <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>−</button>
                      <span className="qty-count">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  {/* Per-item note */}
                  <input
                    className="input"
                    placeholder="Add note (e.g. no spicy)"
                    value={item.description}
                    onChange={e => updateNote(item.menuItemId, e.target.value)}
                    style={{ marginTop: 10, padding: '8px 12px', fontSize: '.85rem' }}
                  />
                </div>
              ))}
            </div>

            {/* Order note */}
            <div className="card" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Order note (optional)
              </label>
              <textarea
                className="input"
                placeholder="Any special instructions for the entire order"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'none', fontSize: '.9rem' }}
              />
            </div>

            {/* Summary */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>{count} items</span>
                <span style={{ fontWeight: 700 }}>₹{total.toFixed(0)}</span>
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)' }}>
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
