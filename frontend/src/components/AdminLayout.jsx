import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';
import Modal from './Modal';
import Button from './Button';
import styles from './AdminLayout.module.css';
import modalStyles from './Modal.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAdmin();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  const handleSubmitSettings = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const userData = {
      fullname: formData.get('fullname')
    };

    const password = formData.get('password');
    if (password) {
      userData.password = password;
    }

    updateUser(currentUser.userId, userData);
    handleCloseSettings();
  };

  const handleLogout = () => {
    // Add backdrop overlay
    const backdrop = document.createElement('div');
    backdrop.id = 'logout-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-in;
    `;
    document.body.appendChild(backdrop);

    toast(
      (t) => (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          padding: '10px',
          minWidth: '320px'
        }}>
          <span style={{ 
            fontWeight: '600', 
            fontSize: '18px',
            textAlign: 'center',
            color: '#333'
          }}>
            Bạn có chắc muốn đăng xuất?
          </span>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                sessionStorage.removeItem('isAdmin');
                sessionStorage.removeItem('accessToken');
                const backdrop = document.getElementById('logout-backdrop');
                if (backdrop) backdrop.remove();
                toast.dismiss(t.id);
                toast.success('Đã đăng xuất');
                navigate('/admin');
              }}
              style={{
                padding: '12px 24px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: '120px'
              }}
            >
              Đăng xuất
            </button>
            <button
              onClick={() => {
                const backdrop = document.getElementById('logout-backdrop');
                if (backdrop) backdrop.remove();
                toast.dismiss(t.id);
              }}
              style={{
                padding: '12px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: '120px'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          marginTop: '40vh',
          maxWidth: 'none',
          zIndex: 9999
        }
      }
    );
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
            to="/admin/manage/orders"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>📦</span>
            <span>Đơn hàng</span>
          </NavLink>
          <NavLink
            to="/admin/manage/products"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>🧁</span>
            <span>Sản phẩm</span>
          </NavLink>
          <NavLink
            to="/admin/manage/imports"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>📥</span>
            <span>Nhập hàng</span>
          </NavLink>
          <NavLink
            to="/admin/manage/vouchers"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>🎫</span>
            <span>Voucher</span>
          </NavLink>
          <NavLink
            to="/admin/manage/users"
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.menuIcon}>👥</span>
            <span>Người dùng</span>
          </NavLink>
        </div>
        
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>👤</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{currentUser?.fullName || 'Admin'}</div>
              <div className={styles.userRole}>{currentUser?.isAdmin ? 'Admin' : 'User'}</div>
            </div>
            <button className={styles.settingsBtn} onClick={handleOpenSettings} title="Cài đặt">
              ⚙️
            </button>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className={styles.logoutIcon}>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
      <div className={styles.mainContent}>
        <Outlet />
      </div>

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        title="Cài đặt thông tin cá nhân"
      >
        <form onSubmit={handleSubmitSettings}>
          <div className={modalStyles.formGroup}>
            <label>Họ tên</label>
            <input
              type="text"
              name="fullname"
              defaultValue={currentUser?.fullName}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              value={currentUser?.username || ''}
              disabled
              style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', fontSize: '0.85em' }}>Username không thể thay đổi</small>
          </div>
          <div className={modalStyles.formGroup}>
            <label>Mật khẩu mới (để trống nếu không đổi)</label>
            <input type="password" name="password" />
          </div>
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseSettings}>
              Hủy
            </Button>
            <Button type="submit">Cập nhật</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminLayout;
