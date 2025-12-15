import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import styles from './OrderModal.module.css';
import dropdownStyles from './ProductDropdown.module.css';
import ProductDropdown from './ProductDropdown';
import { formatCurrency } from '../utils/format';

const OrderModal = ({ isOpen, onClose, editingOrder, products = [], vouchers = [], addOrder, updateOrder, viewOnly = false, onSaved }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', note: '' });
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderTotals, setOrderTotals] = useState({ subtotal: 0, discount: 0, total: 0 });

  useEffect(() => {
    if (editingOrder) {
      setCustomerInfo({
        name: editingOrder.customerName || '',
        phone: editingOrder.customerPhone || '',
        address: editingOrder.customerAddress || '',
        note: editingOrder.customerNote || ''
      });
      setOrderItems(editingOrder.items || [{ productId: '', quantity: 1, price: 0 }]);
      // Treat explicit 'NONE' voucher as no voucher (empty)
      const vcode = editingOrder.voucherCode && String(editingOrder.voucherCode).toLowerCase() === 'none' ? '' : (editingOrder.voucherCode || '');
      setVoucherCode(vcode);
      setAppliedVoucherCode(vcode);
      setShippingFee(editingOrder.shippingFee || 0);
      setPaymentMethod(editingOrder.paymentMethod || editingOrder.payment_method || 'cod');
      setOrderStatus(editingOrder.status || 'pending');
    } else {
      setCustomerInfo({ name: '', phone: '', address: '', note: '' });
      setOrderItems([{ productId: '', quantity: 1, price: 0 }]);
      setVoucherCode('');
      setAppliedVoucherCode('');
      setShippingFee(0);
      setOrderStatus('pending');
    }
  }, [editingOrder, isOpen]);

  useEffect(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    let discount = 0;
    const appliedVoucher = vouchers.find(v => v.code.toLowerCase() === appliedVoucherCode.toLowerCase());
    if (appliedVoucher) {
      if (appliedVoucher.type === 'percentage') discount = (subtotal * appliedVoucher.value) / 100;
      else discount = appliedVoucher.value;
    }
    const total = subtotal + shippingFee - discount;
    setOrderTotals({ subtotal, discount, total: total > 0 ? total : 0 });
  }, [orderItems, appliedVoucherCode, shippingFee, vouchers]);

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

  const handleAddItem = () => setOrderItems([...orderItems, { productId: '', quantity: 1, price: 0 }]);
  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setAppliedVoucherCode('');
      return;
    }
    if (String(voucherCode).toLowerCase() === 'none') {
      // Explicit 'NONE' should be considered invalid by user request
      toast.error('Mã giảm giá không hợp lệ!');
      setAppliedVoucherCode('');
      return;
    }
    const voucher = vouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());
    if (!voucher) {
      toast.error('Mã giảm giá không hợp lệ!');
      setAppliedVoucherCode('');
      return;
    }

    // Check if voucher is expired
    if (voucher.endDate) {
      const now = new Date();
      const endDate = new Date(voucher.endDate);
      if (now > endDate) {
        toast.error('Mã giảm giá đã hết hạn sử dụng!');
        setAppliedVoucherCode('');
        return;
      }
    }

    // Check if voucher has reached usage limit
    if (voucher.used >= voucher.quantity) {
      toast.error('Mã giảm giá đã hết lượt sử dụng!');
      setAppliedVoucherCode('');
      return;
    }

    // Check if voucher has started
    if (voucher.startDate) {
      const now = new Date();
      const startDate = new Date(voucher.startDate);
      if (now < startDate) {
        toast.error('Mã giảm giá chưa đến thời gian sử dụng!');
        setAppliedVoucherCode('');
        return;
      }
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      toast.error('Mã giảm giá đã bị vô hiệu hóa!');
      setAppliedVoucherCode('');
      return;
    }

    setAppliedVoucherCode(voucherCode);
    toast.success(`Đã áp dụng mã giảm giá: ${voucher.code}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalItems = orderItems.filter(item => item.productId).map(item => ({ ...item, subtotal: item.quantity * item.price }));
    if (finalItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.');
      return;
    }
    const orderData = {
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      customerNote: customerInfo.note,
      status: orderStatus,
      items: finalItems,
      voucherCode: appliedVoucherCode && String(appliedVoucherCode).toLowerCase() === 'none' ? '' : appliedVoucherCode,
      paymentMethod: paymentMethod || 'cod',
      shippingFee,
      ...orderTotals,
      createdAt: editingOrder?.createdAt || new Date()
    };

    if (editingOrder) {
      await updateOrder(editingOrder.id, orderData);
      if (typeof onSaved === 'function') onSaved({ ...editingOrder, ...orderData, id: editingOrder.id });
    } else {
      await addOrder(orderData);
      if (typeof onSaved === 'function') onSaved({ ...orderData });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingOrder ? 'Sửa đơn hàng' : 'Thêm đơn hàng mới'}>
      <form onSubmit={handleSubmit} className={styles.container}>
        <div className={styles.formGroup}>
          <label>Tên khách hàng</label>
          <input type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} required readOnly={viewOnly} disabled={viewOnly} />
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} required readOnly={viewOnly} disabled={viewOnly} />
        </div>

        <div className={styles.formGroup}>
          <label>Địa chỉ giao hàng</label>
          <textarea value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} required readOnly={viewOnly} disabled={viewOnly} />
        </div>

        <div className={styles.formGroup}>
          <label>Ghi chú (tùy chọn)</label>
          <textarea value={customerInfo.note} onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })} rows="3" readOnly={viewOnly} disabled={viewOnly} />
        </div>

        <hr className={styles.divider} />

        <h4 className={styles.sectionTitle}>Chi tiết đơn hàng</h4>

        <div className={styles.itemsHeader}>
          <div>Sản phẩm</div>
          <div style={{ textAlign: 'center' }}>Số lượng</div>
          <div style={{ textAlign: 'right' }}>Đơn giá</div>
          <div style={{ textAlign: 'right' }}>Thành tiền</div>
          <div></div>
        </div>

        {orderItems.map((item, index) => (
          <div key={index} className={styles.itemRow}>
            {viewOnly ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={(products.find(p => p.id === item.productId) || {}).image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                <div style={{ flex: 1 }}>{(products.find(p => p.id === item.productId) || {}).name || '—'}</div>
              </div>
            ) : (
              <ProductDropdown
                index={index}
                selectedProductId={item.productId}
                products={products}
                orderItems={orderItems}
                onSelect={(productId) => handleItemChange(index, 'productId', productId)}
              />
            )}

            <input type="number" value={item.quantity} min="1" onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className={styles.qtyInput} readOnly={viewOnly} disabled={viewOnly} />

            <div style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.quantity * item.price)}</div>
            {!viewOnly && (
              <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(index)} disabled={orderItems.length === 1}>Xóa</Button>
            )}
          </div>
        ))}

  {!viewOnly && <Button type="button" variant="success" size="sm" onClick={handleAddItem} style={{ marginTop: '10px' }}>+ Thêm sản phẩm</Button>}

        <hr className={styles.divider} />

        <div className={styles.formGroup}>
          <label>Phí giao hàng</label>
          <input
            type="text"
            placeholder="Nhập phí giao hàng (đ)"
            value={shippingFee || ''}
            onChange={(e) => { const value = e.target.value.replace(/\D/g, ''); setShippingFee(value ? parseInt(value) : 0); }}
            readOnly={viewOnly}
            disabled={viewOnly}
            aria-disabled={viewOnly}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mã giảm giá (tùy chọn)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Nhập mã voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', flex: 1 }} readOnly={viewOnly} disabled={viewOnly} />
            {!viewOnly && <Button type="button" variant="primary" onClick={handleApplyVoucher}>Áp dụng</Button>}
          </div>
          {appliedVoucherCode && (<small className={styles.voucherApplied}>✓ Đã áp dụng mã: {appliedVoucherCode}</small>)}
        </div>

        <div className={styles.formGroup}>
          <label>Phương thức thanh toán</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={paymentMethod === 'cod' ? styles.selectedPayment : ''}
              style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 8, border: paymentMethod === 'cod' ? '2px solid #10b981' : '1px solid #e5e7eb', background: paymentMethod === 'cod' ? '#ecfdf5' : 'white' }}
              disabled={viewOnly}
            >
              Thanh toán khi nhận hàng (COD)
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={paymentMethod === 'bank_transfer' ? styles.selectedPayment : ''}
              style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 8, border: paymentMethod === 'bank_transfer' ? '2px solid #10b981' : '1px solid #e5e7eb', background: paymentMethod === 'bank_transfer' ? '#ecfdf5' : 'white' }}
              disabled={viewOnly}
            >
              Chuyển khoản ngân hàng
            </button>
          </div>

          {/* QR dropdown for bank transfer */}
          <div style={{ maxHeight: paymentMethod === 'bank_transfer' ? 240 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease', marginTop: 12 }}>
            <div style={{ padding: paymentMethod === 'bank_transfer' ? '12px' : '0 12px', background: '#fff', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>Quét mã QR để chuyển khoản hoặc chuyển khoản theo thông tin:</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
                <img src="../../payment_qr.jpg" alt="Bank QR" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, background: '#f3f4f6' }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div style={{ fontSize: 14, color: '#374151' }}>
                  <div><strong>Ngân hàng:</strong> MB Bank</div>
                  <div><strong>Chủ TK:</strong> TRAN QUOC ANH</div>
                  <div><strong>STK:</strong> 1129082004</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.totalsCard}>
          <div className={styles.totalsRow}><span>Tạm tính:</span><strong>{formatCurrency(orderTotals.subtotal)}</strong></div>
          <div className={styles.totalsRow}><span>Phí giao hàng:</span><strong>{formatCurrency(shippingFee)}</strong></div>
          <div className={styles.totalsRow} style={{ color: '#ef4444' }}><span>Giảm giá:</span><strong>- {formatCurrency(orderTotals.discount)}</strong></div>
          <div className={styles.totalsRow} style={{ fontSize: '1.2em', borderTop: '2px solid #e5e7eb', paddingTop: '8px' }}><span>Tổng cộng:</span><strong style={{ color: '#10b981' }}>{formatCurrency(orderTotals.total)}</strong></div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          {!viewOnly && <Button type="submit">{editingOrder ? 'Cập nhật' : 'Thêm'}</Button>}
        </div>
      </form>
    </Modal>
  );
};

export default OrderModal;
