import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div className={styles.productCard} onClick={handleCardClick}>
            <div className={styles.productImageContainer}>
                <img src={product.image} alt={product.name} className={styles.productImage} />
            </div>
            <div className={styles.separator}>
                <div className={styles.separatorLine}></div>
                <div className={styles.separatorDot}></div>
                <div className={styles.separatorLine}></div>
            </div>
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}></p>
                <div className={styles.productPrice}>{formatPrice(product.price)}</div>
                <div className={styles.productActions}>
                    <button className={styles.btn} onClick={handleAddToCart}>
                        <img src="/cart-plus-svgrepo-com.svg" alt="Thêm vào giỏ" className={styles.btnIcon} />
                        <span className={styles.btnTextFull}>Thêm vào giỏ hàng</span>
                        <span className={styles.btnTextShort}>Thêm vào giỏ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
