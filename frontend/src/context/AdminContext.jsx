import { createContext, useContext, useState, useEffect } from 'react';

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Map backend fields to frontend fields
        const formattedProducts = data.map(p => ({
          id: p.prod_id,
          name: p.prod_name,
          description: p.prod_description,
          price: parseFloat(p.price),
          stock: parseInt(p.stock, 10),
          image: p.picture_url ? `${SERVER_URL}${p.picture_url}` : 'https://via.placeholder.com/150'
        }));
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // You can add other data fetching here for orders, users etc.
  }, []);


  // Order functions
  const addOrder = (order) => {
    const newOrder = { ...order, id: Date.now() };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrder = (id, data) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Product functions
  const addProduct = async (productData) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    } catch (err) {
      setError(err.message);
      console.error("Add product error:", err);
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      if (productData.imageFile) {
        formData.append('image', productData.imageFile);
      }

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    } catch (err) {
      setError(err.message);
      console.error(`Update product ${id} error:`, err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      console.error(`Delete product ${id} error:`, err);
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
    deleteUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
