import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

const Header = ({ onCartClick }) => {
    const { getCartItemsCount } = useCart();
    const location = useLocation();

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        
        // If not on home page, navigate to home first
        if (location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
            return;
        }
        
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <img src="/logo.png" alt="E-sweetie Bake Logo" className={styles.logoImage} />
                    <h1>E-sweetie Bake</h1>
                </Link>
                <nav className={styles.nav}>
                    <ul>
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><a href="/#products" onClick={(e) => scrollToSection(e, 'products')}>Sản phẩm</a></li>
                        <li><Link to="/about">Giới thiệu</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
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
