import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('accessToken');
    navigate('/admin');
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>🧁 E-Sweetie</h1>
          <p>Quản lý cửa hàng bánh ngọt</p>
        </div>
        <div className={styles.sidebarMenu}>
          <NavLink
            to="/admin/dashboard/orders"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>📦</span>
            <span>Đơn hàng</span>
          </NavLink>
          <NavLink
            to="/admin/dashboard/products"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>🧁</span>
            <span>Sản phẩm</span>
          </NavLink>
          <NavLink
            to="/admin/dashboard/imports"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>📥</span>
            <span>Nhập hàng</span>
          </NavLink>
          <NavLink
            to="/admin/dashboard/vouchers"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>🎫</span>
            <span>Voucher</span>
          </NavLink>
          <NavLink
            to="/admin/dashboard/users"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>👥</span>
            <span>Người dùng</span>
          </NavLink>
          <div className={styles.menuItem} onClick={handleLogout}>
            <span className={styles.menuIcon}>🚪</span>
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
