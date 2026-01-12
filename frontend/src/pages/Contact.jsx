import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import styles from './Contact.module.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ!');
            return;
        }

        setIsSubmitting(true);

        // Send to backend
        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${SERVER_URL}/api/contacts/public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.');
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                toast.error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.contactPage}>
            <PageTitle title="Liên Hệ" />
            <Header />

            {/* Contact Content */}
            <section className={styles.contactSection}>
                <div className={styles.container}>
                    <div className={styles.contactGrid}>
                        {/* Contact Form */}
                        <div className={styles.formContainer}>
                            <h2>Gửi Tin Nhắn</h2>
                            <p className={styles.formDescription}>
                                Điền thông tin vào form bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ.
                            </p>
                            <form onSubmit={handleSubmit} className={styles.contactForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Họ và tên <span>*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Email <span>*</span></label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="0123 456 789"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="message">Tin nhắn <span>*</span></label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="6"
                                        placeholder="Nhập nội dung tin nhắn của bạn..."
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className={styles.btnSubmit}
                                    disabled={isSubmitting}
                                >
                                    <Send size={20} />
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className={styles.infoContainer}>
                            <h2>Thông Tin Liên Hệ</h2>
                            <div className={styles.infoCards}>
                                <div className={styles.infoCard}>
                                    <div className={styles.iconWrapper}>
                                        <MapPin size={28} />
                                    </div>
                                    <div className={styles.infoContent}>
                                        <h3>Địa chỉ</h3>
                                        <p>Số 10 Đại Cồ Việt, quận Hai Bà Trưng<br /> Hà Nội, Việt Nam</p>
                                    </div>
                                </div>

                                <div className={styles.infoCard}>
                                    <div className={styles.iconWrapper}>
                                        <Phone size={28} />
                                    </div>
                                    <div className={styles.infoContent}>
                                        <h3>Điện thoại</h3>
                                        <p>
                                            <a href="tel:+84858974298">+84 858 974 298</a><br />
                                            <a href="tel:+84987654321">0987 654 321</a>
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.infoCard}>
                                    <div className={styles.iconWrapper}>
                                        <Mail size={28} />
                                    </div>
                                    <div className={styles.infoContent}>
                                        <h3>Email</h3>
                                        <p>
                                            <a href="mailto:esweetiebake@gmail.com">esweetiebake@gmail.com</a><br />
                                            <a href="mailto:contact@e-sweetiebake.online">contact@e-sweetiebake.online</a>
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.infoCard}>
                                    <div className={styles.iconWrapper}>
                                        <Clock size={28} />
                                    </div>
                                    <div className={styles.infoContent}>
                                        <h3>Giờ mở cửa</h3>
                                        <p>
                                            Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                                            Thứ 7 - CN: 9:00 - 21:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className={styles.mapSection}>
                        <h2>Tìm Chúng Tôi</h2>
                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4608809134153!2d106.69527731533397!3d10.776889992320597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb8b6c0d1b1c6b6c0!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6pu!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Sweet Bakery Location"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Contact;
