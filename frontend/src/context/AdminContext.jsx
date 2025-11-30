import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithAuth, voucherAPI, userAPI, importAPI } from '../utils/api';

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
  const [currentUser, setCurrentUser] = useState(null);
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
        
        // Fetch Current User
        const userResponse = await fetchWithAuth(`${API_URL}/auth/me`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
        
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

        // Fetch Vouchers
        const voucherData = await voucherAPI.getAll();
        setVouchers(voucherData);

        // Fetch Users
        const userData = await userAPI.getAll();
        setUsers(userData);

        // Fetch Imports
        const importData = await importAPI.getAll();
        setImports(importData);

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
      
      // Refetch products to update stock
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
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
      
      // Refetch products to update stock
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
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
      
      // Refetch products to update stock (especially for cancel operations)
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
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
      
      // Refetch products to update stock
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
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

  // Voucher functions
  const addVoucher = async (voucherData) => {
    try {
      const newVoucher = await voucherAPI.create(voucherData);
      setVouchers(prev => [...prev, newVoucher]);
      toast.success('Thêm voucher thành công!');
      return newVoucher;
    } catch (err) {
      console.error("Add voucher error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const toggleVoucherStatus = async (code) => {
    try {
      const result = await voucherAPI.toggleStatus(code);
      setVouchers(prev => prev.map(v => v.code === code ? { ...v, isActive: result.isActive } : v));
      toast.success(result.message);
    } catch (err) {
      console.error("Toggle voucher status error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // User functions
  const addUser = async (userData) => {
    try {
      const newUser = await userAPI.create(userData);
      setUsers(prev => [...prev, newUser]);
      toast.success('Thêm người dùng thành công!');
      return newUser;
    } catch (err) {
      console.error("Add user error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await userAPI.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      // If updating current user, refetch current user info
      if (currentUser && currentUser.userId === id) {
        const userResponse = await fetchWithAuth(`${API_URL}/auth/me`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
      }
      
      toast.success('Cập nhật người dùng thành công!');
    } catch (err) {
      console.error("Update user error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const deleteUser = async (id) => {
    try {
      await userAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Xóa người dùng thành công!');
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const result = await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: result.status } : u));
      toast.success(result.message);
    } catch (err) {
      console.error("Toggle user status error:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // Import functions
  const addImport = async (importData) => {
    try {
      const newImport = await importAPI.create(importData);
      setImports(prev => [newImport, ...prev]);
      
      // Refetch products to update stock numbers
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
      toast.success('Thêm đơn nhập hàng thành công!');
    } catch (error) {
      console.error('Add import error:', error);
      toast.error(`Lỗi thêm đơn nhập: ${error.message}`);
      throw error;
    }
  };

  const updateImport = async (importId, importData) => {
    try {
      const updatedImport = await importAPI.update(importId, importData);
      setImports(prev => prev.map(imp => imp.id === importId ? updatedImport : imp));
      
      // Refetch products to update stock numbers
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
      toast.success('Cập nhật đơn nhập hàng thành công!');
    } catch (error) {
      console.error('Update import error:', error);
      toast.error(`Lỗi cập nhật đơn nhập: ${error.message}`);
      throw error;
    }
  };

  const deleteImport = async (importId) => {
    try {
      await importAPI.delete(importId);
      setImports(prev => prev.filter(imp => imp.id !== importId));
      
      // Refetch products to update stock numbers
      const productResponse = await fetchWithAuth(`${API_URL}/products`);
      if (productResponse.ok) {
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
      }
      
      toast.success('Xóa đơn nhập hàng thành công!');
    } catch (error) {
      console.error('Delete import error:', error);
      toast.error(`Lỗi xóa đơn nhập: ${error.message}`);
      throw error;
    }
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
      setCurrentUser(null);
      setError(null);
    }
  };

  const refetchData = async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      setLoading(true);
      
      // Fetch Current User Info
      const currentUserResponse = await fetchWithAuth(`${API_URL}/auth/me`);
      if (currentUserResponse.ok) {
        const currentUserData = await currentUserResponse.json();
        setCurrentUser(currentUserData);
      }
      
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

      // Fetch Vouchers
      const voucherData = await voucherAPI.getAll();
      setVouchers(voucherData);

      // Fetch Users
      const userData = await userAPI.getAll();
      setUsers(userData);

      // Fetch Imports
      const importData = await importAPI.getAll();
      setImports(importData);

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
    currentUser,
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
    toggleVoucherStatus,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    logout,
    refetchData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
