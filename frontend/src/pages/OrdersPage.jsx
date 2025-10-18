import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency, formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const OrdersPage = () => {
  const { orders, products, vouchers, addOrder, updateOrder, deleteOrder, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // State for the order form
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', note: '' });
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderTotals, setOrderTotals] = useState({ subtotal: 0, discount: 0, total: 0 });

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm);
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Recalculate totals whenever items, voucher, or shipping change
  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    let discount = 0;
    const appliedVoucher = vouchers.find(v => v.code.toLowerCase() === appliedVoucherCode.toLowerCase());
    
    if (appliedVoucher) {
      if (appliedVoucher.type === 'percentage') {
        discount = (subtotal * appliedVoucher.value) / 100;
      } else {
        discount = appliedVoucher.value;
      }
    }
    
    const total = subtotal + shippingFee - discount;
    setOrderTotals({ subtotal, discount, total: total > 0 ? total : 0 });
  }, [orderItems, appliedVoucherCode, shippingFee, vouchers]);

  const handleOpenModal = (order = null) => {
    setEditingOrder(order);
    if (order) {
      setCustomerInfo({ 
        name: order.customerName, 
        phone: order.customerPhone, 
        address: order.customerAddress,
        note: order.customerNote || ''
      });
      setOrderItems(order.items || [{ productId: '', quantity: 1, price: 0 }]);
      setVoucherCode(order.voucherCode || '');
      setAppliedVoucherCode(order.voucherCode || '');
      setShippingFee(order.shippingFee || 0);
      setOrderStatus(order.status);
    } else {
      // Reset for new order
      setCustomerInfo({ name: '', phone: '', address: '', note: '' });
      setOrderItems([{ productId: '', quantity: 1, price: 0 }]);
      setVoucherCode('');
      setAppliedVoucherCode('');
      setShippingFee(0);
      setOrderStatus('pending');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    const item = newItems[index];
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      item.productId = value;
      item.price = product ? product.price : 0;
    } else if (field === 'quantity') {
      item.quantity = parseInt(value) >= 1 ? parseInt(value) : 1;
    }
    
    setOrderItems(newItems);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  const handleApplyVoucher = () => {
    const voucher = vouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());
    if (!voucherCode.trim()) {
      setAppliedVoucherCode('');
      return;
    }
    if (voucher) {
      setAppliedVoucherCode(voucherCode);
      alert(`Đã áp dụng mã giảm giá: ${voucher.code}`);
    } else {
      alert('Mã giảm giá không hợp lệ!');
      setAppliedVoucherCode('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalItems = orderItems.filter(item => item.productId).map(item => ({
      ...item,
      subtotal: item.quantity * item.price
    }));

    if (finalItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.');
      return;
    }

    const orderData = {
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      customerNote: customerInfo.note,
      status: orderStatus,
      items: finalItems,
      voucherCode: appliedVoucherCode,
      shippingFee: shippingFee,
      ...orderTotals,
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
    updateOrderStatus(id, 'confirmed');
  };

  const handleComplete = (id) => {
    updateOrderStatus(id, 'completed');
  };

  const handleCancel = (id) => {
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      updateOrderStatus(id, 'cancelled');
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
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="customerPhone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Địa chỉ giao hàng</label>
            <textarea
              name="customerAddress"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Ghi chú (tùy chọn)</label>
            <textarea
              name="customerNote"
              placeholder="Ghi chú thêm về đơn hàng..."
              value={customerInfo.note}
              onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
              rows="3"
            />
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <h4 style={{ marginBottom: '15px' }}>Chi tiết đơn hàng</h4>
          
          <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '2fr 100px 120px 120px 60px', gap: '10px', fontWeight: 'bold', fontSize: '0.9em', color: '#6b7280' }}>
            <div>Sản phẩm</div>
            <div style={{ textAlign: 'center' }}>Số lượng</div>
            <div style={{ textAlign: 'right' }}>Đơn giá</div>
            <div style={{ textAlign: 'right' }}>Thành tiền</div>
            <div></div>
          </div>

          {orderItems.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            return (
              <div key={index} style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '2fr 100px 120px 120px 60px', gap: '10px', alignItems: 'center' }}>
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  required
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="1"
                  style={{ padding: '8px', textAlign: 'center', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
                <div style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(item.price)}</div>
                <div style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>{formatCurrency(item.quantity * item.price)}</div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  disabled={orderItems.length === 1}
                >
                  Xóa
                </Button>
              </div>
            );
          })}
          
          <Button type="button" variant="success" size="sm" onClick={handleAddItem} style={{ marginTop: '10px' }}>
            + Thêm sản phẩm
          </Button>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <div className={modalStyles.formGroup}>
            <label>Phí giao hàng</label>
            <input
              type="text"
              placeholder="Nhập phí giao hàng (đ)"
              value={shippingFee || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setShippingFee(value ? parseInt(value) : 0);
              }}
            />
          </div>

          <div className={modalStyles.formGroup}>
            <label>Mã giảm giá (tùy chọn)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nhập mã voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', flex: 1 }}
              />
              <Button type="button" variant="primary" onClick={handleApplyVoucher}>
                Áp dụng
              </Button>
            </div>
            {appliedVoucherCode && (
              <small style={{ color: '#10b981', marginTop: '5px', display: 'block' }}>
                ✓ Đã áp dụng mã: {appliedVoucherCode}
              </small>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Tạm tính:</span>
              <strong>{formatCurrency(orderTotals.subtotal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Phí giao hàng:</span>
              <strong>{formatCurrency(shippingFee)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ef4444' }}>
              <span>Giảm giá:</span>
              <strong>- {formatCurrency(orderTotals.discount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', paddingTop: '8px', borderTop: '2px solid #e5e7eb' }}>
              <span>Tổng cộng:</span>
              <strong style={{ color: '#10b981' }}>{formatCurrency(orderTotals.total)}</strong>
            </div>
          </div>

          {editingOrder && (
            <div className={modalStyles.formGroup} style={{ marginTop: '20px' }}>
              <label>Trạng thái</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
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
