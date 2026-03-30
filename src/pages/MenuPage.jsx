import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getMenu } from '../api/menu'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

export default function MenuPage() {
  const { table } = useAuth()
  const { items: cartItems, addItem, updateQuantity, count, total } = useCart()
  const navigate = useNavigate()

  const [cuisines, setCuisines] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeCuisine, setActiveCuisine] = useState(null)

  useEffect(() => {
    getMenu(table.restaurantId)
      .then(data => { setCuisines(data); setActiveCuisine(data[0]?.id || null) })
      .catch(err => setError(err.response?.data?.message || 'Failed to load menu'))
      .finally(() => setLoading(false))
  }, [table.restaurantId])

  const cartQty = (menuItemId) =>
    cartItems.find(i => i.menuItemId === menuItemId)?.quantity || 0

  const activeCuisineData = cuisines.find(c => c.id === activeCuisine)

  return (
    <Layout>
      {loading && <Spinner center />}
      {error && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--error)' }}>{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Cuisine filter tabs */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            padding: '12px 16px', background: 'var(--surface-lowest)',
            scrollbarWidth: 'none', position: 'sticky', top: 0, zIndex: 10,
          }}>
            {cuisines.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCuisine(c.id)}
                style={{
                  flexShrink: 0, padding: '6px 16px',
                  borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '.85rem',
                  background: activeCuisine === c.id ? 'var(--primary)' : 'var(--surface-low)',
                  color: activeCuisine === c.id ? 'white' : 'var(--on-surface-variant)',
                  transition: 'background .15s, color .15s',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Categories + Items */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeCuisineData?.categories?.map(cat => (
              <div key={cat.id}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 10 }}>
                  {cat.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.items?.filter(item => item.is_available).map(item => {
                    const qty = cartQty(item.id)
                    return (
                      <div key={item.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {item.image_url && (
                          <img
                            src={item.image_url} alt={item.name}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '.95rem' }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: '.78rem', color: 'var(--on-surface-variant)', marginTop: 2, lineHeight: 1.4,
                              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {item.description}
                            </div>
                          )}
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '.95rem' }}>
                              ₹{parseFloat(item.price).toFixed(0)}
                            </span>
                            {qty === 0 ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => addItem(item)}
                                style={{ width: 'auto', padding: '6px 18px' }}
                              >
                                Add
                              </button>
                            ) : (
                              <div className="qty-stepper">
                                <button className="qty-btn filled" onClick={() => updateQuantity(item.id, qty - 1)}>−</button>
                                <span className="qty-count">{qty}</span>
                                <button className="qty-btn filled" onClick={() => addItem(item)}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky cart bar */}
          {count > 0 && (
            <div className="cart-bar" onClick={() => navigate('/cart')}>
              <span style={{ fontWeight: 700 }}>{count} item{count > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600 }}>View Cart  •  ₹{total.toFixed(0)}</span>
              <span>→</span>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
