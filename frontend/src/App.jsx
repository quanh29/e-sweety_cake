import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import ImportsPage from './pages/ImportsPage';
import VouchersPage from './pages/VouchersPage';
import UsersPage from './pages/UsersPage';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import SuccessModal from './components/SuccessModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleCartClick = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  const handleCheckoutOpen = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
  };

  const handleSuccess = () => {
    setSuccessOpen(true);
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
  };

  return (
    <CartProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing onCartClick={handleCartClick} />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard/orders" replace />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="imports" element={<ImportsPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Routes>

          <CartSidebar 
            isOpen={cartOpen} 
            onClose={handleCartClose}
            onCheckout={handleCheckoutOpen}
          />
          <CheckoutModal 
            isOpen={checkoutOpen}
            onClose={handleCheckoutClose}
            onSuccess={handleSuccess}
          />
          <SuccessModal 
            isOpen={successOpen}
            onClose={handleSuccessClose}
          />
          <Toaster position="top-center" />
        </BrowserRouter>
      </AdminProvider>
    </CartProvider>
  );
}

export default App;
