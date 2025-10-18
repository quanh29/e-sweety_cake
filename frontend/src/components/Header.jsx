import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

const Header = ({ onCartClick }) => {
    const { getCartItemsCount } = useCart();

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <i className="fas fa-birthday-cake"></i>
                    <h1>Sweet Bakery</h1>
                </div>
                <nav className={styles.nav}>
                    <ul>
                        <li><a href="#home" onClick={(e) => scrollToSection(e, 'home')}>Trang chủ</a></li>
                        <li><a href="#products" onClick={(e) => scrollToSection(e, 'products')}>Sản phẩm</a></li>
                        <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>Giới thiệu</a></li>
                        <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Liên hệ</a></li>
                    </ul>
                </nav>
                <div className={styles.cartIcon} onClick={onCartClick}>
                    <img src="/cart-shopping-svgrepo-com.svg" alt="Giỏ hàng" className={styles.cartImage} />
                    <span className={styles.cartCount}>{getCartItemsCount()}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
