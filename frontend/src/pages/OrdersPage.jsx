import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency, formatDate } from '../utils/format';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import OrderModal from '../components/OrderModal';

const OrdersPage = () => {
  const { orders, products, vouchers, addOrder, updateOrder, deleteOrder, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownIndex !== null) {
        setOpenDropdownIndex(null);
      }
    };
    
    if (openDropdownIndex !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownIndex]);

  // viewOnly: when true the modal will be opened read-only (no edits allowed)
  const handleOpenModal = (order = null, viewOnly = false) => {
    setEditingOrder(order);
    setIsViewOnly(!!viewOnly);
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
    setOpenDropdownIndex(null);
    setProductSearchTerm('');
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    const item = newItems[index];
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      item.productId = value;
      item.price = product ? product.price : 0;
      setOpenDropdownIndex(null); // Close dropdown after selection
      setProductSearchTerm(''); // Clear search term
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
                      <Button size="sm" variant="info" onClick={() => handleOpenModal(order, true)}>
                        Xem
                      </Button>
                      <Button size="sm" variant="warning" onClick={() => handleOpenModal(order, false)}>
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

      <OrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingOrder={editingOrder}
        viewOnly={isViewOnly}
        products={products}
        vouchers={vouchers}
        addOrder={addOrder}
        updateOrder={updateOrder}
      />
    </div>
  );
};

export default OrdersPage;
