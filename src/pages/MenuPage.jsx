import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getMenu } from '../api/menu'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'

const HERO_LINES = [
  ['Experience the Hearth', 'Crafted by fire, served with soul.'],
  ['A Table Set for You', 'Every dish, a moment to savour.'],
  ['The Art of the Plate', 'Seasonal. Intentional. Unforgettable.'],
]

function VegDot({ isVeg }) {
  if (isVeg === undefined || isVeg === null) return null
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 10, borderRadius: 9999,
      background: isVeg ? '#2e7d32' : '#c62828',
      border: `1.5px solid ${isVeg ? '#2e7d32' : '#c62828'}`,
      flexShrink: 0,
    }} />
  )
}

export default function MenuPage() {
  const { table } = useAuth()
  const { items: cartItems, addItem, updateQuantity, count, total } = useCart()
  const navigate = useNavigate()

  const [cuisines, setCuisines]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeCuisine, setActiveCuisine] = useState(null)
  const [search, setSearch]             = useState('')

  const [headline, tagline] = HERO_LINES[0]

  // Swipe gesture
  const touchStartX = useRef(null)
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return          // too short, ignore
    const idx = cuisines.findIndex(c => c.id === activeCuisine)
    if (dx < 0 && idx < cuisines.length - 1) {
      setActiveCuisine(cuisines[idx + 1].id)
      setSearch('')
    } else if (dx > 0 && idx > 0) {
      setActiveCuisine(cuisines[idx - 1].id)
      setSearch('')
    }
  }

  useEffect(() => {
    getMenu(table.restaurantId)
      .then(data => { setCuisines(data); setActiveCuisine(data[0]?.id || null) })
      .catch(err => setError(err.response?.data?.message || 'Failed to load menu'))
      .finally(() => setLoading(false))
  }, [table.restaurantId])

  const cartQty = (menuItemId) =>
    cartItems.find(i => i.menuItemId === menuItemId)?.quantity || 0

  const activeCuisineData = cuisines.find(c => c.id === activeCuisine)

  const filteredCategories = useMemo(() => {
    if (!activeCuisineData?.categories) return []
    if (!search.trim()) return activeCuisineData.categories
    const q = search.toLowerCase()
    return activeCuisineData.categories
      .map(cat => ({
        ...cat,
        items: (cat.items || []).filter(item =>
          item.is_available &&
          (item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q))
        ),
      }))
      .filter(cat => cat.items.length > 0)
  }, [activeCuisineData, search])

  return (
    <Layout>
      {loading && <Spinner center />}
      {error && (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--error)' }}>{error}</div>
      )}

      {!loading && !error && (
        <div
          style={{ background: 'var(--surface-lowest)' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >

          {/* ── Hero ── */}
          <div style={{ padding: '22px 20px 16px' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1.85rem', lineHeight: 1.15,
              color: 'var(--on-surface)', letterSpacing: '-.03em',
              marginBottom: 6,
            }}>
              {headline}
            </h1>
            <p style={{
              fontSize: '.88rem', color: 'var(--on-surface-variant)',
              fontWeight: 500, lineHeight: 1.5,
            }}>
              {tagline}
            </p>
          </div>

          {/* ── Search ── */}
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-low)',
              borderRadius: 14, padding: '10px 14px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--on-surface-variant)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search our seasonal menu..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: '.88rem', color: 'var(--on-surface)',
                  fontFamily: "'Manrope', sans-serif",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--on-surface-variant)', lineHeight: 1, fontSize: 16 }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* ── Cuisine tabs ── */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            padding: '0 16px 16px',
            scrollbarWidth: 'none',
          }}>
            {cuisines.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCuisine(c.id); setSearch('') }}
                style={{
                  flexShrink: 0, padding: '8px 20px',
                  borderRadius: 9999, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '.82rem',
                  fontFamily: "'Manrope', sans-serif",
                  background: activeCuisine === c.id
                    ? 'linear-gradient(135deg,#a73400,#cc4911)'
                    : 'var(--surface-low)',
                  color: activeCuisine === c.id ? 'white' : 'var(--on-surface-variant)',
                  transition: 'background .15s, color .15s',
                  boxShadow: activeCuisine === c.id ? '0 4px 14px rgba(167,52,0,.28)' : 'none',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* ── Categories + Items ── */}
          <div style={{ padding: '0 0 8px' }}>
            {filteredCategories.map(cat => (
              <div key={cat.id} style={{ marginBottom: 28 }}>

                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 0,
                  padding: '0 16px', marginBottom: 16,
                }}>
                  <div style={{
                    width: 3, borderRadius: 2, flexShrink: 0,
                    background: 'linear-gradient(180deg,#a73400,#cc4911)',
                    alignSelf: 'stretch', marginRight: 12, minHeight: 36,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: '.82rem',
                      color: 'var(--on-surface)',
                      letterSpacing: '.08em', textTransform: 'uppercase',
                    }}>
                      {cat.name}
                    </div>
                    {cat.description && (
                      <div style={{ fontSize: '.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                        {cat.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px' }}>
                  {cat.items?.filter(item => item.is_available || search).map(item => {
                    const qty = cartQty(item.id)
                    const imgSrc = item.image_url || PLACEHOLDER
                    const isFeatured = item.is_featured || item.chef_pick

                    return (
                      <div key={item.id} style={{
                        background: 'var(--surface-lowest)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 2px 20px rgba(27,28,25,.07)',
                      }}>
                        {/* Image */}
                        <div style={{ position: 'relative' }}>
                          <img
                            src={imgSrc} alt={item.name}
                            onError={e => { e.target.src = PLACEHOLDER }}
                            style={{
                              width: '100%', height: 200,
                              objectFit: 'cover', display: 'block',
                            }}
                          />
                          {/* Price badge */}
                          <div style={{
                            position: 'absolute', top: 12, right: 12,
                            background: 'rgba(255,255,255,.92)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 9999,
                            padding: '4px 12px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800, fontSize: '.9rem',
                            color: 'var(--on-surface)',
                          }}>
                            ₹{parseFloat(item.price).toFixed(0)}
                          </div>
                          {/* Chef's pick badge */}
                          {isFeatured && (
                            <div style={{
                              position: 'absolute', bottom: 12, right: 12,
                              background: 'var(--primary-fixed)',
                              borderRadius: 9999,
                              padding: '3px 10px',
                              fontFamily: "'Manrope', sans-serif",
                              fontWeight: 700, fontSize: '.65rem',
                              color: 'var(--on-primary-fixed)',
                              letterSpacing: '.06em', textTransform: 'uppercase',
                            }}>
                              Chef's Pick
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '14px 16px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 700, fontSize: '1rem',
                              color: 'var(--on-surface)', flex: 1,
                            }}>
                              {item.name}
                            </span>
                            <VegDot isVeg={item.is_veg} />
                          </div>

                          {item.description && (
                            <p style={{
                              fontSize: '.78rem', color: 'var(--on-surface-variant)',
                              lineHeight: 1.55, marginBottom: 14,
                              overflow: 'hidden', display: '-webkit-box',
                              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                            }}>
                              {item.description}
                            </p>
                          )}

                          {/* Add / Stepper */}
                          {qty === 0 ? (
                            <button
                              onClick={() => addItem(item)}
                              style={{
                                width: '100%', padding: '11px 0',
                                borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: 'var(--surface-low)',
                                color: 'var(--on-surface)',
                                fontWeight: 700, fontSize: '.88rem',
                                fontFamily: "'Manrope', sans-serif",
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'background .15s',
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 400 }}>+</span>
                              Add to Order
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                              <button
                                onClick={() => addItem(item)}
                                style={{
                                  flex: 1, padding: '11px 0',
                                  borderRadius: 12, border: 'none', cursor: 'pointer',
                                  background: 'linear-gradient(135deg,#a73400,#cc4911)',
                                  color: 'white',
                                  fontWeight: 700, fontSize: '.88rem',
                                  fontFamily: "'Manrope', sans-serif",
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                  boxShadow: '0 4px 14px rgba(167,52,0,.25)',
                                }}
                              >
                                + Add to Order
                              </button>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                marginLeft: 12,
                              }}>
                                <button
                                  className="qty-btn"
                                  onClick={() => updateQuantity(item.id, qty - 1)}
                                >−</button>
                                <span className="qty-count">{qty}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && search && (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--on-surface-variant)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <p style={{ fontWeight: 600 }}>No items found for "{search}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sticky cart bar ── */}
      {count > 0 && (
        <div
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed', bottom: 'var(--bottom-nav-h)',
            left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 480,
            background: 'linear-gradient(135deg,#8f2c00,#b83d0d)',
            color: 'white',
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', cursor: 'pointer',
            zIndex: 99,
            boxShadow: '0 -6px 24px rgba(143,44,0,.35)',
          }}
        >
          {/* Cart icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.75l1.29-8.25H6"/>
            </svg>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, opacity: .8, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              {count} item{count !== 1 ? 's' : ''} selected
            </div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1rem', letterSpacing: '-.01em',
            }}>
              View Your Order
            </div>
          </div>

          {/* Price + arrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '1.1rem',
            }}>
              ₹{total.toFixed(0)}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      )}
    </Layout>
  )
}
