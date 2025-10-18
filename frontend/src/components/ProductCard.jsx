import { useCart } from '../context/CartContext';
import { formatPrice } from '../data';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.productImage}>{product.image}</div>
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productPrice}>{formatPrice(product.price)}</div>
                <div className={styles.productActions}>
                    <button className={styles.btn} onClick={handleAddToCart}>
                        <img src="/cart-plus-svgrepo-com.svg" alt="Thêm vào giỏ" className={styles.btnIcon} /> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
