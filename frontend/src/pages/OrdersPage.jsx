import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency, formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const OrdersPage = () => {
  const { orders, products, addOrder, updateOrder, deleteOrder } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm);
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenModal = (order = null) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const orderData = {
      customerName: formData.get('customerName'),
      customerPhone: formData.get('customerPhone'),
      customerAddress: formData.get('customerAddress'),
      status: formData.get('status') || 'pending',
      items: [], // Will be handled separately with item management
      subtotal: 0,
      discount: 0,
      total: 0,
      createdAt: editingOrder?.createdAt || new Date()
    };

    if (editingOrder) {
      updateOrder(editingOrder.id, orderData);
    } else {
      addOrder(orderData);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      deleteOrder(id);
    }
  };

  const handleConfirm = (id) => {
    updateOrder(id, { status: 'confirmed' });
  };

  const handleComplete = (id) => {
    updateOrder(id, { status: 'completed' });
  };

  const handleCancel = (id) => {
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      updateOrder(id, { status: 'cancelled' });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xác nhận', class: styles.statusPending },
      confirmed: { text: 'Đã xác nhận', class: styles.statusConfirmed },
      completed: { text: 'Hoàn thành', class: styles.statusCompleted },
      cancelled: { text: 'Đã hủy', class: styles.statusCancelled }
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`${styles.statusBadge} ${s.class}`}>{s.text}</span>;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quản lý đơn hàng</h2>
        <p>Quản lý tất cả đơn hàng của cửa hàng</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <Button onClick={() => handleOpenModal()}>Thêm đơn hàng</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {order.status === 'pending' && (
                        <Button size="sm" variant="success" onClick={() => handleConfirm(order.id)}>
                          Xác nhận
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" variant="primary" onClick={() => handleComplete(order.id)}>
                          Hoàn thành
                        </Button>
                      )}
                      <Button size="sm" variant="warning" onClick={() => handleOpenModal(order)}>
                        Sửa
                      </Button>
                      {order.status === 'pending' && (
                        <Button size="sm" variant="danger" onClick={() => handleCancel(order.id)}>
                          Hủy
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(order.id)}>
                        Xóa
                      </Button>
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
        title={editingOrder ? 'Sửa đơn hàng' : 'Thêm đơn hàng mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Tên khách hàng</label>
            <input
              type="text"
              name="customerName"
              defaultValue={editingOrder?.customerName}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="customerPhone"
              defaultValue={editingOrder?.customerPhone}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Địa chỉ giao hàng</label>
            <textarea
              name="customerAddress"
              defaultValue={editingOrder?.customerAddress}
              required
            />
          </div>
          {editingOrder && (
            <div className={modalStyles.formGroup}>
              <label>Trạng thái</label>
              <select name="status" defaultValue={editingOrder?.status}>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          )}
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingOrder ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
