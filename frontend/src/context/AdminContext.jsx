import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithAuth } from '../utils/api';

const AdminContext = createContext();
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const API_URL = `${SERVER_URL}/api`;

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [imports, setImports] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      // Only fetch if user is logged in (has access token)
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch Products
        const productResponse = await fetchWithAuth(`${API_URL}/products`);
        if (!productResponse.ok) throw new Error('Failed to fetch products');
        const productData = await productResponse.json();
        const formattedProducts = productData.map(p => ({
          id: p.prod_id,
          name: p.prod_name,
          description: p.prod_description,
          price: parseFloat(p.price),
          stock: parseInt(p.stock, 10),
          image: p.picture_url ? `${SERVER_URL}${p.picture_url}` : 'https://via.placeholder.com/150'
        }));
        setProducts(formattedProducts);

        // Fetch Orders
        const orderResponse = await fetchWithAuth(`${API_URL}/orders`);
        if (!orderResponse.ok) throw new Error('Failed to fetch orders');
        const orderData = await orderResponse.json();
        const formattedOrders = orderData.map(o => ({
          id: o.order_id,
          customerName: o.customer_name,
          customerPhone: o.phone_number,
          customerAddress: o.address,
          customerNote: o.note,
          shippingFee: parseFloat(o.shipping_fee),
          voucherCode: o.voucher_code,
          status: o.status,
          items: o.items.map(item => ({
            productId: item.prod_id,
            quantity: item.quantity,
            price: parseFloat(item.price)
          })),
          subtotal: parseFloat(o.subtotal),
          total: parseFloat(o.total),
          createdAt: new Date(o.created_at)
        }));
        setOrders(formattedOrders);

        // Add other data fetching here (vouchers, users etc.)

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Fetch data error:", err);
        toast.error(`Lỗi tải dữ liệu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  // Order functions
  const addOrder = async (orderData) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to create order');
      const newOrderFromBackend = await response.json();
      
      // Format the new order to match the frontend structure
      const formattedNewOrder = {
        id: newOrderFromBackend.order_id,
        customerName: newOrderFromBackend.customer_name,
        customerPhone: newOrderFromBackend.phone_number,
        customerAddress: newOrderFromBackend.address,
        customerNote: newOrderFromBackend.note,
        shippingFee: parseFloat(newOrderFromBackend.shipping_fee),
        voucherCode: newOrderFromBackend.voucher_code,
        status: newOrderFromBackend.status,
        items: newOrderFromBackend.items.map(item => ({
          productId: item.prod_id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        subtotal: parseFloat(newOrderFromBackend.subtotal),
        total: parseFloat(newOrderFromBackend.total),
        createdAt: new Date(newOrderFromBackend.created_at)
      };
      
      setOrders(prev => [formattedNewOrder, ...prev]);
      toast.success('Thêm đơn hàng thành công!');
      return formattedNewOrder;
    } catch (err) {
      console.error("Add order error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const updateOrder = async (id, data) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update order');
      // Refetch or update state locally
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data, status: o.status } : o)); // Keep original status on full update
      toast.success('Cập nhật đơn hàng thành công!');
    } catch (err) {
      console.error("Update order error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (err) {
      console.error("Update order status error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete order');
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Xóa đơn hàng thành công!');
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // Product functions
  const addProduct = async (productData) => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
      }

      const response = await fetchWithAuth(`${API_URL}/products`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const newProduct = await response.json();
      const formattedProduct = {
        id: newProduct.prod_id,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        image: newProduct.imageUrl ? `${SERVER_URL}${newProduct.imageUrl}` : 'https://via.placeholder.com/150'
      };
      setProducts(prev => [...prev, formattedProduct]);
      toast.success('Thêm sản phẩm thành công!');
    } catch (err) {
      setError(err.message);
      console.error("Add product error:", err);
      toast.error('Thêm sản phẩm thất bại!');
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
      }

      const response = await fetchWithAuth(`${API_URL}/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      const formattedProduct = {
        id: updatedProduct.prod_id,
        name: updatedProduct.prod_name,
        description: updatedProduct.prod_description,
        price: parseFloat(updatedProduct.price),
        stock: parseInt(updatedProduct.stock, 10),
        image: updatedProduct.picture_url ? `${SERVER_URL}${updatedProduct.picture_url}` : 'https://via.placeholder.com/150'
      };
      setProducts(prev => prev.map(p => p.id === id ? formattedProduct : p));
      toast.success('Cập nhật sản phẩm thành công!');
    } catch (err) {
      setError(err.message);
      console.error(`Update product ${id} error:`, err);
      toast.error('Cập nhật sản phẩm thất bại!');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Xóa sản phẩm thành công!');
    } catch (err) {
      setError(err.message);
      console.error(`Delete product ${id} error:`, err);
      toast.error('Xóa sản phẩm thất bại!');
    }
  };


  // Import functions
  const addImport = (importData) => {
    const newImport = { ...importData, id: Date.now() };
    setImports(prev => [...prev, newImport]);
    
    // Update product stock
    importData.items.forEach(item => {
      updateProduct(item.productId, {
        stock: products.find(p => p.id === item.productId)?.stock + item.quantity
      });
    });
    
    return newImport;
  };

  const updateImport = (id, data) => {
    setImports(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteImport = (id) => {
    setImports(prev => prev.filter(i => i.id !== id));
  };

  // Voucher functions
  const addVoucher = (voucher) => {
    const newVoucher = { ...voucher, id: Date.now(), used: 0 };
    setVouchers(prev => [...prev, newVoucher]);
    return newVoucher;
  };

  const updateVoucher = (id, data) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const deleteVoucher = (id) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  // User functions
  const addUser = (user) => {
    const newUser = { ...user, id: Date.now(), createdAt: new Date() };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const logout = async () => {
    try {
      // Call the backend to invalidate the refresh token
      await fetchWithAuth(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with client-side cleanup even if the server call fails
    } finally {
      // Clear all local session and state data
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('isAdmin');
      setOrders([]);
      setProducts([]);
      setImports([]);
      setVouchers([]);
      setUsers([]);
      setError(null);
    }
  };

  const refetchData = async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      setLoading(true);
      
      // Fetch Products
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (!productResponse.ok) throw new Error('Failed to fetch products');
      const productData = await productResponse.json();
      const formattedProducts = productData.map(p => ({
        id: p.prod_id,
        name: p.prod_name,
        description: p.prod_description,
        price: parseFloat(p.price),
        stock: parseInt(p.stock, 10),
        image: p.picture_url ? `${SERVER_URL}${p.picture_url}` : 'https://via.placeholder.com/150'
      }));
      setProducts(formattedProducts);

      // Fetch Orders
      const orderResponse = await fetchWithAuth(`${API_URL}/orders`);
      if (!orderResponse.ok) throw new Error('Failed to fetch orders');
      const orderData = await orderResponse.json();
      const formattedOrders = orderData.map(o => ({
        id: o.order_id,
        customerName: o.customer_name,
        customerPhone: o.phone_number,
        customerAddress: o.address,
        customerNote: o.note,
        shippingFee: parseFloat(o.shipping_fee),
        voucherCode: o.voucher_code,
        status: o.status,
        items: o.items.map(item => ({
          productId: item.prod_id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        subtotal: parseFloat(o.subtotal),
        total: parseFloat(o.total),
        createdAt: new Date(o.created_at)
      }));
      setOrders(formattedOrders);

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Refetch data error:", err);
      toast.error(`Lỗi tải dữ liệu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    products,
    imports,
    vouchers,
    users,
    loading,
    error,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    addImport,
    updateImport,
    deleteImport,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    addUser,
    updateUser,
    deleteUser,
    logout,
    refetchData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
