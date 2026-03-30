import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScanPage from './pages/ScanPage'
import CheckUserPage from './pages/CheckUserPage'
import PinPage from './pages/PinPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import NoTablePage from './pages/NoTablePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public — QR landing */}
            <Route path="/scan/:token" element={<ScanPage />} />

            {/* Auth flow */}
            <Route path="/auth" element={<CheckUserPage />} />
            <Route path="/auth/pin" element={<PinPage />} />

            {/* No table fallback */}
            <Route path="/no-table" element={<NoTablePage />} />

            {/* Protected — requires auth + table */}
            <Route element={<ProtectedRoute />}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/no-table" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
