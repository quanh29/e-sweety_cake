import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import ImportsPage from './pages/ImportsPage';
import VouchersPage from './pages/VouchersPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import SuccessModal from './components/SuccessModal';
import ScrollToTop from './components/ScrollToTop';
import { Toaster, toast } from 'react-hot-toast';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!sessionStorage.getItem('accessToken');

  if (isAuthenticated) {
    return children;
  }

  // Show a forbidden message and redirect
  toast.error('Truy cập bị từ chối. Vui lòng đăng nhập.');
  return <Navigate to="/admin" replace />;
};

const AdminLoginRoute = () => {
  const isAuthenticated = !!sessionStorage.getItem('accessToken');
  return isAuthenticated ? <Navigate to="/admin/manage" replace /> : <AdminLogin />;
};

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

  // Listen for global openCart event for pages that don't receive onCartClick prop
  useEffect(() => {
    const onOpen = () => setCartOpen(true);
    window.addEventListener('openCart', onOpen);
    return () => window.removeEventListener('openCart', onOpen);
  }, []);

  return (
    <CartProvider>
      <AdminProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Landing onCartClick={handleCartClick} />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminLoginRoute />} />
            <Route 
              path="/admin/manage/*" 
              element={
                <PrivateRoute>
                  <Routes>
                    <Route path="/" element={<AdminLayout />}>
                      <Route index element={<Navigate to="orders" replace />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="imports" element={<ImportsPage />} />
                      <Route path="vouchers" element={<VouchersPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="audit-logs" element={<AuditLogsPage />} />
                      <Route path="contact-messages" element={<ContactMessagesPage />} />
                    </Route>
                  </Routes>
                </PrivateRoute>
              } 
            />
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
        </BrowserRouter>
      </AdminProvider>
    </CartProvider>
  );
}

export default App;
