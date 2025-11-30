import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const UsersPage = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || user.role === roleFilter;
    const matchStatus = !statusFilter || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const userData = {
      fullname: formData.get('fullname'),
      role: formData.get('role')
    };

    // Username is only included when creating (not when editing)
    if (!editingUser) {
      userData.username = formData.get('username').toLowerCase();
    }

    // Only update password if provided
    const password = formData.get('password');
    if (password) {
      userData.password = password;
    }

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    const user = users.find((u) => u.id === id);
    if (user?.role === 'admin') {
      alert('Không thể xóa tài khoản admin!');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      deleteUser(id);
    }
  };

  const handleToggleStatus = (id) => {
    const user = users.find((u) => u.id === id);
    if (user?.role === 'admin') {
      alert('Không thể vô hiệu hóa tài khoản admin!');
      return;
    }
    toggleUserStatus(id);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quản lý người dùng</h2>
        <p>Quản lý tài khoản người dùng hệ thống</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
          <Button onClick={() => handleOpenModal()}>Thêm người dùng</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Username</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullname}</td>
                  <td>{user.username}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        user.status === 'active' ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button
                        size="sm"
                        variant={user.status === 'active' ? 'warning' : 'success'}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
                      </Button>
                      <Button size="sm" variant="warning" onClick={() => handleOpenModal(user)}>
                        Sửa
                      </Button>
                      {user.role !== 'admin' && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                          Xóa
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Họ tên</label>
            <input type="text" name="fullname" defaultValue={editingUser?.fullname} required />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              defaultValue={editingUser?.username}
              required
              disabled={!!editingUser}
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>{editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
            <input type="password" name="password" required={!editingUser} />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Vai trò</label>
            <select name="role" defaultValue={editingUser?.role || 'user'}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">{editingUser ? 'Cập nhật' : 'Thêm'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
