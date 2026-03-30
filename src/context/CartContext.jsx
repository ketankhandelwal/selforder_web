import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id)
      if (existing) {
        return prev.map(i =>
          i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        menuItemId:  menuItem.id,
        name:        menuItem.name,
        price:       parseFloat(menuItem.price),
        imageUrl:    menuItem.image_url,
        quantity:    1,
        description: '',
      }]
    })
  }, [])

  const updateQuantity = useCallback((menuItemId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.menuItemId !== menuItemId))
    } else {
      setItems(prev => prev.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity: qty } : i
      ))
    }
  }, [])

  const updateNote = useCallback((menuItemId, description) => {
    setItems(prev => prev.map(i =>
      i.menuItemId === menuItemId ? { ...i, description } : i
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, total, count, addItem, updateQuantity, updateNote, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
