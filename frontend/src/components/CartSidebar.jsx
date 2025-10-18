import { useCart } from '../context/CartContext';
import { formatPrice } from '../data';
import styles from './CartSidebar.module.css';

const CartSidebar = ({ isOpen, onClose, onCheckout }) => {
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

    return (
        <>
            <div 
                className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
                onClick={onClose}
            ></div>
            <div className={`${styles.cartSidebar} ${isOpen ? styles.active : ''}`}>
                <div className={styles.cartHeader}>
                    <h3>Giỏ Hàng</h3>
                    <button className={styles.closeCart} onClick={onClose} aria-label="Đóng">
                        ×
                    </button>
                </div>
                <div className={styles.cartItems}>
                    {cart.length === 0 ? (
                        <div className={styles.cartEmpty}>
                            <i className="fas fa-shopping-cart"></i>
                            <p>Giỏ hàng trống</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.cartItemImage}>{item.image}</div>
                                <div className={styles.cartItemInfo}>
                                    <div className={styles.cartItemName}>{item.name}</div>
                                    <div className={styles.cartItemPrice}>{formatPrice(item.price)}</div>
                                    <div className={styles.cartItemQuantity}>
                                        <button 
                                            className={styles.quantityBtn}
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <i style={{ fontSize: '1rem' }}>-</i>
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            className={styles.quantityBtn}
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <i style={{ fontSize: '1rem' }}>+</i>
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    className={styles.removeItem}
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Xóa"
                                >
                                    <img src="/delete-svgrepo-com.svg" alt="Xóa" className={styles.removeIcon} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.cartFooter}>
                    <div className={styles.cartTotal}>
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <button 
                        className={styles.btn}
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                    >
                        Thanh Toán
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
