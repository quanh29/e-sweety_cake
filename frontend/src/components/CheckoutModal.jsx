import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { vouchers, formatPrice } from '../data';
import styles from './CheckoutModal.module.css';

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
    const { cart, getCartTotal, clearCart, showNotification } = useCart();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        note: ''
    });
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherMessage, setVoucherMessage] = useState('');
    const [voucherError, setVoucherError] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateDiscount = () => {
        if (!appliedVoucher) return 0;
        const subtotal = getCartTotal();
        if (appliedVoucher.type === 'percentage') {
            return Math.floor((subtotal * appliedVoucher.discount) / 100);
        }
        return appliedVoucher.discount;
    };

    const applyVoucher = () => {
        const code = voucherCode.trim().toUpperCase();
        if (!code) {
            setVoucherMessage('Vui lòng nhập mã voucher');
            setVoucherError(true);
            return;
        }

        const voucher = vouchers.find(v => v.code === code);
        if (!voucher) {
            setVoucherMessage('Mã voucher không hợp lệ');
            setVoucherError(true);
            return;
        }

        const subtotal = getCartTotal();
        if (subtotal < voucher.minOrder) {
            setVoucherMessage(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)} để sử dụng mã này`);
            setVoucherError(true);
            return;
        }

        setAppliedVoucher(voucher);
        setVoucherMessage('');
        setVoucherError(false);
        showNotification('Áp dụng mã giảm giá thành công!');
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherMessage('');
        setVoucherError(false);
        showNotification('Đã hủy mã giảm giá');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const subtotal = getCartTotal();
        const discount = calculateDiscount();
        const total = subtotal - discount;

        const orderData = {
            ...formData,
            items: cart,
            subtotal,
            discount,
            voucher: appliedVoucher ? {
                code: appliedVoucher.code,
                description: appliedVoucher.description,
                discount
            } : null,
            total,
            orderDate: new Date().toLocaleString('vi-VN'),
            paymentMethod: 'COD'
        };

        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart and close modal
        clearCart();
        setFormData({ fullName: '', phone: '', address: '', note: '' });
        setVoucherCode('');
        setAppliedVoucher(null);
        onClose();
        onSuccess();
    };

    const handleClose = () => {
        setVoucherCode('');
        setAppliedVoucher(null);
        setVoucherMessage('');
        setVoucherError(false);
        onClose();
    };

    if (!isOpen) return null;

    const subtotal = getCartTotal();
    const discount = calculateDiscount();
    const total = subtotal - discount;

    return (
        <>
            <div className={styles.overlay} onClick={handleClose}></div>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h3>Thông Tin Đặt Hàng</h3>
                        <button className={styles.closeModal} onClick={handleClose} aria-label="Đóng">
                            ×
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="fullName">Họ và tên người nhận *</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    pattern="[0-9]{10,11}"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="address">Địa chỉ giao hàng *</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="note">Ghi chú</label>
                                <textarea
                                    id="note"
                                    name="note"
                                    rows="2"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    placeholder="Yêu cầu đặc biệt (nếu có)"
                                ></textarea>
                            </div>

                            <div className={styles.orderSummary}>
                                <h4>Chi tiết đơn hàng</h4>
                                {cart.map(item => (
                                    <div key={item.id} className={styles.orderItem}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}

                                <div className={styles.voucherSection}>
                                    <label htmlFor="voucherCode">Mã giảm giá</label>
                                    <div className={styles.voucherInputGroup}>
                                        <input
                                            type="text"
                                            id="voucherCode"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            placeholder="Nhập mã voucher"
                                            disabled={!!appliedVoucher}
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            className={styles.btnApplyVoucher}
                                            onClick={applyVoucher}
                                            disabled={!!appliedVoucher}
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    {voucherMessage && (
                                        <div className={`${styles.voucherMessage} ${voucherError ? styles.error : styles.success}`}>
                                            {voucherMessage}
                                        </div>
                                    )}
                                    {appliedVoucher && (
                                        <div className={styles.voucherApplied}>
                                            <div className={styles.voucherInfo}>
                                                <i className="fas fa-tag"></i>
                                                <span>{appliedVoucher.code} - {appliedVoucher.description}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveVoucher}
                                                onClick={removeVoucher}
                                                aria-label="Hủy mã"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.orderSubtotal}>
                                    <span>Tạm tính:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className={styles.orderDiscount}>
                                        <span>Giảm giá:</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className={styles.orderTotal}>
                                    <span>Tổng cộng:</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className={styles.paymentMethod}>
                                    <i className="fas fa-money-bill-wave"></i>
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </div>
                            </div>

                            <button type="submit" className={styles.btnSubmit}>
                                <i className="fas fa-check"></i> Xác Nhận Đặt Hàng
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutModal;
