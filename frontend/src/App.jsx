import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing onCartClick={handleCartClick} />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
    </CartProvider>
  );
}

export default App;
