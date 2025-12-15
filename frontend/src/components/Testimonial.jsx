import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import styles from './Testimonial.module.css';

const Testimonial = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const autoPlayRef = useRef(null);

    const testimonials = [
        {
            id: 1,
            name: 'Nguyễn Thị Linh',
            role: 'Khách hàng thường xuyên',
            content: 'Mình hay mua bánh lẻ để mang lên lớp ăn chung với bạn. Bánh mềm, thơm, nhìn cũng rất xinh. Chụp hình up story là thấy đói liền 😆',
            rating: 5,
            image: '../../female_user.png'
        },
        {
            id: 2,
            name: 'Trần Minh Anh',
            role: 'Sinh viên',
            content: 'Bánh ngon hơn mong đợi luôn 😭 Mình mua bánh su kem ăn xế mà vỏ giòn, nhân béo nhưng không ngấy. Giá sinh viên nên sẽ quay lại mua tiếp.',
            rating: 5,
            image: '../../female_user.png'
        },
        {
            id: 3,
            name: 'Mai Nam Hải',
            role: 'Sinh viên năm 7',
            content: 'Bánh nhỏ nhưng chất lượng nha. Phù hợp mấy bữa học bài khuya cần đồ ngọt nhẹ nhẹ. Nhân viên tư vấn nhiệt tình, giao hàng nhanh nữa.',
            rating: 4,
            image: '../../male_user.png'
        },
        {
            id: 4,
            name: 'Võ Thanh Hùng',
            role: 'Khách hàng',
            content: 'E-sweetie Bake là lựa chọn hoàn hảo cho các buổi họp mặt công ty của chúng tôi. Bánh luôn đẹp, ngon, và được giao đúng thời gian. Rất cảm ơn đội ngũ.',
            rating: 5,
            image: '../../male_user.png'
        },
        {
            id: 5,
            name: 'Vũ Thị Hồng',
            role: 'Khách hàng',
            content: 'Mình rất yêu thích bánh từ E-sweetie Bake! Chất lượng ổn định, nhân viên thân thiện, lại giao hàng nhanh. Đã dùng nhiều lần rồi và lần nào cũng hài lòng.',
            rating: 5,
            image: '../../female_user.png'
        }
    ];

    useEffect(() => {
        if (!autoPlay) return;

        autoPlayRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [autoPlay, testimonials.length]);

    const handlePrev = () => {
        setAutoPlay(false);
        setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleNext = () => {
        setAutoPlay(false);
        setActiveIndex(prev => (prev + 1) % testimonials.length);
    };

    const goToSlide = (index) => {
        setAutoPlay(false);
        setActiveIndex(index);
    };

    const handleMouseEnter = () => setAutoPlay(false);
    const handleMouseLeave = () => setAutoPlay(true);

    return (
        <section className={styles.testimonialSection}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.sectionHeader}>
                    <h2>Trải Nghiệm Từ Khách Hàng</h2>
                    <p>Những lời cảm nhận chân thực từ khách hàng yêu mến</p>
                </div>

                {/* Slider */}
                <div 
                    className={styles.sliderWrapper}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Slides */}
                    <div className={styles.slidesContainer}>
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                className={`${styles.slide} ${
                                    index === activeIndex ? styles.active : ''
                                } ${
                                    index < activeIndex ? styles.prev : ''
                                }`}
                            >
                                <div className={styles.slideContent}>
                                    {/* Stars */}
                                    <div className={styles.stars}>
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                className={styles.star}
                                                fill="#d4a574"
                                            />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className={styles.quote}>"{testimonial.content}"</p>

                                    {/* Author */}
                                    <div className={styles.author}>
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className={styles.authorImage}
                                        />
                                        <div className={styles.authorInfo}>
                                            <h3>{testimonial.name}</h3>
                                            <p>{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        className={styles.navButton}
                        onClick={handlePrev}
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        className={styles.navButton}
                        onClick={handleNext}
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className={styles.dots}>
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.dot} ${
                                    index === activeIndex ? styles.active : ''
                                }`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
