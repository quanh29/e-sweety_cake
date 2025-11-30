import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: '/hero1.jpg',
            title: 'Bánh Ngọt Tươi Mỗi Ngày',
            subtitle: 'Được làm từ những nguyên liệu tự nhiên và tươi ngon nhất'
        },
        {
            image: '/hero2.jpg',
            title: 'Cupcake Đa Dạng',
            subtitle: 'Hương vị tuyệt hảo cho mọi dịp đặc biệt'
        },
        {
            image: '/hero3.jpg',
            title: 'Cookies Giòn Tan',
            subtitle: 'Thưởng thức cùng trà chiều ấm áp'
        },
        {
            image: '/hero4.jpg',
            title: 'Bánh Sinh Nhật Đặc Biệt',
            subtitle: 'Tùy chỉnh theo ý thích của bạn'
        }
    ];

    const scrollToProducts = (e) => {
        e.preventDefault();
        const element = document.getElementById('products');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className={styles.hero} id="home">
            <div className={styles.slideshow}>
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className={styles.overlay}></div>
                        <div className={styles.heroContent}>
                            <h2>{slide.title}</h2>
                            <p>{slide.subtitle}</p>
                            <a href="#products" className={styles.btn} onClick={scrollToProducts}>
                                Xem sản phẩm
                            </a>
                        </div>
                    </div>
                ))}

                <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide} aria-label="Previous slide">
                    <ChevronLeft size={32} />
                </button>
                <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide} aria-label="Next slide">
                    <ChevronRight size={32} />
                </button>

                <div className={styles.indicators}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.indicator} ${index === currentSlide ? styles.activeIndicator : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
