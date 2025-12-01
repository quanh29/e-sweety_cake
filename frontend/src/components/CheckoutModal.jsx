import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data';
import { publicAPI } from '../utils/api';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVoucherForm, setShowVoucherForm] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateDiscount = () => {
        if (!appliedVoucher) return 0;
        const subtotal = getCartTotal();
        if (appliedVoucher.type === 'percentage') {
            return Math.floor((subtotal * appliedVoucher.value) / 100);
        }
        return appliedVoucher.value;
    };

    const applyVoucher = async () => {
        const code = voucherCode.trim().toUpperCase();
        if (!code) {
            setVoucherMessage('Vui lòng nhập mã voucher');
            setVoucherError(true);
            return;
        }

        try {
            const voucher = await publicAPI.validateVoucher(code);
            
            const subtotal = getCartTotal();
            if (voucher.minPurchase && subtotal < voucher.minPurchase) {
                setVoucherMessage(`Đơn hàng tối thiểu ${formatPrice(voucher.minPurchase)} để sử dụng mã này`);
                setVoucherError(true);
                return;
            }

            setAppliedVoucher(voucher);
            setVoucherMessage('');
            setVoucherError(false);
            showNotification('Áp dụng mã giảm giá thành công!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Mã voucher không hợp lệ';
            setVoucherMessage(errorMessage);
            setVoucherError(true);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherMessage('');
        setVoucherError(false);
        setShowVoucherForm(false);
        showNotification('Đã hủy mã giảm giá');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const subtotal = getCartTotal();
            const discount = calculateDiscount();
            const total = subtotal - discount;

            // Prepare order data for backend API
            const orderData = {
                customerName: formData.fullName,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                note: formData.note,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                voucherCode: appliedVoucher ? appliedVoucher.code : null,
                shippingFee: 0, // You can add shipping fee calculation if needed
                subtotal,
                discount,
                total
            };

            // Call public API to create order
            const result = await publicAPI.createOrder(orderData);

            // Clear cart and close modal
            clearCart();
            setFormData({ fullName: '', phone: '', address: '', note: '' });
            setVoucherCode('');
            setAppliedVoucher(null);
            onClose();
            onSuccess(result);
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.';
            showNotification(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setVoucherCode('');
        setAppliedVoucher(null);
        setVoucherMessage('');
        setVoucherError(false);
        setShowVoucherForm(false);
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
                                    {!appliedVoucher ? (
                                        <>
                                            <button
                                                type="button"
                                                className={styles.btnToggleVoucher}
                                                onClick={() => setShowVoucherForm(!showVoucherForm)}
                                            >
                                                <Tag size={18} />
                                                <span>Sử dụng mã giảm giá</span>
                                                {showVoucherForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            
                                            {showVoucherForm && (
                                                <div className={styles.voucherFormWrapper}>
                                                    <div className={styles.voucherInputGroup}>
                                                        <input
                                                            type="text"
                                                            id="voucherCode"
                                                            value={voucherCode}
                                                            onChange={(e) => setVoucherCode(e.target.value)}
                                                            placeholder="Nhập mã voucher"
                                                            autoComplete="off"
                                                        />
                                                        <button
                                                            type="button"
                                                            className={styles.btnApplyVoucher}
                                                            onClick={applyVoucher}
                                                        >
                                                            Áp dụng
                                                        </button>
                                                    </div>
                                                    {voucherMessage && (
                                                        <div className={`${styles.voucherMessage} ${voucherError ? styles.error : styles.success}`}>
                                                            {voucherMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={styles.voucherApplied}>
                                            <div className={styles.voucherInfo}>
                                                <Tag size={20} />
                                                <span>{appliedVoucher.code} - {appliedVoucher.voucherName}</span>
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

                            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                                <i className="fas fa-check"></i> {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutModal;
