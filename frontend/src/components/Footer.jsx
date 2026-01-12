import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.footerGrid}>
                    {/* Company Info */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle}>
                            <i className="fas fa-birthday-cake"></i> E-sweetie Bake
                        </h3>
                        <p className={styles.footerDesc}>
                            Mang đến những chiếc bánh ngọt thơm ngon, được làm từ nguyên liệu tươi mới và tự nhiên nhất. 
                            Chúng tôi cam kết chất lượng và hương vị tuyệt hảo trong từng sản phẩm.
                        </p>
                        <div className={styles.socialLinks}>
                            <a href="https://www.facebook.com/profile.php?id=61581598021141" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook size={24} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram size={24} />
                            </a>
                            <a href="mailto:info@sweetbakery.com" aria-label="Email">
                                <Mail size={24} />
                            </a>
                        </div>
                        <div className={styles.certificationLogo}>
                            <a href="https://moit.gov.vn/" target="_blank" rel="noopener noreferrer">
                                <img src="/logo-da-thong-bao-bo-cong-thuong-mau-xanh.png" alt="Đã thông báo Bộ Công Thương" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Liên kết nhanh</h4>
                        <ul className={styles.linkList}>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li><a href="/#products">Sản phẩm</a></li>
                            <li><Link to="/about">Giới thiệu</Link></li>
                            <li><Link to="/contact">Liên hệ</Link></li>
                            <li><Link to="/policy">Chính sách</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Liên hệ</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <MapPin size={18} />
                                <span>Số 10 Đại Cồ Việt, quận Hai Bà Trưng, Hà Nội</span>
                            </li>
                            <li>
                                <Phone size={18} />
                                <span><a href="tel:+84858974298">+84 858 974 298</a></span>
                            </li>
                            <li>
                                <Mail size={18} />
                                <span><a href="mailto:contact@e-sweetiebake.online">contact@e-sweetiebake.online</a></span>
                            </li>
                            <li>
                                <Mail size={18} />
                                <span><a href="mailto:esweetiebake@gmail.com">esweetiebake@gmail.com</a></span>
                            </li>
                        </ul>
                    </div>

                    {/* Business Hours */}
                    <div className={styles.footerColumn}>
                        <h4 className={styles.columnTitle}>Giờ mở cửa</h4>
                        <ul className={styles.hoursList}>
                            <li>
                                <Clock size={18} />
                                <div>
                                    <strong>Thứ 2 - Thứ 6:</strong>
                                    <span>8:00 - 20:00</span>
                                </div>
                            </li>
                            <li>
                                <Clock size={18} />
                                <div>
                                    <strong>Thứ 7 - Chủ nhật:</strong>
                                    <span>9:00 - 21:00</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>&copy; {currentYear} E-sweetie Bake. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
