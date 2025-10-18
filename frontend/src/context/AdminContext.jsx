import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }) {
  // Sample initial data
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Bánh Tiramisu',
      description: 'Bánh Tiramisu Ý truyền thống',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200',
      stock: 15,
      price: 250000
    },
    {
      id: 2,
      name: 'Bánh Cheesecake',
      description: 'Cheesecake vị dâu tây',
      image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=200',
      stock: 20,
      price: 200000
    },
    {
      id: 3,
      name: 'Bánh Chocolate',
      description: 'Bánh chocolate đắng',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
      stock: 10,
      price: 180000
    }
  ]);
  const [imports, setImports] = useState([]);
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: 'GIAM10',
      type: 'percentage',
      value: 10,
      quantity: 100,
      used: 5,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      description: 'Giảm 10% cho tất cả đơn hàng'
    },
    {
      id: 2,
      code: 'FREESHIP',
      type: 'fixed',
      value: 30000,
      quantity: 50,
      used: 10,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      description: 'Miễn phí ship cho đơn hàng trên 200k'
    }
  ]);
  const [users, setUsers] = useState([
    {
      id: 1,
      fullname: 'Admin System',
      username: 'admin',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      note: 'Tài khoản quản trị viên hệ thống'
    },
    {
      id: 2,
      fullname: 'Nguyễn Văn A',
      username: 'manager1',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(),
      note: 'Quản lý cửa hàng'
    }
  ]);

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
  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
