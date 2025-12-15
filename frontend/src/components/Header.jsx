import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

const Header = ({ onCartClick }) => {
    const { getCartItemsCount } = useCart();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        setMenuOpen(false);
        
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

    const handleLinkClick = () => {
        setMenuOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <img src="/logo.png" alt="E-sweetie Bake Logo" className={styles.logoImage} />
                    <h1>E-sweetie Bake</h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    <ul>
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><a href="/#products" onClick={(e) => scrollToSection(e, 'products')}>Sản phẩm</a></li>
                        <li><Link to="/about">Giới thiệu</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
                    </ul>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuButton}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={styles.cartIcon} onClick={() => { if (onCartClick) onCartClick(); else window.dispatchEvent(new Event('openCart')); }}>
                    <img src="/cart-shopping-svgrepo-com.svg" alt="Giỏ hàng" className={styles.cartImage} />
                    <span className={styles.cartCount}>{getCartItemsCount()}</span>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`${styles.mobileNav} ${menuOpen ? styles.open : ''}`}>
                <ul>
                    <li><Link to="/" onClick={handleLinkClick}>Trang chủ</Link></li>
                    <li><a href="/#products" onClick={(e) => scrollToSection(e, 'products')}>Sản phẩm</a></li>
                    <li><Link to="/about" onClick={handleLinkClick}>Giới thiệu</Link></li>
                    <li><Link to="/faq" onClick={handleLinkClick}>FAQ</Link></li>
                    <li><Link to="/contact" onClick={handleLinkClick}>Liên hệ</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
