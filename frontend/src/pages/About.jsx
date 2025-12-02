import { useEffect, useRef, useState } from 'react';
import { Award, Heart, Clock, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import styles from './About.module.css';

const About = () => {
    const [visibleStacks, setVisibleStacks] = useState([]);
    const stackRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.index);
                        setVisibleStacks(prev => [...new Set([...prev, index])]);
                    }
                });
            },
            { threshold: 0.3 }
        );

        stackRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            stackRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, []);

    const stacks = [
        {
            image: '/hero1.jpg',
            title: 'Câu Chuyện Của Chúng Tôi',
            content: 'Sweet Bakery được thành lập với niềm đam mê tạo ra những chiếc bánh ngọt tuyệt vời nhất. Khởi đầu từ một cửa hàng nhỏ, chúng tôi đã không ngừng phát triển và hoàn thiện kỹ năng làm bánh để mang đến cho khách hàng những sản phẩm chất lượng cao nhất.',
            reverse: false
        },
        {
            image: '/hero2.jpg',
            title: 'Đội Ngũ Chuyên Nghiệp',
            content: 'Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi tự hào là địa chỉ tin cậy của hàng ngàn khách hàng. Mỗi chiếc bánh không chỉ là món ăn ngon mà còn chứa đựng tình yêu và sự tận tâm của đội ngũ thợ làm bánh chuyên nghiệp.',
            reverse: true
        },
        {
            image: '/hero3.jpg',
            title: 'Nguyên Liệu Tự Nhiên',
            content: 'Chúng tôi cam kết sử dụng 100% nguyên liệu tự nhiên, tươi mới được nhập khẩu từ các nguồn uy tín. Mỗi thành phần đều được lựa chọn kỹ lưỡng để đảm bảo chất lượng và hương vị tuyệt hảo nhất cho sản phẩm.',
            reverse: false
        },
        {
            image: '/hero4.jpg',
            title: 'Sứ Mệnh Của Chúng Tôi',
            content: 'Sứ mệnh của chúng tôi là mang đến niềm vui và hạnh phúc cho mọi người qua những chiếc bánh thơm ngon. Chúng tôi tin rằng mỗi chiếc bánh không chỉ là món tráng miệng mà còn là cầu nối kết nối yêu thương giữa những người thân yêu.',
            reverse: true
        }
    ];

    return (
        <div className={styles.aboutPage}>
            <PageTitle title="Giới Thiệu" />
            <Header />
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1>Về Chúng Tôi</h1>
                </div>
            </section>

            {/* Scroll Stack Sections */}
            <div className={styles.stackContainer}>
                {stacks.map((stack, index) => (
                    <section
                        key={index}
                        className={`${styles.stackSection} ${visibleStacks.includes(index) ? styles.stackVisible : ''}`}
                        ref={(el) => (stackRefs.current[index] = el)}
                        data-index={index}
                    >
                        <div className={styles.stackInner}>
                            <div className={`${styles.storyGrid} ${stack.reverse ? styles.reverse : ''}`}>
                                <div className={styles.storyImage}>
                                    <img src={stack.image} alt={stack.title} className={styles.stackImage} />
                                </div>
                                <div className={styles.storyContent}>
                                    <h2>{stack.title}</h2>
                                    <p>{stack.content}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* Features Section */}
            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Điều Làm Nên Đặc Biệt</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Heart size={40} />
                            </div>
                            <h3>Làm bằng tình yêu</h3>
                            <p>Mỗi chiếc bánh được làm với sự tận tâm và đam mê, mang đến hương vị tuyệt hảo nhất.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Award size={40} />
                            </div>
                            <h3>Chất lượng hàng đầu</h3>
                            <p>Chúng tôi chỉ sử dụng nguyên liệu tươi ngon và chất lượng cao nhất từ các nguồn uy tín.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Clock size={40} />
                            </div>
                            <h3>Tươi mỗi ngày</h3>
                            <p>Bánh được làm tươi mỗi ngày để đảm bảo độ tươi ngon và hương vị tốt nhất.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <Users size={40} />
                            </div>
                            <h3>Phục vụ tận tâm</h3>
                            <p>Đội ngũ của chúng tôi luôn sẵn sàng tư vấn và phục vụ bạn với thái độ thân thiện nhất.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Giá Trị Cốt Lõi</h2>
                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <h3>Chất Lượng</h3>
                            <p>Cam kết sử dụng nguyên liệu tốt nhất và quy trình sản xuất chặt chẽ</p>
                        </div>
                        <div className={styles.valueCard}>
                            <h3>Sáng Tạo</h3>
                            <p>Không ngừng đổi mới và sáng tạo các sản phẩm mới độc đáo</p>
                        </div>
                        <div className={styles.valueCard}>
                            <h3>Tận Tâm</h3>
                            <p>Phục vụ khách hàng với sự nhiệt tình và chuyên nghiệp nhất</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <h2>Sẵn Sàng Thưởng Thức?</h2>
                    <p>Ghé thăm cửa hàng hoặc đặt hàng online ngay hôm nay!</p>
                    <div className={styles.ctaButtons}>
                        <a href="/" className={styles.btnPrimary}>Xem Sản Phẩm</a>
                        <a href="/contact" className={styles.btnSecondary}>Liên Hệ Chúng Tôi</a>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default About;
